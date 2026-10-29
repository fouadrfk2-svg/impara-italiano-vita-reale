import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDatabase, rollback, ADMIN } from '../helpers/pilot-account.cjs';
import { replacePilotAdmin } from '../../scripts/replace-pilot-admin.mjs';
import { PILOT } from '../../server/runtime-policy.cjs';
import { createHandler } from '../../server/account-api.cjs';

const SECRET = 'A'.repeat(43);
const OLD_KEY = 'D'.repeat(43);
const OPERATOR_URL = 'postgresql://vita_reale_test_owner:synthetic@ep-nameless-field-b9iui2w8.c-7.eu-central-1.aws.neon.tech/vita_reale_test?sslmode=require';
const CONFIRMATION = 'REPLACE EXISTING PILOT ADMIN';
const PROJECT_CONFIG = { projectId: PILOT.vercelProjectId, orgId: PILOT.vercelTeamId };
const ROOT_FOR_VAULT = realpathSync(tmpdir());

function hmac(purpose, value) {
  return createHmac('sha256', Buffer.from(SECRET, 'base64url'))
    .update('vita-reale-arabic:pilot:v1:' + purpose + ':' + value).digest('hex');
}

function lazyAdapter(pg, { failAfterStatements = false, failAfterCommit = false } = {}) {
  const makeQuery = (sql, params = []) => ({
    sql,
    params,
    then(resolve, reject) {
      return Promise.resolve().then(async () => (await pg.query(sql, params)).rows).then(resolve, reject);
    },
  });
  return {
    query: makeQuery,
    async transaction(queries) {
      await pg.exec('BEGIN');
      try {
        const results = [];
        for (const query of queries) results.push((await pg.query(query.sql, query.params)).rows);
        if (failAfterStatements) throw new Error('synthetic commit interruption');
        await pg.exec('COMMIT');
        if (failAfterCommit) throw new Error('synthetic lost transaction response');
        return results;
      } catch (error) {
        await pg.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

async function fixture(flags = {}) {
  const pg = await createDatabase();
  await pg.exec('GRANT EXECUTE ON FUNCTION vita_pilot.account_request(text,jsonb) TO vita_pilot_app');
  await pg.query('INSERT INTO vita_pilot.admin_principals(id) VALUES($1::uuid)', [ADMIN]);
  await pg.query(
    `INSERT INTO vita_pilot.admin_credentials(admin_id,credential_hash,expires_at,enabled)
     VALUES($1::uuid,decode($2,'hex'),clock_timestamp()+interval '20 days',true)`,
    [ADMIN, hmac('admin_credential', OLD_KEY)],
  );
  await pg.query(
    `INSERT INTO vita_pilot.admin_sessions(admin_id,token_hash,expires_at)
     VALUES($1::uuid,decode($2,'hex'),clock_timestamp()+interval '1 hour')`,
    [ADMIN, 'ab'.repeat(32)],
  );
  const calls = { vault: [], connect: 0, random: 0 };
  const options = {
    projectConfig: { ...PROJECT_CONFIG },
    verifiedBranch: PILOT.branchId,
    confirmation: CONFIRMATION,
    environment: 'production',
    origin: 'https://vita-reale-arabic-demo.vercel.app',
    operatorUrl: OPERATOR_URL,
    vaultPath: join(ROOT_FOR_VAULT, 'VitaReale', 'AdminRecovery', 'replacement.dpapi'),
    localAppData: ROOT_FOR_VAULT,
    authSecret: SECRET,
  };
  const deps = {
    platform: 'win32',
    now: () => Date.UTC(2026, 9, 29),
    randomBytes: size => { calls.random++; return Buffer.alloc(size, 0x42); },
    randomUUID: () => '30000000-0000-4000-8000-000000000099',
    vault: async (path, payload) => {
      calls.vault.push({ path, payload });
      if (flags.vaultFails) throw new Error('synthetic vault failure');
    },
    connect: url => {
      calls.connect++;
      assert.equal(new URL(url).hostname, PILOT.directHost);
      return lazyAdapter(pg, flags);
    },
  };
  return { pg, calls, options, deps };
}

async function currentState(pg) {
  return (await pg.query(
    `SELECT encode(c.credential_hash,'hex') AS hash, c.enabled, c.revoked_at,
            (SELECT count(*)::int FROM vita_pilot.admin_sessions s WHERE s.admin_id=c.admin_id AND s.revoked_at IS NULL) AS active_sessions,
            (SELECT count(*)::int FROM vita_pilot.admin_audit_log a WHERE a.action='admin.credential.replace') AS replacement_audits
     FROM vita_pilot.admin_credentials c WHERE c.admin_id=$1::uuid`, [ADMIN])).rows[0];
}

test('replacement preserves the existing principal and atomically rotates its credential, sessions and audit', async t => {
  const s = await fixture();
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const old = await currentState(s.pg);
  const result = await replacePilotAdmin(s.options, s.deps);
  const state = await currentState(s.pg);
  assert.equal(result.status, 'PASS');
  assert.equal(result.principalPreserved, true);
  assert.equal(result.sessionsRevoked, true);
  assert.equal(result.credentialOutput, false);
  assert.equal(result.environmentChanged, false);
  assert.equal(result.privilegesChanged, false);
  assert.equal(result.deployed, false);
  assert.equal(s.calls.vault.length, 1);
  assert.equal(s.calls.vault[0].payload.adminId, ADMIN);
  assert.match(s.calls.vault[0].payload.adminKey, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(state.hash, hmac('admin_credential', s.calls.vault[0].payload.adminKey));
  assert.notEqual(state.hash, hmac('admin_credential', OLD_KEY));
  assert.equal('authSecret' in s.calls.vault[0].payload, false);
  assert.equal('databaseUrl' in s.calls.vault[0].payload, false);
  assert.equal('DATABASE_URL' in s.calls.vault[0].payload, false);
  assert.notEqual(state.hash, old.hash);
  assert.equal(state.enabled, true);
  assert.equal(state.active_sessions, 0);
  assert.equal(state.replacement_audits, 1);
  const principals = (await s.pg.query('SELECT id::text FROM vita_pilot.admin_principals')).rows;
  assert.deepEqual(principals, [{ id: ADMIN }]);
});

test('replacement key authenticates through the same Admin login handler used by the deployed API', async t => {
  const s = await fixture();
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const result = await replacePilotAdmin(s.options, s.deps);
  assert.equal(result.status, 'PASS');
  const replacementKey = s.calls.vault[0].payload.adminKey;
  const previousSecret = process.env.PILOT_AUTH_SECRET;
  const previousOrigin = process.env.PILOT_ORIGIN;
  process.env.PILOT_AUTH_SECRET = SECRET;
  process.env.PILOT_ORIGIN = 'https://vita-reale-arabic-demo.vercel.app';
  try {
    const handler = createHandler('admin/login', {
      run: async (action, data) => {
        assert.equal(action, 'admin_login');
        const row = (await s.pg.query(
          `SELECT encode(credential_hash,'hex') AS credential
           FROM vita_pilot.admin_credentials WHERE admin_id=$1::uuid`, [ADMIN])).rows[0];
        return { authenticated: row.credential === data.credential };
      },
    });
    const response = {
      headers: {},
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
      end(value) { this.body = JSON.parse(value); },
    };
    await handler({
      method: 'POST',
      headers: {
        origin: 'https://vita-reale-arabic-demo.vercel.app',
        'x-vita-request': '1',
        'content-type': 'application/json',
      },
      body: { key: replacementKey },
      socket: { remoteAddress: '198.51.100.22' },
    }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.authenticated, true);
    assert.equal(JSON.stringify(response.body).includes(replacementKey), false);
    assert.match(response.headers['set-cookie'], /^__Host-vita_pilot_admin=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=14400$/);
  } finally {
    if (previousSecret === undefined) delete process.env.PILOT_AUTH_SECRET;
    else process.env.PILOT_AUTH_SECRET = previousSecret;
    if (previousOrigin === undefined) delete process.env.PILOT_ORIGIN;
    else process.env.PILOT_ORIGIN = previousOrigin;
  }
});

test('wrong project, branch, environment, owner URL or vault location abort before key generation', async t => {
  for (const mutate of [
    o => { o.projectConfig.projectId = 'prj-original-vita-reale'; },
    o => { o.verifiedBranch = 'main'; },
    o => { o.environment = 'preview'; },
    o => { o.operatorUrl = OPERATOR_URL.replace(PILOT.directHost, 'ep-production.example.neon.tech'); },
    o => { o.vaultPath = join(siblingRepoPath(), 'leak.dpapi'); },
  ]) {
    const s = await fixture();
    t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
    mutate(s.options);
    const result = await replacePilotAdmin(s.options, s.deps);
    assert.equal(result.status, 'FAIL');
    assert.equal(s.calls.random, 0);
    assert.equal(s.calls.vault.length, 0);
  }
});

function siblingRepoPath() {
  return join(ROOT_FOR_VAULT, 'Documents', 'Codex', 'vita', 'impara-italiano-vita-reale');
}

test('DPAPI vault failure prevents every credential, session and audit write', async t => {
  const s = await fixture({ vaultFails: true });
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const before = await currentState(s.pg);
  const result = await replacePilotAdmin(s.options, s.deps);
  const after = await currentState(s.pg);
  assert.equal(result.status, 'FAIL');
  assert.equal(result.phase, 'DPAPI vault');
  assert.match(result.vaultCandidateMarker, /do not use any file/);
  assert.match(result.vaultCandidateMarker, /transaction was not started/);
  assert.deepEqual(after, before);
  assert.equal(s.calls.vault.length, 1);
  assert.equal(after.active_sessions, 1);
  assert.equal(after.replacement_audits, 0);
});

test('a transaction failure after its SQL statements rolls the whole replacement back', async t => {
  const s = await fixture({ failAfterStatements: true });
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const before = await currentState(s.pg);
  const result = await replacePilotAdmin(s.options, s.deps);
  const after = await currentState(s.pg);
  assert.equal(result.status, 'FAIL');
  assert.equal(result.phase, 'replacement verification');
  assert.equal(result.vaultProtected, true);
  assert.match(result.vaultCandidateMarker, /do not use unless this run reports PASS/);
  assert.deepEqual(after, before);
  assert.equal(after.active_sessions, 1);
  assert.equal(after.replacement_audits, 0);
});

test('a lost transaction response is recovered only when a read confirms the atomic commit', async t => {
  const s = await fixture({ failAfterCommit: true });
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const result = await replacePilotAdmin(s.options, s.deps);
  assert.equal(result.status, 'PASS');
  assert.equal(result.replacementCommitted, true);
  assert.equal(result.transactionResponseRecovered, true);
  const state = await currentState(s.pg);
  assert.equal(state.hash, hmac('admin_credential', s.calls.vault[0].payload.adminKey));
  assert.equal(state.active_sessions, 0);
  assert.equal(state.replacement_audits, 1);
});

test('missing runtime account grant or privileged runtime drift aborts before vault creation', async t => {
  const s = await fixture();
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  await s.pg.exec('REVOKE EXECUTE ON FUNCTION vita_pilot.account_request(text,jsonb) FROM vita_pilot_app');
  const result = await replacePilotAdmin(s.options, s.deps);
  assert.equal(result.status, 'FAIL');
  assert.equal(result.phase, 'migration and runtime privilege verification');
  assert.equal(s.calls.random, 0);
  assert.equal(s.calls.vault.length, 0);
});

test('the returned result and all SQL calls never include plaintext keys, HMAC secret or owner URL', async t => {
  const s = await fixture();
  t.after(async () => { try { await rollback(s.pg); } finally { await s.pg.close(); } });
  const sqlLog = [];
  const adapter = s.deps.connect;
  s.deps.connect = url => {
    const db = adapter(url);
    const query = db.query;
    db.query = (sql, params = []) => {
      sqlLog.push({ sql, params });
      return query(sql, params);
    };
    return db;
  };
  const result = await replacePilotAdmin(s.options, s.deps);
  const all = JSON.stringify({ result, sqlLog });
  assert.equal(result.status, 'PASS');
  assert.equal(all.includes(s.calls.vault[0].payload.adminKey), false);
  assert.equal(all.includes(SECRET), false);
  assert.equal(all.includes('synthetic@'), false);
  assert.equal(sqlLog.some(entry => /^\s*(?:GRANT|ALTER ROLE)\b|vita_pilot\.learners|activation_codes|learner_progress/i.test(entry.sql)), false);
});
