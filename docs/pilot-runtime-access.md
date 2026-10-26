# Restricted PostgreSQL runtime access

## Result and target

Migration **0003_runtime_access.sql** prepares the SQL-created **vita_pilot_app** role for the existing vita_pilot schema. Versions 0001/0002 and their checksums are unchanged. This is database access preparation: no login/admin UI, account API, frontend, lesson, translation, scoring, payment, environment variable or deployment is changed.

Applied and safely rerun on 2026-10-26 only on Neon project **crimson-cake-79153987**, branch **br-old-shape-b9onuuiu / vita-reale-arabic-pilot**, database **vita_reale_test**, compute **ep-nameless-field-b9iui2w8**. Control-plane metadata independently verified this is neither main nor the default/primary branch. No legacy table or customer record was queried or modified; only system permission catalogs and vita_pilot were inspected.

The original candidate **vita_pilot_runtime remains unsafe and must not be used**. It has BYPASSRLS, CREATEROLE, CREATEDB, REPLICATION and neon_superuser membership, including inherited pg_read_all_data/pg_write_all_data and SET ROLE paths. A rollback-only hardening probe returned **42501: permission denied to alter role**. No claim is made that NOINHERIT alone removes those privileges. The candidate was neither reused, granted new permissions, substituted for the restricted role nor configured in Vercel. Retiring it requires separately authorized operator privileges.

Neon's supported restricted alternative is SQL CREATE ROLE, which avoids the automatic neon_superuser membership given to Console/API/CLI-created roles. A rolled-back capability probe verified this before migration. References: [Neon role management](https://neon.com/docs/manage/roles), [Neon database access](https://neon.com/docs/manage/database-access).

## Verified security properties

| Property | vita_pilot_app |
| --- | --- |
| SUPERUSER / BYPASSRLS | false / false |
| CREATEROLE / CREATEDB / REPLICATION | all false |
| INHERIT | false |
| Direct or inherited memberships | zero; no SET ROLE path |
| Owned relations, schemas, functions or databases | zero |
| Database CREATE / vita_pilot CREATE | false / false |
| Application table, column, view or sequence rights | none |
| Grant options | none |
| Explicit grants | database CONNECT; schema USAGE; four function EXECUTE grants |

The real runtime connection independently reported both current_user and session_user as vita_pilot_app. Owner-side catalog checks corroborated zero memberships/ownership, all seven existing application RLS flags, no effective table/column rights and exactly four executable functions without grant options. RLS, revocation, append-only auditing, scope checks, credential constraints and revision triggers from 0001/0002 are unchanged.

Normal PostgreSQL PUBLIC defaults still permit CONNECT, temporary objects, system catalog visibility and ordinary built-in functions. These are not application table rights. The shared database's PUBLIC privileges were not globally revoked, because doing so could affect unrelated existing applications. Temporary objects cannot replace schema-qualified objects in the pinned function search paths. This role is not intended as an arbitrary SQL console or browser database identity.

## The only runtime data interface

| Function | Parameters after session proof | Result |
| --- | --- | --- |
| read_my_state(bytea, smallint) | none | own schema-2 snapshot and revision |
| read_my_lesson_progress(bytea, smallint, text) | existing lesson ID | own state/revision; missing row returns null state, revision 0 |
| save_my_state(bytea, smallint, jsonb, bigint) | bounded schema-2 snapshot, expected revision | next revision |
| save_my_lesson_progress(bytea, smallint, text, jsonb, bigint) | lesson ID, bounded state, expected revision | next revision |

The first parameters are a 32-byte session digest and positive smallint key version. A future HTTPS API must derive the digest from its opaque session cookie using the fresh server-only, purpose/app/environment-separated HMAC contract. Never accept a learner UUID, token digest or entitlement flag as browser-supplied authority. Treat these digests as sensitive credentials: no URLs, logs, analytics or shared caches. No session, code or entitlement is issued by these functions.

The private session_learner helper checks an unexpired, unrevoked session, an active learner and an active **course_access** entitlement in the fixed vita-reale-arabic/pilot scope. It uses row SHARE locks so concurrent revocation/disable operations serialize with an in-flight request. Expired/future/revoked grants do not count. Every data call rechecks authorization and returns a generic SQLSTATE 42501 on invalid proof. Revocation cannot undo an already completed response.

No data function accepts a target learner ID. The proof resolves identity; explicit scoped predicates constrain all reads/writes. SECURITY DEFINER functions deliberately execute as their migration owner, so their own authorization and fixed filters are essential: they do not rely on owner-bypassed RLS. The runtime itself receives no table rights. All function search paths are pinned to pg_catalog,vita_pilot and all application object names are schema-qualified. Internal helpers and the original context-based CAS functions remain non-executable by runtime and PUBLIC.

The save wrappers bind only the resolved learner, reuse the original revision-protected writes and restore prior context after success. Statement/subtransaction rollback restores context on failure. Setting vita_pilot learner/app/environment flags, disabling row_security or supplying another UUID therefore cannot authorize a different learner. The old context-based private functions are intentionally not granted directly, because custom GUC values alone are not authentication.

Read/write permissions do not imply trusted scores or paid access from client progress. Future APIs must still validate canonical lesson IDs, payload/evidence, request sizes, CSRF/Origin and rate limits. Login/session issuance and admin/code/entitlement mutation need separately reviewed, purpose-specific interfaces; do not grant broad table access or switch those handlers to the owner as a shortcut.

## Migration and drift handling

0003 is additive, advisory-lock serialized and checksum-locked in manifest.json. It checks the verified target marker and applied 0002 checksum, then creates a fresh restricted SQL role only if absent. An existing unsafe same-name role causes failure, not privilege substitution. Migration reruns check attributes, membership, ownership and effective object permissions before accepting the ledger. Checks include column grants, PUBLIC/table ACLs, sequences and unexpected security-definer functions, including overloads by exact signature. Unexpected permissions cause a rollback and operator review; no customer-schema ACL or role is silently rewritten.

The role has a pg_catalog-only default search path, connection limit 20, 10-second statement/idle-transaction limits and 3-second lock timeout. No password is stored in SQL migrations. The first Neon attempt rejected custom function-declaration context settings and rolled back completely; the final migration sets/restores context inside the wrappers instead. Only the final checksum was applied.

## Verification actually performed

- **Real restricted connection:** the maintained Neon driver authenticated directly as vita_pilot_app, with current_user = session_user. All **52 negative operations** passed in one final run: direct reads and writes, role/admin escalation, RLS disabling, schema creation, private helpers and spoofed-context calls. This is not an owner SET ROLE simulation.
- **Independent catalogs:** owner-side role/membership/ACL/ownership/function checks corroborated the runtime connection. No application data read was used for this audit.
- **Live synthetic functions:** **17 assertions** exercised both learners' state/progress, context restoration, cross-learner preservation, stale revisions, independent lesson creation, state validation, expiry and revocation. An owner transaction seeded only fixed fictional data, called the same four functions, and rolled the entire fixture back via VP999. Positive data assertions use this rollback-only owner fixture; permission/escalation assertions use the separate real restricted connection. All seven application tables remained empty afterward.
- **Embedded PostgreSQL:** npm run test:db covers the original 10 tests plus 18 runtime tests, including synthetic valid sessions/entitlements, RLS regressions, direct/private access denial, cross-learner isolation, revocation, CAS, context restoration, safe reruns, checksums and privilege drift. Tests never weaken existing validation or use customer identities.

Neon's protected-role hook rejects SET ROLE neon_superuser/pg_read_all_data/pg_write_all_data with XX000. The denial fixture accepts only the exact corresponding message for those three explicit commands, checks the effective/authenticated role remains unchanged, and fails on every other unexpected error. It does not skip escalation tests or accept arbitrary internal errors.

The connector cannot passwordlessly authenticate the SQL-created role. Real verification therefore used an ephemeral random password through an echo-disabled terminal and the existing driver. Neither owner URI nor role password was printed, saved in a project/environment file or committed. The role password was cleared afterward, including failed verification attempts. The role is consequently **not provisioned with a retained application password**.

## Before future API use

Provision a fresh role credential through a secure operator channel, verify the target and effective privileges again, and only then authorize a separate Vercel DATABASE_URL update. This task leaves all Vercel variables untouched. Never create the replacement role through Console/API/CLI, grant it neon_superuser or reuse the unsafe candidate. Add a fail-closed startup/connection check to future API integration so later privilege drift cannot silently become application authority.

No main-branch writes, old customer data, customer secrets, production configuration, PayPal, login UI, frontend design, merge or deployment is involved. True multi-connection contention/load tests remain part of later account API integration, not a claimed result of these permission checks.
