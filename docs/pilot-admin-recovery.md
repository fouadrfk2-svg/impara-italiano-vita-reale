# One-time pilot Admin credential replacement

This is an operator-only recovery procedure for the existing synthetic Admin principal in the isolated Arabic demo. It is not an initial bootstrap. **Never rerun** `scripts/bootstrap-pilot-admin.mjs` for recovery.

## Fixed target and effects

The script accepts only the linked Vercel project `vita-reale-arabic-demo` (`prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF`) under team `gz-s-projects1`, the isolated Neon branch `br-old-shape-b9onuuiu`, database `vita_reale_test`, and direct pilot owner endpoint pinned in `server/runtime-policy.cjs`. The URL username must be `vita_reale_test_owner`; pooled endpoints and other hosts/databases are rejected.

It requires the Production Vercel context and the exact demo origin. It uses the already configured `PILOT_AUTH_SECRET` only to calculate the same domain-separated HMAC used by Admin login. It does not read `DATABASE_URL`, alter either environment variable, invoke Vercel write APIs, deploy, run migrations, issue learner codes, grant database privileges, or contact the original `vita-reale` project/database.

The script refuses to proceed unless the migration ledger matches the committed manifest, the runtime role remains restricted, `account_request(text,jsonb)` already has only its expected runtime EXECUTE grant, and exactly one active credential exists for one non-revoked Admin principal. It does not repair drift or infer which principal to use.

After all preflight checks and the operator's typed confirmation, it generates one 256-bit Admin key locally. Before database changes, it writes a vault under `%LOCALAPPDATA%\VitaReale\AdminRecovery\` using Windows DPAPI for the current Windows user. The dedicated vault directory and file ACL are limited to that user and LocalSystem. The vault contains the replacement `adminKey` and non-secret target/expiry metadata; it never contains `PILOT_AUTH_SECRET`, `DATABASE_URL`, the owner connection URL, or learner data. The generated credential expires after 30 days.

One PostgreSQL transaction locks and updates the existing `admin_credentials` row, overwriting the lost hash, resets its credential expiry, revokes that principal's current Admin sessions, and appends one audit record with the same principal as actor. The principal ID and creation record remain unchanged. The transaction has no inserts into principals, learners, activation codes, entitlements, sessions, or progress. Any statement failure rolls back all three database effects. A post-transaction read verifies the new hash is active, prior sessions are revoked, and the audit event exists. If the transaction response is lost but this read proves the committed state, the script reports a verified pass.

If vault protection fails, the database transaction has not started. The output says the vault was not confirmed; never use any file left at the target path. Inspect only that fixed path and remove an incomplete file before a later attempt. If vault protection succeeds but replacement does not report `PASS`, never retrieve or use the protected candidate. A transaction response or post-commit verification failure is ambiguous until the operator checks only the target credential/session/audit metadata; do not retry or remove the vault until that check establishes whether replacement committed. Never rerun initial bootstrap or blindly rerun replacement.

## Local operator execution (not yet authorized or executed)

Use the Arabic repository checkout on `feat/arabic-pilot`. Do not run this from the original `vita-reale` repository.

1. Link the local checkout to the existing demo project only. This creates/updates local ignored `.vercel` link metadata; it does not deploy or change project settings:

   ```powershell
   vercel link --yes --project vita-reale-arabic-demo --scope gz-s-projects1
   ```

   Verify the local `.vercel/project.json` identifies project ID `prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF` and team ID `team_1iIo3BfW8Vk8BduLPPTbgnpv`. The script independently checks those exact IDs.

2. Ensure `%LOCALAPPDATA%\VitaReale\AdminRecovery\replacement.dpapi` does not already exist. The vault helper creates the dedicated directory if needed, restricts its ACL before writing encrypted data, and refuses an existing target file or a non-empty recovery directory.

3. Obtain an authorized owner connection URL for the **pilot branch only**, database `vita_reale_test`, user `vita_reale_test_owner`. Do not save it in an environment file or paste it into chat. The script asks for it with terminal echo disabled. `DATABASE_URL` from Vercel is not used as an owner connection.

4. Run from the linked Arabic repository in an interactive PowerShell terminal. `vercel env run` injects the existing project Production variables into the child process without writing an env file. The command selects Production; the script also checks `VERCEL_ENV` and the exact `PILOT_ORIGIN` before connecting:

   ```powershell
   vercel env run --environment=production -- node scripts/replace-pilot-admin.mjs --verified-branch br-old-shape-b9onuuiu --vault-file "$env:LOCALAPPDATA\VitaReale\AdminRecovery\replacement.dpapi"
   ```

   Type `REPLACE EXISTING PILOT ADMIN` only after independently checking the displayed target. Enter the owner URL only at the hidden prompt. A successful output contains status/booleans only, never the key. If `VERCEL_ENV` is unavailable or any target check fails, the script stops before key generation or vault/database change.

5. Only `status: PASS` confirms replacement. Retrieve the Admin key later from the DPAPI vault in a trusted local process; never display it or put it in chat. Clear the clipboard immediately after pasting it into the demo Admin login. Do not copy or restore `authSecret`—it is not in this vault.

## Safe backup and rollback

DPAPI encryption is bound to the Windows user profile. Keep the vault in the dedicated LocalAppData directory and include it only in a protected Windows backup on BitLocker-encrypted storage. Retain access to the same Windows account/profile and its DPAPI recovery material. Test restoring a backup only under that same account; never put a decrypted JSON copy in cloud storage, source control, email, or chat. If the user profile/DPAPI material is lost, do not attempt an owner shortcut or bootstrap; repeat this reviewed replacement procedure after verifying the database state.

Before the replacement transaction commits, database failure leaves the original principal/credential/session state unchanged; the encrypted candidate must not be used. After a verified commit, the old key is invalid and old Admin sessions are revoked. If a post-commit application login check fails, stop. An operator may fail closed by disabling that same credential and revoking its sessions in one reviewed transaction; do not restore a lost hash, create a second Admin, or change `PILOT_AUTH_SECRET`. The previous key cannot be recovered from its hash.

## Following smoke test

After the separately authorized replacement, use the Admin UI to create one short-lived synthetic learner code (24-hour code expiry and at most 48-hour access). Redeem it through the normal learner flow, save a small synthetic progress change, reload/sign in again and verify restoration, then revoke the synthetic access/code through Admin. Never use a real learner identity or delete unrelated records. This smoke test is a separate operation from credential replacement and is not performed by this script.

No live replacement, grant, environment-variable update, deployment, merge, or commit is performed merely by adding this procedure.

References: [Vercel `env run` CLI](https://vercel.com/docs/cli/env), [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).
