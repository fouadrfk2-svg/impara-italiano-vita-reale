# Performance architecture audit

## Scope and method

Compared the authorized starting commit `fbe27c66fad81c28587febedb1700b5be37e8900` with the current `dist` build after the refactor. Three repetitions per version, Chromium headless, 390 × 844 viewport, localhost, no CPU or network throttling. The learner route used only the repository's synthetic session/progress fixture; no Neon, Stripe, customer data, or Production service was contacted. Values below are medians. This is a controlled local comparison, not field Core Web Vitals or a Lighthouse score.

## Root-cause map

| Priority | Root cause and location | User impact | Correction and verification |
|---|---|---|---|
| P0 | `assets/js/app.js` `App.enterCourse` previously waited for all `script[data-course-src]` modules and started retention before rendering any requested learner route. | A first learner visit paid for unrelated course engines before the chosen screen became usable. | The route now selects its feature modules and support data, then renders only after session verification and the requested level data are ready. Protected content continues through the authenticated loader. Verified with route-specific browser tests and request counts. |
| P1 | `scripts/bundle-public.mjs` previously grouped public course modules into three large bundles, while route startup fetched the whole module inventory. | More parsing/evaluation than a route needed; poor cold route behavior on ordinary devices. | Classic-script order is preserved while public modules are grouped into 44 feature bundles. Route loading fetches the selected feature set in bounded batches. Build reports and `tests/dom/lazy-loading.spec.js` verify bundles and deferred requests. |
| P1 | `assets/js/registry.js` and `assets/js/app.js` did not have an explicit, shared route lifecycle for feature modules and supporting datasets. | Reference/conversation/reading data could load too early or fail on direct deep links. | Added deduplicated route support loading and per-route readiness. Direct `lib-a2-*` reading links now select their A2 data before rendering. The reading deep-link regression tests verify the issue is fixed. |
| P1 | `assets/js/views-shadow.js` included the consent dialog alongside unrelated views. | Routes needing the consent view had a wider dependency chain. | Moved the dialog into `assets/js/consent-view.js` and mapped it to the routes that need it. Existing consent and speech-consent route checks remain enabled. |
| P1 | `server/runtime-policy.cjs` accepted only the existing isolated Neon binding. | The dedicated feature-branch Preview could not connect to its separate restricted test branch. | Added an exact project, branch, database, host, and role binding for the performance Preview. Production remains bound to its original pilot binding; cross-environment and wrong-branch rejection tests cover the boundary. No Vercel setting or database was changed. |
| P2 | Browser coverage ran against source files even though production serves generated `dist`. | Bundle, cache, and routing behavior in the deployable artifact was not being exercised. | Playwright now sets `VITA_STATIC_ROOT=dist`. The complete browser suite is required to pass against the build before release. |

## Local measurements

| Journey | Starting build: cold | Updated build: cold | Starting build: warm | Updated build: warm |
|---|---:|---:|---:|---:|
| Public landing, request count | 27 | 27 | 29 | 29 |
| Public landing, transfer size | 835 KiB | 838 KiB | 0 KiB reported | 0 KiB reported |
| Public landing, FCP | 92 ms | 72 ms | 48 ms | 48 ms |
| Public landing, TTFB / load | 4 / 184 ms | 4 / 154 ms | 4 / 114 ms | 5 / 100 ms |
| Authenticated dashboard → first lesson, route requests | 19 | 2 | 1 | 0 |
| Authenticated dashboard → first lesson, route latency | 157 ms | 77 ms | 19 ms | 17 ms |

The public cold request count and bytes did not materially improve in this local sample; the work primarily reduced route-specific work and made the learner route selective. Local millisecond figures are too small and too environment-dependent to infer mobile-network or user-percentile performance. No LCP, INP, CLS, TBT, field p75, or Lighthouse score is claimed. Network-throttled mobile measurements and a protected Preview run remain release verification items.

## Architecture and safety notes

- Initial public rendering keeps the landing/auth/billing shell; learner modules remain deferred until a verified learner route asks for them.
- Authentication is verified before private course modules or content are requested. Route changes display an accessible course-opening state while dependencies load; failed loads stay fail-closed with retry.
- Registry loads are deduplicated. Level and supporting files are loaded only when their route requires them; superseded route renders are ignored.
- Generated public bundles contain allowlisted UI modules only. Protected curriculum, language overlays, audio, and progress do not enter public bundles or the service-worker precache. Private content responses remain `private, no-store` and go through the current-session API boundary.
- Public immutable assets remain content-addressed. The service-worker fingerprint was regenerated by `scripts/check_swversion.mjs --napraw`, then checked with `npm run check:swversion`; it was not hand-edited.
- No database schema or learner state changed. Preview binding tests use synthetic URLs and reject Production/Preview crossover.
- The measurements are collected locally and are not transmitted. No new telemetry vendor or student-level timing collection was added; privacy-preserving field observability still needs a separate deployment-approved decision.

## Verification record

Final local verification: 3,593/3,593 unit tests passed; 110/110 mutation cases were caught; lint, content validation, Arabic parity (344/344 entries), database migration check (5 migrations), precache, service-worker fingerprint, and production build passed. The complete single-worker Playwright suite ran against the generated `dist`: 1,289 passed, 0 failed, 0 skipped. After the officially regenerated service-worker fingerprint, the PWA, offline/private-content, public-brand, and supporting-localization subset passed 64/64. Final local measurements remain controlled localhost results, not field Core Web Vitals. Isolated protected Preview verification remains pending.
