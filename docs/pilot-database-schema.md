# Vita Reale pilot database foundation

## Scope and execution record

This additive foundation changes no frontend, course, Arabic overlay, audio, scoring, local progress, login, payment or API behavior. No login/admin UI or paid access is enabled. The existing health function still runs only SELECT 1. Existing browser state remains linguai.italiano.v2, schema 2.

On 2026-10-26, Neon control-plane metadata verified project **vita-reale-test** (crimson-cake-79153987), branch **vita-reale-arabic-pilot** (br-old-shape-b9onuuiu), database **vita_reale_test**, endpoint **ep-nameless-field-b9iui2w8**. The target was ready and neither default nor primary; its parent/main was br-snowy-silence-b9zks2ry. Only the explicitly identified child branch was queried. The vita_pilot namespace did not exist before this task.

Migrations **0001** and **0002** were applied atomically on that exact child branch using the authenticated Neon SQL tool, then safely rerun. The 47 synthetic SQL checks passed there. Their entire fixture block rolled back through a deliberately caught subtransaction exception; all seven application tables were verified empty afterward. Only the two migration-ledger rows remain. No legacy table or customer record was queried, copied, imported, altered or treated as a test identity. No credentials were retrieved, printed or committed. No database role, environment variable, Vercel deployment or payment configuration was changed.

## Data model

All application rows have checked, immutable **app_id = vita-reale-arabic** and **environment = pilot**. This namespace is deliberately unsuitable for production reuse. A future production environment needs its own reviewed namespace/configuration, fresh identities and keys. There are no cross-schema foreign keys.

| Table | Purpose and constraints |
| --- | --- |
| learners | Random UUID identity, created/updated timestamps, terminal disabled_at, revision starting at 0, JSONB state_snapshot with existing schema 2 and 2 MiB bound. No name, email, address, telephone or documents required. |
| activation_codes | UUID, unique scoped 32-byte code_hash plus positive hash_key_version, active issuing admin FK, required expiry, terminal revocation, one immutable redemption linked to one active learner. Never plaintext codes. |
| sessions | UUID, learner FK, unique scoped 32-byte token_hash/key version, required expiry and terminal revocation. Learner sessions carry no admin authority. |
| entitlements | Learner FK, bounded entitlement_key, unique UUID grant_reference for idempotency, independent admin provenance, validity interval and terminal revocation. Optional code link must match that code's redeemed learner and is single-use. No purchase or payment inference. |
| learner_progress | Composite key app/environment/learner/existing string lesson_id, bounded object JSONB state, monotonically increasing revision starting at 1. Supports IDs such as a1-u01-l1, not numeric day IDs. |
| admin_audit_log | Separate admin actor FK, optional learner subject FK, structured action/target, immutable created_at. Append-only: no updated_at by design. Metadata accepts only bounded reason_code and UUID request_id, never drafts, codes or free-form sensitive data. |
| admin_principals | Separate UUID operator identities with terminal revocation. Learners cannot become admins through a learner row, session or client flag. This table provides the authorization foundation, not an implemented admin login. |
| schema_migrations | Private version/checksum/applied_at ledger. Application/environment isolation is provided by its dedicated schema, not customer data columns. |

Foreign keys are scope-qualified and restrict deletion. Uniqueness prevents duplicate code hashes, token hashes, idempotency references, linked-code grants and learner/lesson progress rows. Indexes cover active learner sessions/entitlements, unredeemed code expiry, provenance, recent progress and audit lookups. Mutable application tables have controlled updated_at; identities and issuance provenance cannot be rewritten.

## Credential and authorization boundary

The schema verifies digest length and uniqueness, not how a digest was produced. Future server code must generate high-entropy codes/session tokens and store only HMAC-SHA256 digests, using **fresh pilot-only server secrets** with distinct application/environment/purpose/version domains for activation codes and sessions. Do not reuse old codes, peppers, identities, cookies, purchases or cloned records. Provision no usable access from the synthetic fixture hashes. Rotation creates new credentials; expiry/hash provenance cannot be edited in place.

All schema/table/function privileges are revoked from PUBLIC, including future default table/function grants for the migration owner. RLS is enabled on every application table. There is no automatic runtime role or public write grant. Only self-read policies exist for learners and learner_progress. Admin/code/session/entitlement/audit tables remain denied to ordinary roles without an explicit future reviewed policy/grant.

**The database owner and roles with BYPASSRLS can bypass RLS.** The owner is for migrations, not future request handlers. Before account APIs ship, provision a separate least-privilege non-owner, non-BYPASSRLS runtime role and audit grants. Do not grant direct progress writes or general credential/admin access to browser users. The health-only owner connection is not an authorization design for later APIs.

The request_learner_id helper uses transaction-local vita_pilot.app_id, vita_pilot.environment and vita_pilot.learner_id. These settings are **trusted server context, not authentication**: a database client can set custom settings. A future backend must derive the identity only from a verified session, validate entitlement separately, and set context within the same transaction. Never accept identity from request JSON/localStorage or expose SQL connections to the browser. No browser database credentials or client paywall are added.

The active_sessions and active_entitlements security-invoker views filter expiry/revocation and disabled learners at query time. Expired historical rows remain for audit; expiry is not a dynamic CHECK constraint. Future authorization must check active status on every request and must not rely on a prior view result after a concurrent revocation. A revoked issuing admin cannot issue new codes/grants, but revoking an operator does not silently revoke previously issued learner entitlements.

## Conflict-safe state and concurrent changes

Private SECURITY DEFINER functions have a pinned search_path and no PUBLIC execute privilege:

- write_lesson_progress(learner_id, lesson_id, state, expected_revision): expected 0 creates revision 1; subsequent updates require the exact current revision. INSERT ON CONFLICT DO NOTHING plus conditional UPDATE ensures one winner; stale/create races raise SQLSTATE **40001** without overwriting newer state.
- write_learner_state(learner_id, state, expected_revision): whole schema-2 snapshot CAS, revision 0 initially. Conflicts also raise 40001.

Both enforce trusted learner context and active learner status. Progress creation/update takes a learner FOR SHARE lock, serializing against disable operations. Code redemption is a conditional UPDATE with unredeemed/unrevoked/unexpired predicates; row locks and triggers prevent second claims and expired/revoked redemption. Trigger locks on active admin/learner rows protect issuance against concurrent revocation/disable. Migrations serialize with a transaction advisory lock and fail after a 5-second table lock wait.

Future code redemption must atomically claim the code, issue the intended entitlement and append a sanitized audit event in **one transaction**. This foundation does not automatically create entitlements or implement authentication. Session issuance, cookie security, CSRF/Origin validation, request rate limiting and separate admin authentication remain later integrations.

Client JSONB state is untrusted learning data, never payment proof or canonical scoring evidence. Database lesson IDs are format-checked; future APIs must also verify real IDs against the original registry, validate payload/evidence and size, and preserve historical best/latest scores, timestamps and drafts. On conflict, reload and reconcile explicitly; do not blindly retry stale overwrites. Keep local export/offline state until an opt-in account migration is verified. Bounds are 2 MiB per snapshot and 256 KiB per lesson state; exceedance must fail clearly without discarding local backups.

## Migration operation

Files are in db/migrations/ with ordered versions and canonical-LF SHA256 checksums in manifest.json. The digest covers the SQL with the embedded expected_checksum replaced by the literal __CHECKSUM__. Applied files are immutable; future fixes require a new version. The checker normalizes CRLF checkouts and rejects destructive statements, public-schema/legacy references and credentials. It is a repository guard, not a substitute for review.

1. Verify the exact Neon project, branch, database, endpoint and non-default status through the control plane. The migration_target setting alone cannot prove branch identity. Never use an unspecified/default connection or main.
2. Run npm run check:db and npm run test:db. Use a migration owner and one transaction; set local vita_pilot.migration_target to vita-reale-arabic-pilot, then execute the validated 0001 and 0002 statements in order. No app startup/build hook runs migrations.
3. Reapply the same files to verify ledger/checksum idempotence. Never edit applied checksums or manually recreate tables. Roll back on error; do not reset, drop, truncate or import old data.

No universal DATABASE_URL runner is supplied: an unchecked environment URI must not accidentally migrate main. The authenticated Neon tool was used with explicit target identifiers. A later operational runner must enforce equivalent control-plane verification and secret-safe logs.

## Reproducible synthetic verification

npm run test:db uses dev-only @electric-sql/pglite 0.5.11, an embedded real PostgreSQL engine, with a fresh in-memory database and no network/customer data. It tests target guards, checksum tampering, safe rerun, the 47 SQL assertions, nonowner RLS across learners/environments/missing context, private grants, CAS winners and static publication exclusions. Test-only database roles are created only in this embedded database and rolled back, never on Neon.

tests/fixtures/vita-pilot-synthetic.sql contains fixed fictitious UUIDs and unusable synthetic digest bytes. **Never run it by itself on a persistent connection.** tests/fixtures/vita-pilot-assertions.sql embeds the fixture inside a rollback-only PL/pgSQL subtransaction and tests duplicates, FKs, JSONB bounds, scope, expiry/revocation, separate admins, claim-once, revision conflicts and audit privacy. Only the deliberately raised VP999 success exception is caught by the outer block; unexpected failures propagate. Verify zero application rows afterward. No destructive cleanup is needed.

The 47 assertions were executed both in embedded PostgreSQL and on the verified Neon pilot branch. The parallel embedded CAS test uses one queued connection; it is **not a multi-connection contention benchmark**. Atomic conditional SQL and row-lock semantics implement concurrency safety, but a true multi-connection load/lock test remains for account API integration. No live learner session or payment behavior is claimed tested or enabled.

Database SQL, fixtures and docs remain outside the static publish allowlist and service-worker cache. No deployment, merge, production configuration or schema change to main is part of this task.

## Development dependency security

The final dependency audit identified an inherited development-only brace-expansion 5.0.9 advisory through ESLint/minimatch. Only that compatible transitive package was patched to 5.0.12 in the lockfile; runtime dependencies are unchanged. npm audit reports zero vulnerabilities after the patch. Reference: https://github.com/advisories/GHSA-q2hr-2g5m-vwhr.
