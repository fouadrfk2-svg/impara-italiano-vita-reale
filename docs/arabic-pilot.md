# Arabic interface and complete original A1–B2

Arabic (العربية) is available from the welcome screen and language selector.
The partial Arabic course covers all forty lessons and ten assessments in
units **a1-u01**, **a1-u02**, **a1-u03**, **a1-u04**, **a1-u05**, **a1-u06**, **a1-u07**, **a1-u08**, **a1-u09** and **a1-u10**, including their unit titles and descriptions.
All eight A2 units include 32 existing lessons, eight assessments and exactly
405 existing exercises, with unit titles and grammar summaries. All four B1
units add 16 original lessons, four assessments and 203 original exercises.
All six B2 units add 18 original lessons, six assessments and 252 original
exercises. C1–C2 and
untranslated supporting content continue to use English fallback. No curriculum
unit, learner exercise, Italian example or topic is added.

## Partial course contract

- I18n.contentLanguage("ar") remains "en". The complete English overlay is
  reapplied before Arabic, including after switching from another language.
- I18n.courseOverrides("ar") declares exactly 162 complete entries: 60 for A1
  across a1-01.js, a1-02.js and a1-03.js, and 48 for A2 across a2-01.js
  (units 1–4) and a2-02.js (units 5–8), plus 24 for B1 in b1-01.js and 30 for B2 across b2-01.js,
  b2-02.js and b2-03.js.
  A1–B1 units declare four original lessons; B2 units declare three. Each includes
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
now use the actual untranslated B2 units, retaining exact English restoration
and atomic malformed-overlay checks. Browser coverage exercises every final A2
lesson and assessment at 390px/1440px, including matching columns that intentionally
contain Italian, wrong answers, retries, conjugations, dialogues, recordings,
language cycles, saved scores/reload and axe AA accessibility.

## Complete original B1 translation

The four original B1 units cover the subjunctive, combined pronouns and
relatives/indefinites, Italian bureaucracy, and media/argument. They contain
exactly 16 lessons, four assessments and 203 exercises (51/50/50/52 by unit).
All unit summaries, theory, tables, example meanings, vocabulary, culture,
questions, choices in the learner language, dialogue translations and feedback
are Arabic. Italian table cells, choices, audio, IDs, answers and order stay
unchanged. The existing congiuntivo exercise label now has an Arabic UI string.
No new lesson, exercise or Italian example is introduced.

Inherited source concerns, retained without altering Italian or grading:

- Unit 1 overstates that subjunctive subject pronouns are obligatory and that
  this mood never describes facts. Arabic explains disambiguation and stance;
  context can identify the subject, and emotion may concern an actual event.
- The trigger list includes come se without distinguishing its usual imperfect
  or pluperfect subjunctive. Arabic names that distinction in the existing note.
  Same-subject di + infinitive is explained for the given verbs, not as a
  universal prohibition on an explicit che clause. Il quale is not presented
  as an unrestricted replacement for every che/cui.
- Unit 1 lesson 3 uses plural vi in the original enjoyment examples. Unit 1
  lesson 4 example 3 switches from singular hai ragione to plural esagerate;
  Arabic follows those original forms, not the singular English gloss.
- Unit 2 lesson 1 exercise 3 accepts both ve la and ce la although its stated
  reply is addressed to the group (ve la). The Arabic explanation teaches
  ve la; both inherited accepted keys remain. Exercise 2 also accepts glielo
  before ho; the correct written model remains gliel'ho, and neither key changes.
- Unit 2 lesson 3's proverb is Chi dorme non piglia pesci, not the literal
  English early-bird wording. Arabic translates the Italian and explains its
  existing meaning, without inventing a replacement Italian proverb.
- Unit 3's descriptions of fiscal-code issuance, residence requirements,
  self-certification, duty stamps, PEC, cancellation and employment terms are
  simplified and sometimes categorical. Arabic qualifies these source notes;
  the lesson teaches language, not legal, financial or administrative advice.
  No current entitlement or official procedure is guaranteed. The original
  fourteen-day refund claim, sixteen-euro stamp, four-euro account offer,
  residence-document list and employment examples remain fictional learning
  sentences, not universal rules. RAL must not be read as a figure to which a
  thirteenth salary is necessarily added again; holiday days depend on terms.
  The original grouping of apprenticeship and internship and of partita IVA
  with self-employment is retained as vocabulary, with limited contextual notes.
- Unit 4's tense/time shifts depend on reporting context, not an automatic
  mechanical rule. The original answer choosing past conditional is retained
  and its Arabic question specifies the shifted past reference. Journalistic
  conditional distances the speaker from confirmation; it does not by itself
  prove a source unofficial. The existing multiple-choice key about sources
  close to government remains unchanged. Connective register notes describe
  tendencies rather than bans; exam strategy does not promise exam success.

Focused tests check every original exercise response, unchanged neutral fields,
all Arabic learner leaves, exact Italian table/options, all six language cycles,
scores/glossary state, atomic malformed-entry fallback and lazy-load retry.
Browser coverage completes all 20 original B1 entries at 390px and 1440px,
including wrong answers, fresh retries, recordings, RTL/LTR, language switching,
saved progress/reload and axe AA checks. Fallback regressions now use the first
four original C1 units: all three lessons and assessment in each stay English.

## Complete original B2 and inherited source concerns

All six original B2 units are translated, including 18 lessons, six assessments
and exactly 252 existing exercises (41 / 40 / 41 / 42 / 43 / 45 by unit).
No Italian content, recording, answer, option order, ID or scoring rule changes.
Unit summaries and all existing learner-language fields retain their original
shapes. The original Unit 5 assessment has no objectives or theory: none are added.
Existing Italian-only table cells and answer options remain exactly Italian.
Only the conjugation labels tense.congImp and tense.remoto are added to Arabic UI.
Two source-compatibility fixes are covered explicitly: the merge applies existing
match glosses stored in tr arrays, and strict parity permits omitted theory only
when the original entry omits it. Missing, empty or malformed originally required
text still rejects the entire translation. No teaching block is invented to fit
the validator. A delayed level-load regression also reproduced Coverage
redrawing over a reading after navigation; its completion callback now checks
that Coverage is still the current route before rendering. Dictionary refresh
and all loading/progress behavior remain intact. The original supporting-route
assertions are retained, with deterministic delayed-load coverage at both widths.

The Arabic explanations follow Italian examples and qualify inherited overstatements:

- Unit 1's six irregular subjunctive verbs are important models, not an exhaustive
  inventory of every derived irregular verb. Its se rule applies to hypothetical
  conditions, not every use of se. Future-in-the-past choices in the original keys
  remain; tense selection is contextual, not a universal ban on alternatives.
  The time-grouped senza che means absence, not time; fino a che depends on context.
- Unit 2's claim that se cannot take a future conflicts with its own valid
  Se verrai, ti aspetterò example and accepted farà key. Arabic explicitly permits
  a future in real conditions. The double imperfetto is informal, not banned from
  every kind of writing. Existing qualora / nel caso in cui fill items explicitly
  request congiuntivo imperfetto because their keys accept only that tense.
- Unit 3's same-subject rule is scoped to the infinitive/gerund transformations,
  not the independent Finita la riunione participial construction. Dopo mangiato
  is an attested elliptical form; original multiple-choice items explicitly ask
  for the past-infinitive construction, preserving all choices and the existing
  key. The unchanged vocabulary entry diventare → divenne mixes diventare with
  divenire; no Italian correction is made here. The 1–3–3 pattern describes a
  group, not every irregular verb. Regional passato remoto and passive-frequency
  descriptions are tendencies, not universal geographic or register rules.
- Unit 4's economic sentences and figures are language examples, not current
  statistics. Il fatto che does not invariably require congiuntivo; Arabic and
  questions specify the construction being practised. Cultural claims about
  Italians interrupting or debates never becoming personal are not universal.
- Unit 5's backshift, pronouns and venire/andare changes depend on the reporting
  perspective. Sostenere does not always force a subjunctive, and portare does
  not automatically become lasciare. Same-subject di essere statements are not
  universally excluded by mi ha detto. The unchanged assessment prefers the
  taught di + infinitive pattern, without declaring every che + subjunctive
  directive ungrammatical. The lesson 2 translation prompt follows its accepted
  sentence without an extra lì; its English gloss adds there. Its final spoken
  gloss follows non sarebbe venuto (would not come), not simply would not be there.
- Unit 6's conjunction claims apply to the taught concessive uses. Anche se
  takes indicative for the factual examples and subjunctive in the hypothetical
  examples; pur di is purpose, pur + gerund is concession. A gerund has an implied
  subject, not no subject. The original Pur piovendo option and key are retained;
  impersonal weather constructions should not be confused with an arbitrary
  change of subject. English in effect can itself be ambiguous; Arabic follows
  the intended distinction between actual confirmation and consequence.

Focused response fixtures review every existing exercise against its original
key, including matching arrays stored as tr as well as pairs. Preservation tests
freeze all earlier Arabic overlays and every original core file. Browser checks
complete all 24 B2 entries at 390px and 1440px, audit axe AA and overflow for each
interaction type, test wrong feedback/retry, Italian audio, exact Arabic-English-
Arabic restoration, scores and reload persistence. C1/C2 remain English fallback.
Final browser runs use one worker and zero retries. External QA configuration
disables continuous traces to avoid filling the drive; failure screenshots,
all assertions and test timeouts remain unchanged. No screenshot gallery is made.

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
