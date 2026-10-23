# Arabic interface and complete A1 translation

Arabic (العربية) is available from the welcome screen and language selector.
The partial Arabic course covers all forty lessons and ten assessments in
units **a1-u01**, **a1-u02**, **a1-u03**, **a1-u04**, **a1-u05**, **a1-u06**, **a1-u07**, **a1-u08**, **a1-u09** and **a1-u10**, including their unit titles and descriptions.
All A2–C2 and other supporting content continues to use English fallback.

## Partial course contract

- I18n.contentLanguage("ar") remains "en". The complete English overlay is
  reapplied before Arabic, including after switching from another language.
- I18n.courseOverrides("ar") declares exactly sixty entries across a1-01.js (units 1–3),
  a1-02.js (units 4–7) and a1-03.js (units 8–10): forty lessons, ten lesson-form
  unit tests and ten unit summaries.
  Registry loads only declared Arabic files, after English; failed files are
  retryable. No Arabic file is requested for untranslated levels.
- Lessons and assessments are atomic. Missing keys, incorrect types, empty
  theory or short indexed arrays make the entire entry fall back to English.
  Arabic-specific theory may use its own explanatory structure.
- Unit summaries are independently atomic: title and grammarNote must both
  match the English entry's shape. A missing summary cannot partially override
  the header or prevent a complete Arabic lesson from loading.
- Undeclared units and lessons cannot override the English baseline. Readings,
  references, conversations and other content families keep their baseline.
- scripts/parity.mjs checks every declared file, key, type and indexed array
  against Polish, then checks the effective course. Existing full-language
  requirements remain intact; unit entries receive the same complete shape
  check as other entries, without a lesson-only theory requirement.
- Unit tests 1, 3, 4 and 6 each have four article-choice nouns. All five
  full-language overlays explicitly retain four empty glossary strings. This
  corrects their old three-slot sparse placeholders and clears Arabic on return,
  without changing their wording, Italian nouns or answer keys.
- Missing interface keys use English fallback. Native Arabic plural entries
  require all six CLDR categories. English fallback plurals use English rules.
- scripts/validate.mjs ar validates the merged course using existing rules.
  Canonical Italian, IDs, recordings, option order, grading and lesson order
  are unchanged. Untranslated toBase exercises still expect English answers.

## Language quality

Arabic uses clear Modern Standard Arabic, with explanations adapted to Arabic
speakers rather than English-specific contrasts. Translations follow the actual
Italian neutral layer where English glosses have different names, cities or
nationalities: Kasia, Gdańsk, Kraków and Polish nationality remain those examples.

The existing Italian dialogue answer "Sono dalla Polonia" is retained because
Italian choices and grading are outside the translation scope. Arabic theory
teaches the natural country-origin expression "Vengo dalla Polonia". Nothing in
this pilot changes that inherited accepted choice.

Units 3–4 adapt comparisons to Arabic agreement, quantities and demonstratives.
The noi-ending question is explicit because -o is also shared across groups;
the molto cloze asks for letters rather than an incorrect dash; Prendo questo
is translated as this. These changes affect explanations only, not Italian keys.

Units 5–6 explain reflexives, time, modals, habits and city communication for Arabic speakers.
The two-word non/mai response is explicitly explained; svegliarsi is translated as waking,
and the station-distance example follows the Italian station rather than the English center.
The transport question excludes posture explicitly: in piedi is valid Italian for standing.
The directions cloze allows both di fronte and accanto in its unchanged keys, so Arabic
offers both meanings and asks for a consistent tu/Lei register. The inherited grader can
still accept mixed-register combinations; no answer key or scoring rule is changed.
English source overstatements about adverb placement and compulsory preposition fusion
are not repeated in Arabic. No unrelated language wording is changed.

Units 7–8 add restaurant communication, quantities with ne, relationships,
descriptions and comparisons. Restaurant customs are qualified rather than stated as
universal bans, fee guarantees or legal advice. Nipote includes grandchildren and
nephews/nieces; suo agrees with the possessed noun, not the owner's gender.
The source's optional article in mia sorella maggiore is not taught as compulsory:
the exercise explicitly requests the article-present version. Hair-description
questions specify the taught avere + article pattern rather than claiming all
article-less descriptions are ungrammatical. The inherited Mia collega prompt is
retained and annotated with the ordinary La mia collega pattern. Milano is taught
with cara; the inherited alternate caro answer remains unchanged. The source's
Hai figli? — Ne ho una is explained as referring to an understood una figlia.
No Italian answer, source recording, scoring rule or other-language wording changes.

Units 9–10 cover activities, weather, current actions and passato prossimo.
Arabic distinguishes weather from personal sensations, ongoing actions from future
appointments, and auxiliary choice from a simplistic motion/intransitivity rule.
The avere agreement rule is qualified for the active examples in this lesson;
essere examples explain -o/-a/-i/-e with explicit role gender where fixed keys require it.
Mentre aspettavo is identified as an A2 imperfetto preview, not an unintroduced task.
The inherited In primavera è la stagione migliore model remains in Italian;
Arabic supplies the natural La primavera è la stagione migliore in the explanation.
The final exam's Buongiorno recording is translated as a daytime/morning greeting,
following the Italian rather than the English "Good evening" gloss.

Two Unit 10 article exercises contain sparse, absent glossary slots in every
original language (four slots for five Italian nouns, three for four). Arabic
retains those empty slots exactly and adds no glossary properties, preserving
exact language restoration without changing other-language files or validators.
The Italian nouns and all existing source answer keys remain unchanged.

## Direction and learner state

Arabic explanations, meanings, prompts and feedback are RTL. Italian sentences,
choices, conjugations, token banks, recordings and answer inputs remain LTR.
Inline Italian in Arabic prose uses isolated bdi elements where HTML is supported.
Grammar header and cell direction follows its actual text; mixed cells isolate Italian.
Pure Italian table headers retain lang=it and LTR, including the trailing apostrophe in l'.
Italian endings and pronouns inside Arabic option labels use balanced LTR
isolates so a leading hyphen cannot move to the end of the displayed suffix.
Matching may pair Italian with Arabic meanings or Italian feminine forms, so
the right column follows its actual language rather than an Arabic assumption.
Dynamic dialogue turns retain Italian LTR choices and the actual explanation
language. Untranslated lessons retain English LTR explanations.

Progress stays under linguai.italiano.v2, schema 2. IDs, scores, review schedules,
Italian card keys and drafts keep their existing contract. Arabic glosses are
stored under tr.ar, never over tr.en. Unit declarations do not enter vocabulary
lookup as lesson IDs. Language switching preserves recorded learning progress.
As before, switching languages redraws the view: unsent exercise inputs are not
a saved attempt, so finish an answer before changing language.

## Verification

- npm test
- npm run lint
- npm run parity
- node scripts/validate.mjs ar (also pl/en/es/fr/de)
- npm run check:precache and npm run check:swversion
- npm run test:dom
- npm run test:mutations and node scripts/coverage.mjs --min 99

Focused tests verify the 68 Unit 1–2 exercise mappings and all 100 Unit 3–4 mappings and all 100 Unit 5–6 mappings and all 99 Unit 7–8 mappings and all 104 Unit 9–10 mappings, complete text, unit metadata,
unchanged neutral Italian/answers, atomic failure, Arabic-English-Arabic and
all existing language restoration, gloss storage and learner state. Browser
tests exercise all new lessons and assessments at 1440px and 390px, including
wrong feedback, fresh retry, successful completion, reload, Italian recordings,
keyboard controls, RTL/LTR, horizontal overflow and axe AA checks.

Run CPU-heavy gates before browser verification. Prior 30-second first-lesson
timeouts occurred near final reload/language switching while mutation checks ran
concurrently; the unchanged cases passed repeated isolated runs. Preserve their
assertions and inspect traces rather than masking failures with arbitrary sleeps.

Refresh the existing shell fingerprint with
node scripts/check_swversion.mjs --napraw after cached files change.
No runtime dependency, account/database, licensing, attribution or deployment
change is involved.
