# Arabic interface pilot

Arabic (العربية) is available from the welcome screen and language selector.
It translates navigation, welcome choices, essential exercise controls, feedback,
search controls and core settings. It is not a full course translation.

## Fallback contract

- Missing interface keys use the existing English dictionary. Plural selection
  follows the language of the actual string, including English fallbacks.
- I18n.contentLanguage("ar") explicitly selects the complete English course
  overlay. Registry uses it for eager and lazy files; applyStrings uses it for
  every content family. Switching from another language reapplies English rather
  than leaving old translations behind. No nonexistent Arabic course files load.
- Translation exercises into the explanation language still expect English.
  Their Arabic prompts explicitly say English. Validation is unchanged.
- English contrastive teaching notes and false-friend examples remain English;
  they are not claims about Arabic-specific learning difficulties.
- Existing content directories retain their full parity requirements. The pilot
  has no partial course directory pretending to satisfy those requirements.
  The new unit tests check every Arabic key, interpolation variable, native plural
  category, all English UI fallbacks and full-course overlay equality.
- Run node scripts/validate.mjs ar to validate the effective English course
  content through the same validation rules as the other languages.

## Direction and progress

The selected language sets html lang/dir. Scoped rtl.css mirrors navigation and
the mobile drawer; Italian phrases, exercise bodies, recordings, answer fields
and English explanation blocks keep LTR reading order. Switching back resets LTR.
No remote font, translation API or runtime dependency is added.

Progress stays under linguai.italiano.v2 (schema 2). Lesson IDs, scores, Italian
card keys, audio hashes and saved drafts are unchanged. Arabic uses English
glosses for new review cards and retains existing glosses. A custom imported card
with no English/course gloss can still show its original learner-supplied text.
As before, switching languages rerenders the current screen: unsent exercise
field values are not a saved attempt. Finish an answer before changing languages.

## Verification

- npm test
- npm run lint
- npm run parity
- node scripts/validate.mjs ar (and pl/en/es/fr/de)
- npm run check:precache and npm run check:swversion
- npm run test:dom (includes Arabic desktop 1440px and mobile 390px checks,
  keyboard navigation, real Italian audio, grading, progress reload and axe AA)

The service-worker shell fingerprint is regenerated with the existing
node scripts/check_swversion.mjs --napraw command when cached assets change.
No account, database, deployment, licensing or attribution changes are involved.
