# Arabic UI polish

This is a presentation and copy review of the existing product. It does not change the curriculum, original Italian, recordings, grading, storage schema or access rules.

## Arabic terminology and editorial decisions

Use clear Modern Standard Arabic. Use **درس / دروس**, **وحدة / وحدات**, **مستوى / مستويات**, **التقدّم**, **تمرين / تمارين**, **المراجعة**, **بطاقات المراجعة**, **رمز التفعيل**, and **تسجيل الدخول** consistently. Ordinary plural uses of المراجعات remain appropriate when counting review events. Keep useful Italian grammatical terms and all original Italian examples.

The inventory covers all existing Arabic course and supporting overlays plus the UI dictionary. The review checks labels, objectives, grammar terminology, mixed-language boundaries, prompts, feedback, plurals and account disclosures. Confirmed course-copy corrections are limited to eleven missing spaces after أو in seven fields of A1 Units 5, 6, 8, 9 and 10. No Italian token, exercise option order, answer key or educational meaning changes. A1–C1 lessons, assessments, conversations, reference articles, readings, library texts, writing and phonetics retain their existing content. Existing source concerns remain documented in the earlier localization notes; C2 intentionally remains English.

Correct obsolete experimental-interface branding and the visible device-only/no-sync claims in the guide, settings, backup reminder and microphone notice. Account synchronization and private-content checks already exist; these edits describe them accurately without changing them. Speech recognition confirms the recognized sentence; it is not a pronunciation score. Public activation links and their FAQ quote use لديّ رمز تفعيل. Six remaining forward/back arrows now follow the same RTL convention as the other Arabic labels. Correct-answer interpolation uses first-strong isolation so Italian punctuation stays with the answer. The price, manual activation explanation and WhatsApp destination are unchanged. Admin authorization remains a synthetic pilot capability; its limitations are still disclosed.

The 962 existing UI keys remain. One additional localized accessible-name key, app.brandHome, brings each language to 963. The original 230-key Arabic snapshot is retained unmodified; an explicit before/after correction fixture documents the reviewed exceptions rather than silently replacing that snapshot. Existing historical privacy strings and upstream documentation remain intact; the current account privacy view supplies the active disclosures.

## Self-hosted typography

**Noto Sans Arabic**, normal variable weights **400–800**, Arabic WOFF2 subset, **165,960 bytes**. Licensed under **SIL Open Font License 1.1**, copyright The Noto Project Authors. The upstream license is included at assets/fonts/OFL-NotoSansArabic.txt.

Sources:
- https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
- https://fonts.gstatic.com/s/notosansarabic/v33/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4r4xA.woff2
- https://github.com/google/fonts/blob/main/ofl/notosansarabic/OFL.txt

The font is loaded locally with font-display:swap and an Arabic unicode-range; there are no runtime Google Fonts requests. Manrope still renders Latin interface text, Spectral renders Italian display text, and JetBrains Mono renders technical/CEFR labels. Do not replace these Latin families with an Arabic-only face. The service worker precaches the Arabic font as a public shell asset; protected content remains uncached.

Arabic body line height is 1.8, explanations/feedback 1.85, headings 1.55, and controls 1.65. Existing weights, colors, surfaces, layouts and Italian type hierarchy remain. The sidebar support label is .85rem for Arabic readability. Account controls inherit the same stack; Italian answers, codes and numeric controls preserve their Latin glyphs and LTR direction.

## Brand navigation and access

- Learner brand: native accessible anchor to **#/oggi**. It uses the existing hash router and guard, with a visible keyboard focus ring. Route changes retain session and saved learner state.
- Public brand: **#/home**. It remains a separate public context.
- Missing, expired or revoked learner access does not unlock the dashboard; Admin authentication alone does not grant learner access. Existing SQL-backed synthetic regressions exercise this boundary using the brand anchor.
- Sidebar, browser titles in all six UI languages, PWA name/default language and Admin title use Vita Reale.
- Andrea Bonacci attribution, the upstream project link, MIT/OFL licenses and CC BY-SA 4.0 notices remain. Internal identifiers, storage keys and historical provenance are not product copy and stay unchanged.

## Verification

Focused browser tests cover 320/390/768/1440 widths in light and dark modes, A1–C1 representatives, Arabic explanations/Italian answers, the rendered Arabic font via Chromium platform-font inspection, Today/path/review/lesson/mobile-drawer brand navigation, public/account screens, language switching and preserved drafts/progress. Existing security tests use local synthetic SQL fixtures, never cloud customer records. Full unit, mutation, browser, parity, validation, lint, static build, cache and integrity checks are required before saving.

The standalone error page also loads the shared Arabic font definition without changing its Italian layout. The conversation reload regression now waits for authenticated learner routing/private-script readiness, then checks the completion badge and exact saved state; it also verifies the badge before reload. No arbitrary sleep, retries, scoring or persistence changes were introduced.

One trailing ASCII space in the copied upstream font license was removed for the staged whitespace check; all license wording is unchanged.
