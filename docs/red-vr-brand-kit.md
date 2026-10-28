# Vita Reale RED VR Brand Kit V2

Brand-only integration on top of Arabic polish c7b037c. Supplied distributed SVGs are outlined, copied verbatim and pinned by SHA-256 in tests/fixtures/red-vr-brand-assets.json. Do not substitute editable-text sources or redraw the monogram.

| Placement | Supplied source | Published asset |
| --- | --- | --- |
| Public header (light) | 04_Ready_For_Codex/header_public_light.svg | assets/branding/header_public_light.svg |
| Public header (dark) and authenticated rail | 04_Ready_For_Codex/header_learning_dark.svg | assets/branding/header_learning_dark.svg |
| Public footer, light/dark desktop | 04_Ready_For_Codex/footer_light.svg, footer_dark.svg | assets/branding/footer_light.svg, footer_dark.svg |
| Compact mobile footer and learner attribution footer | Header variants above | Header variants above |
| Browser | 02_Icons_PWA_Favicons/favicon.svg, favicon.ico | assets/icons/favicon.svg, favicon.ico |
| Apple touch | 02_Icons_PWA_Favicons/icon_180.png | assets/icons/icon-180.png |
| PWA | 02_Icons_PWA_Favicons/icon_192.png, icon_512.png | assets/icons/icon-192.png, icon-512.png |
| Maskable PWA | 02_Icons_PWA_Favicons/maskable_192.png, maskable_512.png | assets/icons/icon-maskable-192.png, icon-maskable-512.png |
| Open Graph and Twitter | 03_Social_Media/OG_1200x630.png | assets/marketing/social.png |

Public branding remains a native #/home link; rail branding retains its existing localized accessible name, #/oggi destination and guarded click handler. Mobile rail clicks still close the drawer. Logos have fixed intrinsic ratios and empty image alt text inside named links. Theme-specific artwork changes with the saved theme without JavaScript. The footer slogan is reserved for desktop; mobile uses the clearer horizontal logo.

Forest #064B3A, green #08664E, cream #F8F6EF and Italian red #D8313D remain exactly as supplied in the artwork. No orange or gold is introduced. Only the PWA/browser chrome color changes to the supplied forest; existing learning UI colors, Noto Sans Arabic, layouts and educational data remain intact. Original Andrea Bonacci attribution and MIT/CC BY-SA licenses remain intact.

New public artwork is included in the existing allowlisted build without changing its security boundary. The service worker precaches branding only; private course content/audio remain session-gated and network-only. Existing social URL and demo hostname remain unchanged. No deployment is part of this integration.

Verification uncovered an inherited browser-harness race, also reproduced with the original pre-brand public files: the account test invoked the lesson renderer before lazy-loaded answer overlays were complete. The test helper now waits for Core.loadLevelData and loaded.A1 === true before direct navigation. All nine original exercises, runtime-error checks, session/revocation assertions and grading assertions remain unchanged. Application authentication, lesson rendering and loader code are unchanged.

A complete single-worker browser run passed 1283 checks but exhausted the 30-second budget in a saved-progress reload while Windows had only 409 MiB of free RAM. Its preceding full-page review capture was unconditional. That diagnostic helper now requires ARABIC_REVIEW_SCREENSHOTS; automatic failure captures and traces remain enabled. All learning, accessibility, privacy and persistence assertions and test timeouts are unchanged. A fresh complete run is required before saving.
