# Arabic interface and complete original A1–A2

Arabic (العربية) is available from the welcome screen and language selector.
The partial Arabic course covers all forty lessons and ten assessments in
units **a1-u01**, **a1-u02**, **a1-u03**, **a1-u04**, **a1-u05**, **a1-u06**, **a1-u07**, **a1-u08**, **a1-u09** and **a1-u10**, including their unit titles and descriptions.
All eight A2 units include 32 existing lessons, eight assessments and exactly
405 existing exercises, with unit titles and grammar summaries. B1–C2 and
untranslated supporting content continue to use English fallback. No curriculum
unit, learner exercise, Italian example or topic is added.

## Partial course contract

- I18n.contentLanguage("ar") remains "en". The complete English overlay is
  reapplied before Arabic, including after switching from another language.
- I18n.courseOverrides("ar") declares exactly 108 complete entries: 60 for A1
  across a1-01.js, a1-02.js and a1-03.js, and 48 for A2 across a2-01.js
  (units 1–4) and a2-02.js (units 5–8). Each unit declares four original lessons,
  its original assessment and its unit summary.
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

## A2 Units 1–2 source notes

Arabic adapts the existing language comparisons, without adding Italian models,
exercises or topics. The conjugation labels for imperfetto and futuro are Arabic.
The original A1 overlays, Italian core, recordings and every grading field remain
unchanged. Fallback checks now cover every untranslated A2 Unit 5–8, including
all twenty lessons/assessments and their unit metadata across a2-01.js and the
undeclared a2-02.js file. Arabic-English-Arabic restores exact English content.

Inherited issues are retained in the Italian/answer layer:
- The English hotel dialogue says Smith; the Italian says Nowak. Arabic follows
  Nowak there and preserves Smith in the separate existing table/fill example.
- Imperfetto regularity, duration markers, conversational reactions and future
  register are described as common patterns, not exhaustive or universal rules.
- The original examples include abitassi/fossi before their later formal study;
  the two original accepted versions of the translation answer remain intact.
- È caduta la corrente is an inherited awkward power-cut model. The Arabic
  conveys its intended meaning; neither recording nor Italian is replaced.
- The railway explanation overgeneralizes digital activation and platform timing.
  Arabic preserves the paper-ticket scenario and qualifies the generalizations.
- Hotel document and tax claims are too broad: documento does not mean passport
  exclusively, and the stated 1–7 euro range is not a universal tariff or ceiling.
  Existing two-euro fictional hotel examples and all choice indexes remain intact.

Primary checks: [Trenitalia regional tickets](https://www.trenitalia.com/it/regionale/viaggiare-con-il-regionale.html),
[Polizia di Stato identification FAQ](https://alloggiatiweb.poliziadistato.it/portalealloggiati/FAQ.aspx),
[Roma Capitale tax framework](https://www.comune.roma.it/web-resources/cms/documents/RC23083-22.pdf),
[Università per Stranieri di Siena A2 aspect notes](https://www.unistrasi.it/public/articoli/1946/Files/A2%20UD13.pdf),
[Crusca on conjectural future](https://accademiadellacrusca.it/it/consulenza/sulluso-epistemico-del-futuro/5021).
These checks qualify the translation of existing topics; this is language
learning, not travel, legal or tax advice.

## A2 Units 3–4 translation and inherited source concerns

The twelve newly declared entries translate eight existing lessons, two existing
assessments and exactly 100 exercises. Every original indexed array and Italian
choice remains in its original order. Unit 3 covers direct/indirect pronouns,
participle agreement and imperative pronouns. Unit 4 covers symptom descriptions,
the doctor dialogue, conditional advice and describing habits. Only the required
conditional-tense UI label is added. Arabic comparisons replace English-only ones.

Inherited source concerns, without changing any Italian or accepted answer:
- The blanket participle-agreement statement is too broad: mandatory agreement
  here concerns lo/la/li/le; mi/ti/ci/vi permit variation. Arabic states the scope,
  preserves Ci hanno invitati and adds no Italian example or answer.
- Unit 3 lesson 4's English ordering prompt adds “I'm listening” although the
  original tokens/key only say Mi dica pure, signora. Arabic translates only that
  original Italian. The grammar example and recording remain untouched.
- The source cloze has gia without its accent, the table has a Anna, and the
  imperative overview omits other patterns. These Italian forms are not repaired.
- Unit 4's original doctor scene immediately prescribes an antibiotic; a later
  recording gives a six-day course. These are fictional language examples, not a
  basis for treatment. The dialogue, doses, duration, recordings and keys remain
  exact. Arabic labels the existing doctor's dialogue/instructions as practice;
  it introduces no medical diagnosis, dosing recommendation or new scenario.
- The source claim that emergency care is essentially free for all visitors is
  overbroad. Arabic qualifies the existing healthcare paragraph rather than
  promising free care; triage is not taught as a decision guide. Prescription
  requirements are not compared to an assumed US background.
- Unit 4's dieta explanation has an oversimplified English comparison. Arabic
  distinguishes the broad meaning “eating pattern” from sono a dieta, preserving
  its existing multiple-choice position. The conditional example prendessi and
  phrase Se fossi in te occur before detailed subjunctive study; both remain.

Checks: [Treccani on obligatory/optional agreement](https://www.treccani.it/magazine/lingua_italiana/domande_e_risposte/grammatica/grammatica_1634.html),
[Crusca on agreement](https://accademiadellacrusca.it/it/consulenza/accordo-del-participio-passato/23),
[Ministry of Health ticket rules](https://www.salute.gov.it/new/it/tema/esenzioni-dal-ticket/ticket-ed-esenzioni/),
[AIFA antibiotic campaign](https://www.aifa.gov.it/senza-regole-gli-antibiotici-non-funzionano),
[UNESCO Mediterranean diet](https://ich.unesco.org/en/RL/mediterranean-diet-00884).

Focused tests independently check every one of these 100 original answer mappings,
all learner strings, previous Arabic A1/A2 content, atomic rejection of malformed
overlays, English fallback, language restoration and saved state. Browser checks
cover 1440px/390px, all 100 exercises, wrong feedback/retry, grammar/table direction,
dialogue turns, recordings, completion/reload and axe AA accessibility.

## A2 Units 5–8: completion and inherited source concerns

The final batch translates 16 original lessons, four original assessments and
205 existing exercises. The completed A2 inventory remains 32 lessons, eight
assessments and 405 exercises. No Italian source, recording, answer key, option
position, scoring rule or curriculum order changes. The first four Arabic A2
units and all A1 translation files remain byte-equivalent.

Reviewed source issues, preserved without changing accepted answers:
- Housing: rental terms, deposits and repair responsibility are simplified in
  the source. Arabic preserves the existing topics but marks the explanation as
  a simplification rather than legal guidance. The landlord answer remains in
  its original position. Place expressions do not all take a/di; Arabic avoids
  that source overgeneralization. Restrictions on ci with people are scoped to
  the existing pensare example rather than made universal.
- The original Italian vocabulary il traslocо ends in a Cyrillic character.
  It is preserved, as are every other Italian word and recording reference.
- Unit 5 lesson 3 has three sparse glossary placeholders for four article
  items in every full-language overlay. Arabic preserves those empty slots as
  holes, not null, so it does not introduce stale gloss:null after switching.
  The original four nouns and article answers remain unchanged.
- Work: the English phone dialogue names Anna Smith, but its Italian answer
  says Anna Nowak; Arabic follows the Italian answer. English meanings sometimes
  say meeting where Italian says appointment, or insert Rossi where the spoken
  sentence only says Dottoressa. Arabic follows the actual Italian sentence.
  The first email grammar example says Dott. Bianchi in Italian but Dr. Rossi
  in English; Arabic follows the male Bianchi. The review example favore means
  a favor, and conosciuta means meeting/getting to know her; Arabic follows
  those original meanings rather than the less precise English glosses.
  The broad claims about answering with one's name and meeting interruptions
  are qualified rather than presented as universal cultural rules.
- Unit 6 lesson 1 cloze retains the original question mark after vorrei;
  the original Italian punctuation and key remain untouched. The recorded
  deadline example retains its English word and Polish quotation marks as
  part of the original Italian recording text, while its meaning is Arabic.
- Good wishes: the source treats buona fortuna as categorically unlucky.
  Arabic describes a traditional belief; the exercise explicitly asks for the
  traditional expression taught here, retaining In bocca al lupo and Crepi.
  Ferragosto does not close every service; dinner lateness and what to bring
  are not universal obligations. Arabic qualifies the existing explanations.
- Regional descriptions and dialect origins are simplified. The source
  carbonara city answers and Polish-origin example remain unchanged. Italian
  food names in tables stay Italian, without adding dishes or examples.
- The -mente rule and adverb position depend on the word and context. Arabic
  explains the existing examples without presenting the positions as exclusive.
  Vorrei and mi piacerebbe are not rigidly separated by real versus unreal wishes.
- Unit 8 lesson 2 exercise 2 is malformed in the original core: after the
  second gap it reads (smettere) già di piovere, and its accepted key is aveva;
  smesso is missing from the sentence. It is NOT silently repaired. Its Arabic
  meaning translates the intended existing sentence; the original key remains.
  That exercise and lesson 4 exercise 1 retain the inherited Polish word
  kobieta in their core scaffolding. Arabic instructions explicitly identify
  the female speaker; the neutral source text is not edited in this translation.
- The source warns against se avrei too broadly; Arabic scopes this to the
  conditional pattern in question. The participle-agreement review is scoped
  to its existing direct-object example. No new grammar example is introduced.

Focused tests verify all 205 independently reviewed responses, exact neutral
fields, all learner strings and complete manifest entries. Prior fallback tests
now use the actual untranslated B1 units, retaining exact English restoration
and atomic malformed-overlay checks. Browser coverage exercises every final A2
lesson and assessment at 390px/1440px, including matching columns that intentionally
contain Italian, wrong answers, retries, conjugations, dialogues, recordings,
language cycles, saved scores/reload and axe AA accessibility.

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

Focused tests verify the 68 Unit 1–2 exercise mappings and all 100 Unit 3–4 mappings and all 100 Unit 5–6 mappings and all 99 Unit 7–8 mappings and all 104 Unit 9–10 mappings and all 100 A2 Unit 1–2 mappings, complete text, unit metadata,
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
