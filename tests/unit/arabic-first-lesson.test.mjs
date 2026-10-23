import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { loadEngine, CORE, ROOT } from "./_harness.mjs";
import { checkPartialCourse, checkUIBag } from "../../scripts/parity.mjs";

const id = "a1-u01-l1", key = "lesson:" + id;
const plain = x => JSON.parse(JSON.stringify(x));
function setup(ar = true) {
  const box = loadEngine({ files: [...CORE, "assets/js/i18n.js", "assets/js/i18n-merge.js", "data/i18n/ui-en.js", "data/i18n/ui-ar.js"] });
  box.Core.load();
  function load(file) { vm.runInContext(readFileSync(join(ROOT, file), "utf8"), box.sandbox); }
  for (const file of ["curriculum-index.js", "a1-01.js", "a1-02.js", "a1-03.js", "a2-01.js"]) load("data/core/" + file);
  for (const lang of ["en", "es"]) for (const file of ["curriculum-index.js", "a1-01.js", "a1-02.js", "a1-03.js", "a2-01.js"]) load("data/i18n/" + lang + "/" + file);
  if (ar) load("data/i18n/ar/a1-01.js");
  box.sandbox.LINGUAI.applyStrings("en"); box.sandbox.Registry.reindex();
  return box;
}
function overlay(lang) {
  let result;
  vm.runInNewContext(readFileSync(join(ROOT, "data/i18n/" + lang + "/a1-01.js"), "utf8"), { LINGUAI: { addStrings(_l, map) { result = plain(map); } } });
  return result;
}
function select(box, lang) {
  box.Core.state.settings.lang = lang;
  box.sandbox.LINGUAI.applyStrings(lang); box.sandbox.Registry.reindex();
}

test("every declared Arabic entry is complete and the original three lessons remain registered", () => {
  const box = setup(), ar = overlay("ar"), problems = [];
  const manifest = plain(box.sandbox.I18n.courseOverrides("ar"));
  assert.deepEqual(Object.keys(ar).sort(), manifest["a1-01.js"].slice().sort());
  for (const original of [key, "lesson:a1-u01-l2", "lesson:a1-u01-l3"]) assert.ok(manifest["a1-01.js"].includes(original));
  checkPartialCourse(manifest, { "a1-01.js": ar, "a1-02.js": overlayFile("ar", "a1-02.js"), "a1-03.js": overlayFile("ar", "a1-03.js") }, { ...overlay("pl"), ...overlayFile("pl", "a1-02.js"), ...overlayFile("pl", "a1-03.js") }, problems);
  assert.deepEqual(problems, []);
});

test("all lesson text families and nine exercises are Arabic, without altering Italian tables or choices", () => {
  const en = overlay("en")[key], ar = overlay("ar")[key];
  const arabic = text => assert.match(text, /[\u0600-\u06ff]/);
  [ar.title, ar.theme, ...ar.objectives, ar.grammar.title, ar.grammar.note, ...ar.grammar.table.head,
    ...ar.grammar.table.rows.map(row => row[2]), ...ar.grammar.examples.flatMap(e => [e.tr, ...(e.note ? [e.note] : [])]),
    ...ar.vocab, ...ar.dialogue, ar.culture.title, ar.culture.text].forEach(arabic);
  ar.theory.forEach(block => Object.values(block).forEach(arabic));
  for (const ex of ar.exercises) for (const [field, text] of Object.entries(ex)) {
    if (field === "opts") continue; // These are the exact Italian answer options.
    (Array.isArray(text) ? text : [text]).forEach(arabic);
  }
  assert.equal(ar.exercises.length, 9);
  assert.equal(ar.vocab.length, 14); assert.equal(ar.dialogue.length, 5);
  assert.deepEqual(ar.grammar.table.rows.map(r => r.slice(0, 2)), en.grammar.table.rows.map(r => r.slice(0, 2)));
  for (let i = 0; i < 2; i++) assert.deepEqual(ar.exercises[i].opts, en.exercises[i].opts);
});

test("English to Arabic to English to Arabic is exact and other lessons always fall back to English", () => {
  const box = setup(), { LINGUAI: L } = box.sandbox;
  const lesson = () => plain(box.Core.getLesson(id).lesson);
  const english = lesson();
  const others = () => plain(box.Core.registry.byCode.A2.units[0]);
  const fallback = others();
  select(box, "es"); assert.notEqual(lesson().title, english.title);
  select(box, "ar"); const arabic = lesson();
  assert.deepEqual(others(), fallback); assert.equal(L.lessonLanguage("ar", id), "ar");
  assert.equal(L.lessonLanguage("ar", "a2-u01-l1"), "en");
  for (const lang of ["en", "ar", "en", "ar"]) {
    select(box, lang); assert.deepEqual(lesson(), lang === "en" ? english : arabic);
    assert.deepEqual(others(), fallback);
  }
  // Every original neutral field (Italian, answers, IDs, audio source) is unchanged.
  let neutral;
  vm.runInNewContext(readFileSync(join(ROOT, "data/core/a1-01.js"), "utf8"), { LINGUAI: { addUnits(_code, units) { neutral = units[0].lessons[0]; } } });
  function sameNeutral(original, translated) {
    for (const [k, value] of Object.entries(original)) {
      if (value && typeof value === "object") sameNeutral(value, translated[k]);
      else assert.equal(translated[k], value, k);
    }
  }
  sameNeutral(neutral, lesson());
});

test("missing, malformed or undeclared Arabic patches cannot leave stale Spanish content", () => {
  const box = setup(false), L = box.sandbox.LINGUAI;
  const english = plain(box.Core.getLesson(id).lesson);
  select(box, "es"); select(box, "ar");
  assert.deepEqual(plain(box.Core.getLesson(id).lesson), english);
  L.addStrings("ar", { [key]: { title: "ناقص" }, "lesson:a2-u01-l1": overlay("ar")[key] });
  select(box, "ar");
  assert.equal(L.lessonLanguage("ar", id), "en");
  assert.equal(L.lessonLanguage("ar", "a2-u01-l1"), "en");
  assert.deepEqual(plain(box.Core.getLesson(id).lesson), english);
});

test("a complete-looking Arabic patch with a malformed nested array, type or empty theory falls back atomically", () => {
  for (const damage of [p => p.vocab.pop(), p => { p.title = 42; }, p => { p.theory = []; }]) {
    const box = setup(false), L = box.sandbox.LINGUAI;
    const english = plain(box.Core.getLesson(id).lesson);
    const patch = overlay("ar"); damage(patch[key]); L.addStrings("ar", patch);
    select(box, "es"); select(box, "ar");
    assert.equal(L.lessonLanguage("ar", id), "en");
    assert.deepEqual(plain(box.Core.getLesson(id).lesson), english);
  }
});

test("missing Arabic script remains retryable; untranslated files never request Arabic", () => {
  const box = setup(), R = box.sandbox.Registry;
  assert.deepEqual(R.i18nPaths("ar", ["a1-01.js", "b2-01.js"]), ["data/i18n/en/a1-01.js", "data/i18n/en/b2-01.js", "data/i18n/ar/a1-01.js"]);
  R.markI18n(["data/i18n/en/a1-01.js", "data/i18n/ar/a1-01.js"], ["data/i18n/ar/a1-01.js"]);
  assert.deepEqual(R.i18nPaths("ar", ["a1-01.js"]), ["data/i18n/ar/a1-01.js"]);
});

test("partial parity rejects missing files, unknown or undeclared lessons, missing keys and short arrays", () => {
  const manifest = { "a1-01.js": [key] }, reference = overlay("pl"), own = { [key]: overlay("ar")[key] };
  const invalid = [ {}, { "wrong.js": own }, { "a1-01.js": {} },
    { "a1-01.js": { ...own, "lesson:a2-u01-l1": own[key] } } ];
  for (const field of ["title", "grammar", "theory"]) { const copy = plain(own); delete copy[key][field]; invalid.push({ "a1-01.js": copy }); }
  for (const field of ["vocab", "dialogue", "exercises"]) { const copy = plain(own); copy[key][field].pop(); invalid.push({ "a1-01.js": copy }); }
  const mistyped = plain(own); mistyped[key].title = 42; invalid.push({ "a1-01.js": mistyped });
  for (const files of invalid) { const problems = []; checkPartialCourse(manifest, files, reference, problems); assert.ok(problems.length, JSON.stringify(files).slice(0, 80)); }
  const problems = []; checkPartialCourse({ "a1-01.js": ["lesson:invented"] }, { "a1-01.js": { "lesson:invented": own[key] } }, reference, problems);
  assert.ok(problems.some(p => p.includes("unknown lesson")));
});

test("partial interface parity still rejects missing fallback keys, wrong types, unknown keys and Arabic plurals without all categories", () => {
  const reference = { label: "text", count: { one: "one", other: "many" } }, good = [];
  checkUIBag({ label: "عنوان" }, "ar", reference, good, reference); assert.deepEqual(good, []);
  for (const [bag, fallback] of [[{}, {}], [{ label: 42 }, reference], [{ label: {} }, reference], [{ invented: "x" }, reference], [{ count: { one: "واحد", other: "عدة" } }, reference]]) {
    const problems = []; checkUIBag(bag, "ar", reference, problems, fallback); assert.ok(problems.length);
  }
});

test("Arabic vocabulary glosses never overwrite English and language switching preserves scheduling and lesson progress", () => {
  const box = setup(), C = box.Core;
  select(box, "en"); C.addCard("grazie", "thank you", id); C.recordLesson(id, 8, 9, 120);
  const before = plain(C.state.lessons);
  select(box, "ar"); C.addCard("grazie", "شكرًا", id);
  assert.equal(C.state.srs.grazie.tr.en, "thank you"); assert.equal(C.state.srs.grazie.tr.ar, "شكرًا");
  assert.equal(C.cardTr(C.state.srs.grazie), "شكرًا");
  C.addCard("nuovo", "new", "a2-u01-l1"); assert.equal(C.state.srs.nuovo.tr.en, "new"); assert.equal(C.state.srs.nuovo.tr.ar, undefined);
  C.addCard("prego", "عفوًا / لا شكر على واجب", "copertura");
  assert.equal(C.state.srs.prego.tr.ar, "عفوًا / لا شكر على واجب");
  assert.equal(C.state.srs.prego.tr.en, undefined);
  C.addCard("scusi", "عفوًا / لو سمحت (للمخاطبة الرسمية)", "lettura:r-a1-mattina");
  assert.equal(C.state.srs.scusi.tr.en, undefined);
  select(box, "en"); assert.equal(C.cardTr(C.state.srs.prego), "you're welcome / don't mention it");
  select(box, "ar");
  const card = plain(C.state.srs.grazie);
  for (const lang of ["en", "ar", "en", "ar"]) { select(box, lang); assert.equal(C.cardTr(C.state.srs.grazie), lang === "ar" ? "شكرًا" : "thank you"); }
  assert.deepEqual(plain(C.state.srs.grazie), card); assert.deepEqual(plain(C.state.lessons), before);
  assert.equal(C.state.schema, 2);
});

test("the nine Arabic exercise meanings correspond to the unchanged Italian answer targets", () => {
  const box = setup(); select(box, "ar");
  const exercises = plain(box.Core.getLesson(id).lesson.exercises);
  assert.equal(exercises.length, 9);
  assert.equal(exercises[0].opts[exercises[0].a], "Buongiorno");
  assert.match(exercises[0].q, /التاسعة والنصف صباحًا/);
  assert.equal(exercises[1].opts[exercises[1].a], "Buongiorno!");
  assert.match(exercises[1].q, /للمرة الأولى/);
  assert.equal(exercises[2].verb, "essere"); assert.equal(exercises[2].tense, "pres");
  assert.deepEqual(exercises[2].persons, [0, 1, 2, 3, 4, 5]);
  assert.match(exercises[2].tr, /التصريف كاملًا من الذاكرة/);
  assert.match(exercises[3].q, /Anna e Marco ___ italiani/);
  assert.deepEqual(exercises[3].a, ["sono"]); assert.match(exercises[3].hint, /الغائب للجمع/);
  assert.equal(exercises[4].dir, "toIt"); assert.match(exercises[4].q, /أنا من بولندا/);
  for (const answer of exercises[4].a) assert.equal(box.Core.checkOpen(answer, exercises[4].a, false).ok, true);
  assert.deepEqual(exercises[4].a, ["sono dalla polonia", "sono della polonia", "vengo dalla polonia"]);
  assert.equal(box.Core.checkOpen("Sono dalla Francia", exercises[4].a, false).ok, false);
  assert.match(exercises[5].tr, /قهوة وكرواسون، من فضلك/);
  assert.deepEqual(exercises[5].a, ["un caffè e un cornetto per favore"]);
  assert.deepEqual(exercises[6].pairs, [
    {it:"grazie",tr:"شكرًا"}, {it:"prego",tr:"عفوًا"},
    {it:"scusi",tr:"لو سمحت (رسمي)"}, {it:"arrivederci",tr:"إلى اللقاء"}
  ]);
  assert.equal(exercises[7].it, "Buonasera, un cappuccino per favore.");
  assert.equal(exercises[7].tr, "مساء الخير، كابتشينو من فضلك.");
  assert.equal(exercises[8].it, "Buongiorno, un caffè per favore.");
  assert.equal(exercises[8].tr, "صباح الخير، قهوة من فضلك.");
});

test("Arabic cultural guidance accurately calls scontrino a receipt, and night farewell uses normal spelling", () => {
  const ar = overlay("ar")[key];
  assert.match(ar.culture.text, /أخذ الإيصال/);
  assert.match(ar.culture.text, /lo scontrino/);
  assert.doesNotMatch(ar.culture.text, /الفاتورة/);
  assert.match(ar.vocab[2], /للوداع قبل النوم/);
});

function overlayFile(lang,file){let map;vm.runInNewContext(readFileSync(join(ROOT,"data/i18n",lang,file),"utf8"),{LINGUAI:{addStrings(_l,value){map=JSON.parse(JSON.stringify(value));}}});return map;}
