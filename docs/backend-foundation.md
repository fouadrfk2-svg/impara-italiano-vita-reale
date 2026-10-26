# Vita Reale server foundation

## Scope and boundaries

The learner application remains static HTML/CSS/classic JavaScript. No Next.js migration, account UI, paywall, authentication, admin endpoint, purchase validation, schema creation or progress synchronisation is enabled. Browser state stays under **linguai.italiano.v2**, schema **2**. All existing string lesson IDs, Italian content/audio, Arabic translations, scoring and offline learning behavior remain intact.

Target project: **vita-reale-arabic-demo**. The operator states that its server-side **DATABASE_URL** targets the isolated Neon branch **vita-reale-arabic-pilot**. This implementation neither retrieves that secret nor queries the configured database. A hostname alone cannot prove a Neon branch's identity: verify its endpoint-to-branch mapping in Neon before any future online test. No other project, environment variable or Neon branch is configured here.

Cloned records in the isolated branch remain customer data, not fixtures, synthetic learners or valid new purchases. Do not list, import, activate or use them. Do not reuse old production codes, cookies, secrets, purchases, learner identities or entitlement rows. No customer-table query, migration, seeding or write exists in this foundation.

## Current server API

- **GET /api/health** is a plain Node.js 24 Vercel Function in api/health.js, independent of the static frontend. No rewrite or framework catch-all is required.
- server/database.cjs lazily creates a maintained **@neondatabase/serverless 1.2.0** HTTP client. Only the server reads DATABASE_URL; it is never interpolated into output, browser scripts, API JSON or logs. The lockfile pins the driver. The browser has no database dependency.
- Configuration must be a postgres/postgresql URI with credentials, a Neon .neon.tech hostname, database path and sslmode=require, verify-ca or verify-full. Missing/invalid configuration fails closed. No secret value is returned in an error.
- A health request executes only the fixed **SELECT 1 AS ok**, with no table access or caller-controlled SQL, and a fresh 5-second fetch deadline. It cannot create access, verify purchases or read learner records. No automatic retries.
- Success: **200 {"status":"ok"}**. Missing configuration, connection/timeout/driver errors or unexpected results: **503 {"status":"unavailable"}**. No exception, hostname, username, database name, branch, row, version or environment dump is returned/logged.
- Other methods: **405 {"status":"method_not_allowed"}**, Allow: GET, without connecting. Body, query parameters, cookies and auth headers are not inspected. No CORS wildcard, session or Set-Cookie is added.
- Responses use application/json, no-store for browser/CDNs, nosniff, no-referrer and noindex. Health status is deliberately public; future access to protected data must require server authentication and authorisation. Infrastructure-level rate limits may be added later if warranted.

## Static publication and local use

Vercel runs **npm run build**, which copies an explicit public-file allowlist verbatim into ignored **dist/**. No environment interpolation or database connection happens at build time. Root api/, server/, scripts/, tests/, docs/, node_modules/, .git/, .vercel/ and environment variants are outside published static output. Public license/attribution documents remain included. Symlinks and hidden/secret files within public trees are rejected or omitted. The local static server uses the same file boundary and returns 404 for private source paths and environment files.

The Vercel function is built separately from root api/; imported helpers and the Neon driver remain server-side. Function tracing excludes environment files and unrelated static/test content. The service worker never intercepts/caches **/api** or **/api/** requests, and never substitutes an offline HTML page for an API error. Previously cached API responses are not used.

**npm run serve** remains a static frontend preview; it does not execute the API, so /api/health returns 404 there. Unit/integration tests invoke the actual function using synthetic configuration and a stubbed Neon HTTP transport, never a real connection. A future explicitly authorised Vercel development/preview session can exercise the deployed runtime. Do not pull a production environment file or copy credentials into tests.

**No deployment in this task:** vercel.json sets git.deploymentEnabled["feat/arabic-pilot"] to false, so pushing this checkpoint does not create a Git-integrated deployment. No CLI deploy, promotion, domain operation or environment mutation is performed. Remove that branch restriction only in a later authorised deployment step. Other branches retain Vercel's existing default behavior.

## Old backend design reviewed, not imported

Read-only references in the original Vita Reale repository: src/server/db.ts, code-auth.ts, admin-auth.ts, access.ts, manual-entitlements.ts, admin-codes.ts and progress.ts. Useful boundaries are lazy server-only SQL, high-entropy code hashing, signed/expiring HttpOnly sessions, separate admin authority, server entitlement checks and validated account-scoped progress. Next.js cookies/server-only imports and its numeric 1–60 progress assumptions do not transfer directly to this application. Its runtime table-creation/customer-listing/payment logic is not copied or called.

## Intended next integrations (design only)

1. **Isolation and schema first.** Review versioned migrations for a separate app-owned namespace and least-privilege database role. Use a separate safe synthetic environment or schema without inspecting cloned customer records. A new application/environment namespace and new secret material must prevent old cookies, codes and cloned entitlements from being accepted. Deployment does not imply paid-access approval.
2. **Code login and sessions.** Receive a code only in a bounded HTTPS POST body; never URLs/history, analytics or logs. Use high-entropy generated codes, keyed hashes with a distinct server secret, constant-time comparisons and transactional activation/revocation rules. Add rate limiting, generic invalid-code responses, expiry and anti-replay measures. Issue opaque revocable server sessions via Secure, HttpOnly, SameSite cookies scoped to this app. Validate Origin/CSRF on mutating requests; never trust an identity in localStorage, a URL or a request body. Authentication does not itself confer an entitlement.
3. **Entitlements and admin.** Every protected server operation checks the authenticated member's active app/environment-scoped entitlement, including revocation. Admin sessions and authorisation are separate, short-lived, revocable and required on each admin API, with auditable actions and CSRF protection. Never place an admin key in browser JavaScript. No automatic paid access from cloned purchase rows, an email, a client flag, a successful health check or local lesson completion. Existing PayPal flows/configuration remain untouched; commercial access requires a separate reviewed integration.
4. **Progress.** Add authenticated account-scoped reads/writes only after the above gates. Preserve existing string IDs (for example a1-u01-l1), learner state schema 2, scores, timestamps, SRS and drafts; do not map them to the old numeric day IDs. Validate payload shapes, sizes, identifiers and evidence server-side. Use revisions/idempotency for conflict-safe writes; never let stale state reduce preserved credit. Plan explicit opt-in local-to-account migration, conflict handling and retained export/offline fallback. Keep anonymous state separate and never infer a production identity from a cloned record. Only the learner's own rows may be returned. Drafts and access codes must never appear in URLs, shared caches or general progress summaries.
5. **Paid content boundary.** A static public asset cannot be secured by hiding a button. Before paid access is enabled, decide which content stays public and deliver protected content through server-authorised endpoints/private storage. Do not claim the current public course is protected or introduce an insecure client-only paywall.

Next step: approve the isolated app namespace/schema and synthetic-only test plan, then implement the code/session/entitlement API contract with negative authorisation tests. This task deliberately stops at health.

## Verification

Backend tests cover GET/405/503, timeouts, missing/unsafe configuration, fixed no-table SQL, safe headers and untrusted input, actual driver transport with fake responses, cache bypass, static publish exclusions and original-content integrity. Existing unit/content/security/cache checks and representative single-worker mobile/desktop browser regressions are required. Tests do not contact Neon, Vercel or payment APIs. Live connectivity is intentionally unverified until a separate authorised online preview test.

References: [Vercel Node Functions](https://vercel.com/docs/functions/runtimes/node-js), [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [static output configuration](https://vercel.com/docs/project-configuration/vercel-json#outputdirectory), [Git deployment controls](https://vercel.com/docs/project-configuration/git-configuration), [Neon HTTP driver](https://neon.com/docs/serverless/serverless-driver), [Neon fetch options](https://neon.com/docs/serverless/serverless-driver-configuration).
