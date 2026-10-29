// Operator-only one-time replacement for the existing pilot Admin credential.
// Never imported by API routes. Does not create principals, issue learner codes,
// change environment variables, grant privileges, or deploy.
'use strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { neon } = require('@neondatabase/serverless');
const { PILOT, parsePilotUrl } = require('../server/runtime-policy.cjs');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OLD_REPOSITORY = resolve(ROOT, '../vita-reale-vercel/vita-reale');
const CONFIRMATION = 'REPLACE EXISTING PILOT ADMIN';
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function ensure(value) {
  if (!value) throw new Error('Preflight failed');
}

function rows(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
}

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel));
}

function readProjectConfig(path = join(ROOT, '.vercel', 'project.json')) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    throw new Error('Vercel project link unavailable');
  }
}

function validateVaultPath(value, localAppData, platform = process.platform) {
  ensure(platform === 'win32');
  ensure(typeof value === 'string' && isAbsolute(value) && value.toLowerCase().endsWith('.dpapi'));
  ensure(typeof localAppData === 'string' && isAbsolute(localAppData));
  const localRoot = resolve(localAppData);
  const vault = resolve(value);
  const operatorDir = resolve(localRoot, 'VitaReale', 'AdminRecovery');
  ensure(inside(operatorDir, vault) && dirname(vault) === operatorDir);
  ensure(!inside(ROOT, vault) && !inside(OLD_REPOSITORY, vault));
  ensure(!inside(vault, ROOT) && !inside(vault, OLD_REPOSITORY));
  ensure(!existsSync(vault));
  ensure(realpathSync(localRoot).toLowerCase() === localRoot.toLowerCase());
  return vault;
}

function validateSecret(secret) {
  ensure(typeof secret === 'string' && /^[A-Za-z0-9_-]{43}$/.test(secret));
  const bytes = Buffer.from(secret, 'base64url');
  ensure(bytes.length === 32 && bytes.toString('base64url') === secret);
  return bytes;
}

function adminCredentialHash(secretBytes, adminKey) {
  return createHmac('sha256', secretBytes)
    .update('vita-reale-arabic:pilot:v1:admin_credential:' + adminKey)
    .digest('hex');
}

function assertOwnerUrl(value) {
  const url = parsePilotUrl(value, PILOT.owner);
  ensure(url.hostname === PILOT.directHost);
  return url;
}

const RUNTIME_AND_ACCOUNT_GRANT_SQL = `
SELECT r.rolcanlogin, r.rolsuper, r.rolbypassrls, r.rolcreaterole,
       r.rolcreatedb, r.rolreplication, r.rolinherit,
       (SELECT count(*)::int FROM pg_catalog.pg_auth_members m WHERE m.member=r.oid) AS memberships,
       p.prosecdef, p.proconfig,
       owner_role.rolname AS function_owner,
       has_function_privilege('vita_pilot_app', p.oid, 'EXECUTE') AS can_execute,
       has_function_privilege('vita_pilot_app', p.oid, 'EXECUTE WITH GRANT OPTION') AS can_grant,
       has_table_privilege('vita_pilot_app', 'vita_pilot.admin_credentials',
                           'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') AS direct_admin_table_access
FROM pg_catalog.pg_roles r
JOIN pg_catalog.pg_proc p ON p.oid=to_regprocedure('vita_pilot.account_request(text,jsonb)')
JOIN pg_catalog.pg_roles owner_role ON owner_role.oid=p.proowner
WHERE r.rolname='vita_pilot_app'`;

const ACTIVE_ADMIN_SQL = `
SELECT p.id::text AS admin_id
FROM vita_pilot.admin_principals p
JOIN vita_pilot.admin_credentials c ON c.admin_id=p.id
WHERE p.app_id='vita-reale-arabic' AND p.environment='pilot'
  AND p.revoked_at IS NULL
  AND c.enabled AND c.revoked_at IS NULL
  AND c.expires_at > clock_timestamp()`;

const SET_RECOVERY_CONTEXT_SQL = `
SELECT set_config('vita_pilot.recovery_admin_id', $1, true),
       set_config('vita_pilot.recovery_hash', $2, true),
       set_config('vita_pilot.recovery_expires', $3, true),
       set_config('vita_pilot.recovery_request_id', $4, true)`;

const APPLY_REPLACEMENT_SQL = `
DO $replace_admin$
DECLARE
  aid uuid := current_setting('vita_pilot.recovery_admin_id')::uuid;
  new_hash bytea := decode(current_setting('vita_pilot.recovery_hash'), 'hex');
  new_expiry timestamptz := current_setting('vita_pilot.recovery_expires')::timestamptz;
  request_id uuid := current_setting('vita_pilot.recovery_request_id')::uuid;
  active_count integer;
  changed integer;
BEGIN
  SELECT count(*) INTO active_count
  FROM vita_pilot.admin_principals p
  JOIN vita_pilot.admin_credentials c ON c.admin_id=p.id
  WHERE p.app_id='vita-reale-arabic' AND p.environment='pilot'
    AND p.revoked_at IS NULL AND c.enabled AND c.revoked_at IS NULL
    AND c.expires_at > clock_timestamp();
  IF active_count <> 1 THEN
    RAISE EXCEPTION 'Replacement precondition failed' USING ERRCODE='42501';
  END IF;

  PERFORM 1
  FROM vita_pilot.admin_principals p
  JOIN vita_pilot.admin_credentials c ON c.admin_id=p.id
  WHERE p.id=aid AND p.app_id='vita-reale-arabic' AND p.environment='pilot'
    AND p.revoked_at IS NULL AND c.enabled AND c.revoked_at IS NULL
    AND c.expires_at > clock_timestamp()
  FOR UPDATE OF p, c;
  IF NOT FOUND OR octet_length(new_hash) <> 32 OR new_expiry <= clock_timestamp() THEN
    RAISE EXCEPTION 'Replacement target unavailable' USING ERRCODE='42501';
  END IF;

  UPDATE vita_pilot.admin_credentials
  SET credential_hash=new_hash,
      created_at=clock_timestamp(),
      expires_at=new_expiry,
      revoked_at=NULL,
      enabled=true
  WHERE admin_id=aid AND enabled AND revoked_at IS NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Credential replacement failed' USING ERRCODE='42501';
  END IF;

  UPDATE vita_pilot.admin_sessions
  SET revoked_at=clock_timestamp()
  WHERE admin_id=aid AND revoked_at IS NULL;

  INSERT INTO vita_pilot.admin_audit_log
    (actor_admin_id, action, target_kind, target_id, metadata)
  VALUES
    (aid, 'admin.credential.replace', 'admin_principal', aid,
     jsonb_build_object('reason_code', 'owner_authorized_credential_replacement',
                        'request_id', request_id::text));
END $replace_admin$`;

const VERIFY_REPLACEMENT_SQL = `
SELECT p.id::text AS admin_id,
       c.enabled AND c.revoked_at IS NULL AND c.expires_at > clock_timestamp()
         AND c.credential_hash=decode($2, 'hex') AS replacement_active,
       NOT EXISTS (
         SELECT 1 FROM vita_pilot.admin_sessions s
         WHERE s.admin_id=p.id AND s.revoked_at IS NULL
       ) AS old_sessions_revoked,
       EXISTS (
         SELECT 1 FROM vita_pilot.admin_audit_log a
         WHERE a.actor_admin_id=p.id
           AND a.action='admin.credential.replace'
           AND a.metadata->>'request_id'=$3
       ) AS audit_written
FROM vita_pilot.admin_principals p
JOIN vita_pilot.admin_credentials c ON c.admin_id=p.id
WHERE p.id=$1::uuid AND p.app_id='vita-reale-arabic' AND p.environment='pilot'
  AND p.revoked_at IS NULL`;

export async function protectReplacementVault(vaultPath, content, deps = {}) {
  const spawnChild = deps.spawn || spawn;
  const localAppData = deps.localAppData || process.env.LOCALAPPDATA;
  const safePath = validateVaultPath(vaultPath, localAppData, deps.platform || process.platform);
  const script = join(ROOT, 'scripts', 'protect-pilot-admin-vault.ps1');
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawnChild('pwsh.exe', [
      '-NoProfile', '-NonInteractive', '-File', script, '-VaultPath', safePath,
    ], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      child.kill();
      rejectPromise(new Error('DPAPI vault unavailable'));
    };
    const timer = setTimeout(fail, 15000);
    child.stdout.on('data', chunk => {
      output += chunk.toString('utf8');
      if (output.length > 128) fail();
    });
    child.stderr.on('data', () => {});
    child.on('error', () => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        rejectPromise(new Error('DPAPI vault unavailable'));
      }
    });
    child.on('close', code => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (code === 0 && output === '{"protected":true}') resolvePromise(true);
      else rejectPromise(new Error('DPAPI vault unavailable'));
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify(content));
  });
}

export async function replacePilotAdmin(options, deps = {}) {
  const phase = { value: 'preflight' };
  const result = {
    status: 'FAIL',
    phase: phase.value,
    project: PILOT.vercelProjectName,
    replacementCommitted: false,
    principalPreserved: false,
    sessionsRevoked: false,
    credentialOutput: false,
    environmentChanged: false,
    privilegesChanged: false,
    deployed: false,
  };
  let secretBytes;
  let keyBytes;
  let vaultWritten = false;
  let transactionError = false;
  try {
    const projectConfig = options.projectConfig || readProjectConfig(options.projectConfigPath);
    ensure(projectConfig.projectId === PILOT.vercelProjectId);
    ensure(projectConfig.orgId === PILOT.vercelTeamId);
    ensure(options.verifiedBranch === PILOT.branchId);
    ensure(options.confirmation === CONFIRMATION);
    ensure(options.environment === 'production');
    ensure(options.origin === 'https://vita-reale-arabic-demo.vercel.app');
    ensure(options.vaultPath && (deps.platform || process.platform) === 'win32');

    secretBytes = validateSecret(options.authSecret ?? process.env.PILOT_AUTH_SECRET ?? '');
    const localAppData = options.localAppData || process.env.LOCALAPPDATA;
    const vaultPath = validateVaultPath(options.vaultPath, localAppData, deps.platform || process.platform);
    const operator = assertOwnerUrl(options.operatorUrl);
    phase.value = 'database identity';
    const db = (deps.connect || neon)(operator.toString());
    const identity = rows(await db.query(
      'SELECT current_user AS role, current_database() AS database'));
    ensure(identity.length === 1 && identity[0].role === PILOT.owner);
    ensure(identity[0].database === PILOT.database);

    phase.value = 'migration and runtime privilege verification';
    const manifest = JSON.parse(readFileSync(join(ROOT, 'db', 'migrations', 'manifest.json'), 'utf8'));
    const ledger = rows(await db.query(
      'SELECT version, checksum FROM vita_pilot.schema_migrations ORDER BY version'));
    ensure(JSON.stringify(ledger) === JSON.stringify(
      manifest.migrations.map(item => ({ version: item.version, checksum: item.checksum }))));

    const roleRows = rows(await db.query(RUNTIME_AND_ACCOUNT_GRANT_SQL));
    ensure(roleRows.length === 1);
    const role = roleRows[0];
    ensure(role.rolcanlogin === true);
    for (const flag of ['rolsuper', 'rolbypassrls', 'rolcreaterole', 'rolcreatedb',
      'rolreplication', 'rolinherit']) ensure(role[flag] === false);
    ensure(Number(role.memberships) === 0);
    ensure(role.prosecdef === true && role.function_owner === PILOT.owner);
    ensure(JSON.stringify(role.proconfig) === JSON.stringify(['search_path=pg_catalog, vita_pilot']));
    ensure(role.can_execute === true && role.can_grant === false);
    ensure(role.direct_admin_table_access === false);

    const admins = rows(await db.query(ACTIVE_ADMIN_SQL));
    ensure(admins.length === 1 && admins[0].admin_id);
    const adminId = admins[0].admin_id;
    phase.value = 'vault target verification';
    ensure(typeof options.operatorUrl === 'string' && options.operatorUrl.length <= 16384);

    // No key is generated until project, branch, environment, database,
    // migration, runtime-grant, current principal and explicit owner phrase pass.
    phase.value = 'credential preparation';
    keyBytes = (deps.randomBytes || randomBytes)(32);
    ensure(Buffer.isBuffer(keyBytes) && keyBytes.length === 32);
    const adminKey = keyBytes.toString('base64url');
    ensure(/^[A-Za-z0-9_-]{43}$/.test(adminKey));
    const hash = adminCredentialHash(secretBytes, adminKey);
    const requestId = (deps.randomUUID || randomUUID)();
    const now = (deps.now || Date.now)();
    const expiresAt = new Date(now + WINDOW_MS).toISOString();
    const vaultPayload = {
      formatVersion: 1,
      project: PILOT.vercelProjectName,
      team: PILOT.vercelTeamId,
      branch: PILOT.branchId,
      database: PILOT.database,
      adminId,
      adminKey,
      createdAt: new Date(now).toISOString(),
      expiresAt,
      purpose: 'owner-authorized-admin-credential-replacement',
    };
    phase.value = 'DPAPI vault';
    const vault = deps.vault || protectReplacementVault;
    await vault(vaultPath, vaultPayload, { localAppData, platform: deps.platform });
    vaultWritten = true;
    phase.value = 'atomic credential replacement';
    const tx = [
      db.query(SET_RECOVERY_CONTEXT_SQL, [adminId, hash, expiresAt, requestId]),
      db.query(APPLY_REPLACEMENT_SQL),
    ];
    try {
      await db.transaction(tx);
    } catch {
      transactionError = true;
    }
    phase.value = 'replacement verification';
    const verified = rows(await db.query(VERIFY_REPLACEMENT_SQL, [adminId, hash, requestId]));
    ensure(verified.length === 1 && verified[0].admin_id === adminId);
    ensure(verified[0].replacement_active === true);
    ensure(verified[0].old_sessions_revoked === true);
    ensure(verified[0].audit_written === true);
    result.status = 'PASS';
    result.phase = 'complete';
    result.replacementCommitted = true;
    result.principalPreserved = true;
    result.sessionsRevoked = true;
    result.vaultProtected = vaultWritten;
    result.vaultCandidateMarker = 'use only after PASS';
    result.transactionResponseRecovered = transactionError;
    return result;
  } catch {
    result.phase = phase.value;
    result.vaultProtected = vaultWritten;
    result.vaultCandidateMarker = vaultWritten
      ? 'protected candidate; do not use unless this run reports PASS'
      : phase.value === 'DPAPI vault'
        ? 'vault not confirmed; do not use any file; database transaction was not started'
        : 'not created';
    return result;
  } finally {
    if (secretBytes) secretBytes.fill(0);
    if (keyBytes) keyBytes.fill(0);
    if (options.authSecret === undefined) process.env.PILOT_AUTH_SECRET = '';
  }
}

async function readLineHidden(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Interactive terminal required');
  }
  process.stdout.write(prompt);
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let value = '';
  return new Promise((resolvePromise, rejectPromise) => {
    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
    };
    const onData = chunk => {
      for (const char of chunk) {
        if (char === '\u0003') {
          cleanup();
          rejectPromise(new Error('Cancelled'));
          return;
        }
        if (char === '\r' || char === '\n') {
          cleanup();
          process.stdout.write('\n');
          resolvePromise(value);
          return;
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (value.length < 16384) value += char;
      }
    };
    process.stdin.on('data', onData);
  });
}

async function readConfirmation() {
  if (!process.stdin.isTTY) throw new Error('Interactive terminal required');
  const { createInterface } = await import('node:readline/promises');
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const value = await readline.question(
      'Type REPLACE EXISTING PILOT ADMIN to authorize this one-time replacement: ');
    return value.trim();
  } finally {
    readline.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verified-branch') options.verifiedBranch = args[++i];
    else if (args[i] === '--vault-file') options.vaultPath = args[++i];
    else throw new Error('Unsupported option');
  }
  try {
    ensure(options.verifiedBranch === PILOT.branchId);
    ensure(options.vaultPath);
    ensure(process.env.VERCEL_ENV === 'production');
    ensure(process.env.PILOT_ORIGIN === 'https://vita-reale-arabic-demo.vercel.app');
    process.stdout.write('Target: vita-reale-arabic-demo / production / isolated pilot branch.\n');
    const confirmation = await readConfirmation();
    if (confirmation !== CONFIRMATION) throw new Error('Confirmation failed');
    const operatorUrl = await readLineHidden('Enter the pilot owner database URL (input hidden): ');
    const result = await replacePilotAdmin({
      ...options,
      operatorUrl,
      confirmation,
      environment: process.env.VERCEL_ENV,
      origin: process.env.PILOT_ORIGIN,
    });
    process.stdout.write(JSON.stringify(result) + '\n');
    process.exitCode = result.status === 'PASS' ? 0 : 1;
  } catch {
    process.stdout.write('{"status":"FAIL","phase":"operator preflight"}\n');
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => {
    process.stdout.write('{"status":"FAIL","phase":"operator input"}\n');
    process.exitCode = 1;
  });
}
