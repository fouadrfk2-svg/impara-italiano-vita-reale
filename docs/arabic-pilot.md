# Arabic interface and first-lesson pilot

Arabic (العربية) is available from the welcome screen and language selector.
Arabic course translations cover only **a1-u01-l1**, **a1-u01-l2** and **a1-u01-l3**.
Their Italian titles are “Buongiorno, un caffè”, “Maschile o femminile?” and “Il, lo, la, un, una”.
All other lessons and supporting course content continue to use English.

## Partial course contract

- I18n.contentLanguage("ar") remains "en": the complete English overlay is
  always reapplied first, even after switching from Spanish or another language.
- I18n.courseOverrides("ar") explicitly declares the file a1-01.js and the three
  keys lesson:a1-u01-l1, lesson:a1-u01-l2 and lesson:a1-u01-l3. Registry requests only declared Arabic files, after English.
  Failed files are reported and remain retryable; no nonexistent Arabic files
  are requested for other levels.
- Each declared lesson must be complete. The merger checks its keys, types and
  indexed array lengths against English before applying it. Missing, malformed
  or undeclared lesson patches leave the entire lesson in English, rather than
  mixing in stale text. Theory is authored as a whole, with an Arabic-specific
  contrast note instead of an English-speaker note.
- Only declared lesson nodes are overlaid. Unit names, other lessons, readings,
  reference material and false-friend content keep the English baseline.
- scripts/parity.mjs retains the full requirements for existing course languages.
  Arabic is explicitly partial: it checks file/lesson membership and the complete
  shape of each declared lesson against Polish, then checks the effective English
  fallback course. Missing fields/array items in the Arabic lesson are errors,
  not silently accepted fallbacks. Missing files and undeclared entries fail too.
- Missing UI keys retain English fallback. Native Arabic plural entries must have
  all six CLDR forms; English fallback plurals use English rules. Existing full UI
  dictionaries still require every reference key.
- scripts/validate.mjs ar loads both layers and validates the effective course
  through the same existing content rules. Italian, audio sources, answer keys,
  scoring, IDs and lesson ordering are unchanged.
- Untranslated exercises into the explanation language still expect English;
  their Arabic UI instructions continue to say English. This pilot does not
  reinterpret their accepted answers.

## Direction and progress

Arabic explanations, grammar meanings, translated choices, dialogue translations and matching
meanings use RTL. Italian sentences, choices, conjugations, token banks, audio
and answer inputs remain LTR. Inline Italian in Arabic prose uses isolated bdi
elements. Actual explanation blocks carry lang/dir. The active lesson language
is scoped to #main and removed on navigation; English fallback stays LTR. Grammar
cell direction follows its actual text, rather than assuming the final column is
Arabic. Italian table examples and Italian options stay LTR; Arabic meanings and
Arabic options use RTL. No answer-index/order or grading changes are involved.

Progress remains under linguai.italiano.v2, schema 2. Lesson IDs, scores, Italian
card keys, review schedules and drafts are unchanged. Vocabulary from the Arabic
lesson is saved under tr.ar, never over tr.en. Untranslated lessons still save
English glosses. Language switching selects the appropriate stored/course gloss
without modifying review scheduling. Imported custom cards without a matching
course/English gloss can still show their original learner-supplied translation.

As before, switching languages rerenders the current view: unsent exercise field
values are not a saved attempt. Finish an answer before changing language.

## Verification

- npm test
- npm run lint
- npm run parity
- node scripts/validate.mjs ar (also pl/en/es/fr/de)
- npm run check:precache and npm run check:swversion
- npm run test:dom

Focused Arabic tests cover complete lesson content, strict negative parity cases,
atomic fallback, language cycling, unchanged Italian/answers, review gloss storage,
all nine real exercises, Italian audio, completion and progress reload. Browser
checks include 1440px/390px, RTL/LTR, overflow and axe AA. The existing Arabic pilot
tests also cover navigation, all languages and supporting routes.

The service-worker shell fingerprint is regenerated with the existing
node scripts/check_swversion.mjs --napraw command when cached assets change.
No runtime dependency, external translation API, account/database, licensing,
attribution or deployment change is involved.
