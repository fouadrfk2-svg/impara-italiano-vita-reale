# Selective Arabic supporting-content overlays

This is infrastructure only. No supporting Arabic translations are enabled.
The Arabic language entry in assets/js/i18n.js has contentOverrides: {}.
The existing courseOverrides manifest, all A1–C1 translations, C2 fallback,
other languages, Italian source files and learner-state schema are unchanged.

## Entry contract

After an existing entry is fully translated, register its key under its exact
overlay filename in contentOverrides. Keep course lesson/unit declarations in
courseOverrides. Do not enable a partial translation to obtain mixed fields.

| Existing overlay file | Allowed keys | Atomic translation boundary |
| --- | --- | --- |
| curriculum-index.js | level:<code> | Existing level name and description |
| grammar-reference.js | ref:<id>, refsec:titles | One reference article; the existing section-title array is a separate entry |
| conversations.js | conv:<id> | Title, setting, closing, all turn/branch translations and tasks |
| readings.js | read:r-<id> | Reading title and all existing meanings |
| writing.js | write:<id> | Title, brief, checklist and any existing item prompts |
| library-<level>.js | read:lib-<level>-<id> | One existing library reading, including gloss and lookup lex arrays |
| phonetics.js | ph:<id> | Title, contrast note and all existing pair meanings |

Library filenames support the existing levels; this task does not register or
translate C2. False-friend/interference content is outside this manifest.

The loader requests the English baseline first, then only declared Arabic
files. Libraries retain their existing lazy-loading behavior. Failed overlay
scripts remain retryable on a subsequent language load.

LINGUAI.entryLanguage(lang, key) resolves each supporting entry independently.
An undeclared, missing or malformed Arabic entry uses its whole English entry.
Required keys, value types and indexed array lengths must match English exactly.
Nonempty source strings cannot become empty or whitespace-only. Extra fields
are rejected, so neutral Italian, IDs, answer keys and branch targets cannot
enter an accepted overlay. Existing language-specific course theory rules
remain separate. Shape validation cannot determine linguistic quality: a human
must review every translation before declaring it complete.

scripts/parity.mjs checks supporting declarations, file/family membership,
duplicates, missing entries and full field shape. scripts/validate.mjs loads
declared supporting files as well as course files. Do not weaken either check.

## Rendering and direction

I18n.contentAttrs(key) and I18n.markContent(node, key) label content with its
resolved lang, dir and data-content-language. English fallback stays LTR even
inside the Arabic interface. Use the explicit it key for Italian titles and
lang=it / dir=ltr on Italian answer controls. I18n.isolateContent isolates
Italian emphasis and table cells within Arabic rich explanations; retain the
existing table-wrap around wide tables and explicit bdi dir=ltr around inline
Italian in future translations. No automatic text translation is performed.

I18n.meaningAttrs(text) and I18n.markMeaning(node, text) handle saved or editable
meanings separately from the interface language. Arabic meanings are RTL in
lookup, vocabulary and review screens. Italian prompts, models, recordings,
options and response inputs retain their existing LTR behavior.

Reading/library gloss saves resolve their actual translation language. An
Arabic or manually edited Arabic meaning goes into tr.ar without overwriting
tr.en or changing scores, review schedules, IDs or the schema-2 storage key.
Language changes reapply a complete baseline before selective entries, so
Arabic–English–Arabic and other language cycles do not retain stale fields.
As before, changing language redraws the current view; unsent input is not a
saved attempt. No new draft/progress persistence contract is introduced.

## Regression coverage

tests/fixtures/supporting-localization.cjs contains synthetic structural markers,
not learner translations. Unit checks exercise each family independently,
malformed-entry fallback, all existing language cycles, neutral-field and data
file preservation, loader retry, parity and saved meanings. Browser checks cover
390px and 1440px, actual computed direction, language readiness, lazy libraries,
lookup/review persistence, accessibility and horizontal overflow.

Run CPU-heavy checks separately from browsers. Refresh the existing shell
fingerprint with node scripts/check_swversion.mjs --napraw after cached code
changes. No new production content, dependency, visual branding or service is
required. Supporting translations and remaining interface strings are future
content work; English fallback remains intentional until each entry is ready.
