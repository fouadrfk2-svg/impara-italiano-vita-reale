# Guest homepage and learner-only pilot

## UX and authorization

Fresh visitors see a public Arabic RTL homepage with A1–C1 overview, benefits, activation-code sign-in and a no-purchase explanation. Other saved interface languages are preserved; guest copy uses English fallback outside Arabic. No local progress is rendered on this page. The existing learner design and original Italian/Arabic educational files are unchanged.

The initial HTML hides learner navigation before first paint. Startup awaits the existing server session and account/progress attachment before loading course scripts. Every learning route is guarded; unknown destinations fall back to Today. A safe in-memory intended destination accepts only internal route names and bounded ID/level/unit/tab/topic/mode/set/section values and intentional search terms, never credentials, exercise drafts or external redirects. Public navigation selected during startup verification is respected. Root social descriptions no longer claim anonymous/offline-only learning. Account/Admin/guest/privacy are public shells, each with its own API authorization; Admin authentication never grants learner access. Late lesson callbacks cannot replace a locked guest screen.

Logout, failed verification, revocation, expiry and offline events close the learner shell. Session checks run on focus/visibility, background synchronization and every 45 seconds while a verified learner is visible. A server revocation can therefore leave previously rendered content visible until the next check; every new protected file request independently checks access immediately. Previously downloaded bytes cannot be remotely revoked. Local pending progress and per-account backups survive locking; localStorage is never authentication. Reconnecting verifies again and resumes the intended learning route after a successful check; an expired/revoked learner must sign in again. No anonymous progress enters an account without the existing explicit import choice.

Optional Arabic overlays may use their already-loaded English fallback when a file fails, with the existing partial-language notice and only after a fresh successful server access check. Failed base content or failed access verification stays locked. The Retry action delegates newly verified sessions to automatic re-entry so the intended route is consumed once.

## Private delivery in this revision

The static publish allowlist excludes ALL data except the six interface dictionaries, ALL audio, and the Italian verb tables/practice lexicon. The content handler accepts a narrow canonical allowlist, blocks traversal/aliases/symlinks/duplicate path parameters, and accepts only GET/HEAD. The Vercel rewrites retain original data/audio URLs. Files are bundled privately in api/content.js with includeFiles; other functions keep excluding course files. Original file bytes, recordings, answers, IDs and grading do not change.

Each content request validates the learner cookie using the existing HMAC and account_request session action. That action rechecks the restricted runtime role, session lifetime/revocation, enabled learner and active entitlement. An Admin cookie or client-side flag cannot authorize delivery. Unknown/revoked/expired sessions return 401; backend verification failure returns 503, never static fallback. Audio supports byte ranges and HEAD, with fresh authorization for each request. Responses are private/no-store at browser/CDN layers, vary on Cookie and use same-origin resource policy. Existing session rate limits also apply to content requests; larger-scale delivery may need a separately reviewed content authorization budget.

The public build contains only the app shell, UI/rendering code, fonts, icons, interface dictionaries and preserved attribution/documentation. Future unrecognized data/audio files fail closed at the publish boundary. The public JavaScript still contains generic rendering/generation algorithms and incidental Italian strings; this is not obfuscation or DRM.

## Offline and upgrade policy

Only the public shell is precached. Course data, recordings, private helper data and all APIs are network-only, without Cache Storage fallback. Service-worker activation removes old linguai shell/audio caches. Startup/logout also remove private entries from older app caches. Offline visitors can see the public shell; account backups remain stored and become recoverable in the account interface after that learner verifies again. Unverified visitors are not offered private backup exports and cannot reopen lessons. The original offline-only/file:// distribution is no longer an authenticated delivery mode.

An already downloaded/exported file, public repository copy, old immutable deployment or browser tab running an older release cannot be made private by this change. The CURRENT live demo is unchanged because this task does not deploy. Its previously published static files remain publicly accessible. Before any commercial-access claim, an authorized release must verify Vercel rewrites/private bundles, direct file denial, CDN cache behavior and entitlement revocation online; separately review earlier deployments/distribution copies and public source exposure. Paid sales remain disabled.

## Privacy and launch limits

The guest privacy link shows a factual Arabic/English pilot data summary: session cookies, server-synchronized learning/draft data and recoverable local backups. It does not present the upstream author as this fork's controller. Original attribution and upstream privacy source files are preserved; the old anonymous-only notice is not mounted by this pilot. Its still-accurate optional voice/AI feature explanations are retained beneath the pilot summary. Identify the actual operator/contact and complete the legal/privacy review before inviting real users. No identity or contact has been invented.

## Verification

All account browser tests use synthetic PGlite transactions, the real account handlers, restricted SQL adapter and the same protected content handler as Vercel. They never connect to Neon/customer data. Tests cover 390px/1440px, direct links, pre-verification hiding, invalid/valid codes, reload/second-device state, logout/revocation/expiry, Admin isolation, offline backups, switching, accessibility and private file requests. PWA tests cover updates, two tabs, legacy cache eviction and denied private offline requests. Boundary tests compare static output against the public allowlist; original data/audio hashes are independently checked before commit.

Vercel packaging reference: https://vercel.com/docs/project-configuration/vercel-json#functions

Presentation-only browser specs import tests/helpers/learner-fixture.cjs: synthetic session/progress transport is seeded from the spec's existing local fixture, and the test-only HTTP server authorizes a fixed synthetic cookie for private files. It never loads .env or Neon. This is not evidence of account security: the separate guest/account specs use the real SQL-backed handlers and neither import nor enable this stand-in. No production module contains a test-auth switch. Legacy onboarding is tested as an explicit authenticated route; fresh visitors are covered by guest-access.spec.js.
