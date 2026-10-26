# Pilot accounts, Admin and progress

This implements optional accounts for the existing static course. It does **not** protect public lesson files or enable paid sales. The original Italian curriculum, 1,735 exercises, recordings, grading, Arabic translations and schema-2 learning engine are unchanged. Other languages and C2 English fallback remain available.

## Boundaries

Only Neon project `crimson-cake-79153987`, non-primary pilot branch `br-old-shape-b9onuuiu`, database `vita_reale_test` and schema `vita_pilot` are used. Runtime connections authenticate as `vita_pilot_app`; owner credentials are operator-only. No legacy customer tables, records, purchases, codes or secrets are imported or inspected.

The database helper accepts fixed actions, not caller SQL, and freshly verifies the exact runtime identity, target, permissions and RLS on every operation. Session and entitlement authorization remains inside the reviewed SQL function. A healthy connection is not a learner identity. Codes and scores are never proof of purchase.

## Routes and UI

The existing hash router exposes `#/account` and `#/admin`. Account navigation uses Arabic labels with English fallback, Italian stays LTR, and existing styles are retained. Native form submission is not used. No code, draft or session token enters a URL, redirect, analytics event, browser storage or log. Progress backups contain learner-written content locally; shared-device users are told to sign out.

| Endpoint | Purpose |
| --- | --- |
| POST `/api/auth/redeem` | First activation or returning-code login |
| GET `/api/auth/session` | Safe session status and session-bound CSRF value |
| POST `/api/auth/logout` | Revoke this learner session |
| GET, POST `/api/progress` | Own account state and revision-protected save |
| POST `/api/admin/login` | Independent pilot Admin credential |
| GET `/api/admin/session` | Independent Admin status/CSRF |
| POST `/api/admin/logout` | Revoke this Admin session |
| GET `/api/admin/list` | Paged pilot IDs, access status and non-sensitive summaries |
| POST `/api/admin/operation` | Issue, assign on issuance, rotate, revoke code/access or grant pilot access |

Public health retains exactly `200 {"status":"ok"}` or `503 {"status":"unavailable"}`. API responses are no-store at browser and CDN layers. The service worker bypasses APIs. Static `npm run serve` does not execute Vercel Functions; API tests use the real handlers with a separate synthetic server.

Activation codes carry 120 random bits. Only domain-separated HMAC hashes are stored. Atomic first redemption binds one learner and one entitlement; a valid returning code resolves to that same learner. Rotation revokes old code-linked sessions; access revocation also disables the associated codes so they cannot reactivate revoked access. Admin issuance returns plaintext only in its immediate response, with a warning to copy securely; it is cleared on navigation and never emailed automatically. Unique request UUIDs prevent duplicate Admin mutations; an uncertain issuance response cannot recover its plaintext code, so inspect the list and rotate instead of repeatedly issuing.

Learner and Admin cookies are distinct opaque 256-bit values, `__Host-` scoped, Secure, HttpOnly and SameSite=Strict. Learner sessions expire after 30 days, Admin sessions after four hours. Database revocation/expiration and app/environment checks run per operation. Admin credentials expire and can be disabled independently. Browser profile IDs and frontend flags never authorize a request. A bound `X-Vita-Account` value prevents stale tabs from saving another account's snapshot under a changed cookie.

Mutations require same-origin HTTPS (or explicit localhost development), JSON, a custom request header, and session-bound CSRF validation after login. Bodies, JSON depth/node count, revisions and canonical lesson IDs/counts are bounded. Generic login errors and persistent database rate budgets protect login attempts across Function instances. Budget rows are bounded per hashed key and use fixed windows; keyed IPs are not raw addresses. Operational retention/monitoring of expired sessions, audit rows and stale budget keys should be reviewed before broader traffic; no automatic destructive cleanup is introduced.

## Progress and offline behavior

The canonical `linguai.italiano.v2` state remains schema 2. The account module keeps separate anonymous and per-learner backups, including acknowledged base state, revision, pending changes and recoverable conflict drafts. No anonymous progress enters an account without explicit opt-in. Italian string lesson IDs, original counts and fractional best scores are preserved; conversation progress uses original conversation IDs. Earned completion/best credit cannot be reduced by stale saves.

Server compare-and-swap rejects stale revisions. Client three-way reconciliation combines independent work and review/SRS data; semantic comparison ignores JSON object-key order while preserving array order, and canonical review-event signatures prevent JSONB round trips or lost acknowledgements from duplicating journal entries; concurrent text changes surface a review action and retain an exportable local backup. In-flight edits remain pending rather than being falsely acknowledged. Network failures retain local changes and retry with bounded backoff. A revoked session cannot sync; its pending backup stays on that device. Device language/theme and microphone/AI consent settings remain local and separate from cloud learning data. Import does not transfer anonymous permissions. Account switching isolates local consent and progress caches, and another-tab profile changes suspend writes before reloading.

The inherited general privacy/help pages still describe the upstream anonymous-only product. Before inviting real users, review those no-account/no-server statements and identify this fork's actual operator/contact; upstream attribution is not evidence that the original author operates this pilot. The account screen already discloses account synchronization. This task retains the original 962 UI translations and does not invent controller identities or legal terms.

Local backups are not encrypted against other people using the same browser profile. Logout revokes the server session and restores separate anonymous state; it does not delete unsynchronized work. Export and existing import functions remain available. Protect the operating-system/browser account on shared devices. Scores remain learner-reported learning data, not trusted assessment certificates or entitlements.

## Migration and staged activation

Migrations 0001–0003 remain immutable. Additive migration **0004** creates Admin credentials/sessions, persistent authentication budgets and canonical lesson inventory, plus narrow `account_request(text,jsonb)` behavior. Its manifest checksum is `9d759afbe3adaf3ae1a4eee1d98a9c83a355b06021b1169de09c1fc74d8cd464`. All new tables have RLS; runtime receives no direct table or private-helper permissions.

0004 is applied to the verified pilot branch. Its new function is deliberately **not yet granted** to runtime. The already-deployed older health policy accepts exactly four functions; granting the fifth before deploying the new reviewed guard would break that deployment. The new guard permits precisely the reviewed fifth function while preserving required old grants, owner/search-path checks and fail-closed drift detection.

A separately authorized rollout must:

1. Verify the committed code, target, migration checksum, fresh pilot configuration and synthetic Admin handoff; deploy this reviewed code to the **existing demo project only**. Do not change `DATABASE_URL`, domains, payments or old Vita Reale. The updated guard accepts the current four grants, so health can stay healthy before activation.
2. On the verified pilot branch, an authorized migration operator may grant **only** `EXECUTE ON FUNCTION vita_pilot.account_request(text,jsonb) TO vita_pilot_app`. Verify the new policy with a real runtime connection, then exercise the deployed synthetic workflow, denial checks, revocation and health. Never grant table access or role membership. Treat this activation grant as a reviewed deployment operation, not an owner fallback.
3. Keep static content explicitly public and commercial issuance disabled. No paid-access claim is valid until content delivery itself is server-authorized. Do not reapply historical 0003 after activation: its original four-function policy intentionally rejects later privileges; use the migration ledger and apply only unapplied reviewed migrations.

This task does not deploy or activate that grant. Feature-branch automatic deployment remains disabled in `vercel.json`.

## Initial synthetic Admin bootstrap

The initial synthetic bootstrap was completed on 2026-10-26: one enabled pilot Admin, one bootstrap audit entry, an encrypted operator vault outside both repositories, and the two fresh demo-only variables were verified. `DATABASE_URL` and deployment IDs were unchanged. **Do not rerun initial setup.** Runtime activation is still staged; no new account API has been deployed.

`scripts/bootstrap-pilot-admin.mjs` is an operator-only initial setup, excluded from public build output and never imported by APIs. It verifies the exact project/team/domain and migration ledger, refuses existing auth variables/Admin credentials, generates two independent 256-bit values, and creates a disabled synthetic Admin before any secret handoff.

The reviewed invocation is `node scripts/bootstrap-pilot-admin.mjs --initial --verified-branch br-old-shape-b9onuuiu --vercel-cli ABSOLUTE_AUTHENTICATED_VERCEL_CLI_ENTRY --origin https://vita-reale-arabic-demo.vercel.app --vault-file ABSOLUTE_OPERATOR_PATH.dpapi`. Supply the verified operator URI only through its echo-disabled stdin readiness prompt, never argv, environment files, screenshots or chat.

The vault is outside both repositories, Windows DPAPI encrypted for the current Windows user, with an explicit current-user/SYSTEM ACL and a decrypt-and-compare self-check. The script passes only fresh `PILOT_AUTH_SECRET` (sensitive) and `PILOT_ORIGIN` (public) to Vercel through private stdin, verifies their names/types/scopes and that every unrelated variable is unchanged, then enables the synthetic Admin with an audit event. The only allowed project is `vita-reale-arabic-demo` / `prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF`, team `gz-s-projects1` / `team_1iIo3BfW8Vk8BduLPPTbgnpv`. These variables cover Production and Preview **of this isolated demo**, not the original production website. No deployment occurs and the restricted `DATABASE_URL` is not changed or read back.

Failure leaves an incomplete Admin disabled. Do not rerun an initial bootstrap after a partial write or overwrite a vault; review metadata and recover through an authorized operator. Do not downgrade Secret storage or replace runtime with owner credentials.

For Admin access after an authorized deployment, the same Windows operator can decrypt the `.dpapi` file with `ConvertTo-SecureString`, extract only `adminKey` in a trusted local process and pass it to the password field or trusted clipboard without console output. Clear the clipboard immediately afterward. Never paste the key into chat or save decrypted JSON. The credential expires after 30 days; review any future rotation separately. Encrypted vault backups still require protected Windows account/DPAPI recovery material. Loss of that material requires a reviewed credential replacement, never an owner-login shortcut.

## Verification and truthful limits

- Existing full regression gates cover translations, original content, RTL/LTR, accessibility, language switching, saved progress, service-worker/cache and offline behavior.
- Backend tests execute actual handlers and reviewed migrations in embedded PostgreSQL with effective **and session** runtime identity. They cover login, independent Admin authority, cookies, CSRF, persistent budgets, canonical IDs, two-device restoration, CAS, concurrency requests, access revocation and privilege drift. Embedded requests are serialized for one database connection; they are not proof of live multi-connection contention/load. PostgreSQL row locks, constraints and CAS are the production concurrency boundary.
- The browser workflow uses synthetic rollback-only fixtures and the real handlers/SQL adapter: issue a code, complete all nine original first-lesson exercises, restore on another device, revoke access and deny requests. It also checks explicit anonymous import, offline reload/retry, conflicting drafts and device-local settings at 390px and 1440px. These are local browser tests, not a deployed Neon end-to-end claim.
- On the real isolated Neon branch, migration ledger/checksums and rerun behavior are verified. An **operator-executed** synthetic fixture passes twelve SQL behavior assertions and rolls back its identities and temporary grant. Separately, a fresh connection genuinely authenticated as `vita_pilot_app` passes the 52 existing permission/escalation denials and five new-table/staged-function denials.
- An additional real Neon driver connection authenticated as `vita_pilot_app` passed the expanded runtime policy and **all twelve account SQL assertions** using the actual synthetic bootstrap credential: Admin login/issuance, activation, save/CAS, returning code, second-session restoration, learner/Admin isolation and access revocation. Only the reviewed function received a temporary operator grant for this test. All synthetic actions ran inside a rollback-only subtransaction; the grant was removed immediately afterward. Independent pilot-table counts were unchanged, the fixture session no longer authenticated, the runtime had no residual account-function grant and deployed health returned 200/ok. Owner credentials were not used for account requests. No customer or legacy table was queried.
- Deployed health still returns 200/ok with the existing runtime. Live account API workflow verification remains pending the separately authorized deployment plus narrow function grant. No privilege is broadened to fake that result.

References: [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js).
