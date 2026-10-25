import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { loadEngine, CORE, ROOT } from "./_harness.mjs";
import { checkPartialCourse } from "../../scripts/parity.mjs";

const ids = ["a1-u01-l2", "a1-u01-l3"];
const plain = value => JSON.parse(JSON.stringify(value));
function overlays(lang) {
  const result = {};
  vm.runInNewContext(readFileSync(join(ROOT, "data/i18n", lang, "a1-01.js"), "utf8"), { LINGUAI: { addStrings(_l, map) { Object.assign(result, plain(map)); } } });
  return result;
}
function setup() {
  const box = loadEngine({ files: [...CORE, "assets/js/i18n.js", "assets/js/i18n-merge.js"] });
  box.Core.load();
  for (const file of ["data/core/curriculum-index.js", "data/core/a1-01.js", "data/core/a1-02.js", "data/core/a1-03.js", "data/i18n/en/curriculum-index.js", "data/i18n/en/a1-01.js", "data/i18n/es/a1-01.js", "data/i18n/ar/a1-01.js", "data/i18n/en/a1-02.js", "data/i18n/es/a1-02.js", "data/i18n/en/a1-03.js", "data/i18n/es/a1-03.js", "data/core/a2-01.js", "data/i18n/en/a2-01.js", "data/i18n/es/a2-01.js"]) vm.runInContext(readFileSync(join(ROOT, file), "utf8"), box.sandbox);
  for(const file of ['data/core/c1-01.js',...['en','pl','es','fr','de'].map(lang=>'data/i18n/'+lang+'/c1-01.js'),'data/core/a2-02.js',...['en','pl','es','fr','de'].map(lang=>'data/i18n/'+lang+'/a2-02.js')])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;
}
function select(box, lang) { box.Core.state.settings.lang = lang; box.sandbox.LINGUAI.applyStrings(lang); box.sandbox.Registry.reindex(); }
const arabic = (value, label) => assert.match(value, /[\u0600-\u06ff]/, label);

test("Arabic manifest and strict parity retain both complete noun and article lessons", () => {
  const box = setup(), ar = overlays("ar"), en = overlays("en");
  const keys = plain(box.sandbox.I18n.courseOverrides("ar"))["a1-01.js"];
  assert.deepEqual(Object.keys(ar).sort(), keys.slice().sort());
  for (const id of ids) assert.ok(keys.includes("lesson:" + id));
  const problems = [];
  checkPartialCourse(plain(box.sandbox.I18n.courseOverrides("ar")), { "a1-01.js": ar, "a1-02.js": overlayFile("ar", "a1-02.js"), "a1-03.js": overlayFile("ar", "a1-03.js"), "a2-01.js": overlayFile("ar", "a2-01.js"), "a2-02.js": overlayFile("ar", "a2-02.js"), "b1-01.js": overlayFile("ar", "b1-01.js"), "b2-01.js": overlayFile("ar", "b2-01.js"), "b2-02.js": overlayFile("ar", "b2-02.js"), "b2-03.js": overlayFile("ar", "b2-03.js") }, { ...overlays("pl"), ...overlayFile("pl", "a1-02.js"), ...overlayFile("pl", "a1-03.js"), ...overlayFile("pl", "a2-01.js"), ...overlayFile("pl", "a2-02.js"), ...overlayFile("pl", "b1-01.js"), ...overlayFile("pl", "b2-01.js"), ...overlayFile("pl", "b2-02.js"), ...overlayFile("pl", "b2-03.js") }, problems);
  assert.deepEqual(problems, []);
  for (const id of ids) assert.deepEqual(Object.keys(ar["lesson:" + id]).sort(), Object.keys(en["lesson:" + id]).sort());
});

for (const id of ids) {
  test(id + " has Arabic in every explanation, note, glossary and exercise text slot", () => {
    const ar = overlays("ar")["lesson:" + id], en = overlays("en")["lesson:" + id];
    [ar.title, ar.theme, ...ar.objectives, ar.grammar.title, ...ar.grammar.table.head, ...ar.vocab,
      ...ar.grammar.examples.flatMap(example => Object.values(example))].forEach(value => arabic(value, id));
    for (const block of ar.theory) for (const value of Object.values(block)) (Array.isArray(value) ? value : [value]).forEach(text => arabic(text, id));
    ar.grammar.table.rows.forEach(row => {
      arabic(row[0], "translated table pattern");
      if (id.endsWith("l2")) arabic(row[3], "translated meaning");
    });
    ar.exercises.forEach((exercise, i) => {
      for (const [key, value] of Object.entries(exercise)) {
        if (key === "opts" && !((id.endsWith("l2") && i === 4) || (id.endsWith("l3") && i === 5))) {
          assert.deepEqual(value, en.exercises[i].opts, "Italian choices and ordering are preserved");
          continue;
        }
        (Array.isArray(value) ? value : [value]).forEach(text => arabic(text, id + " exercise " + i));
      }
    });
    assert.equal(ar.exercises.length, 9);
    assert.equal(ar.vocab.length, id.endsWith("l2") ? 14 : 12);
    assert.equal(ar.dialogue, undefined, "the source has no dialogue to translate");
  });

  test(id + " retains every neutral Italian field, accepted answer, option index and audio sentence", () => {
    const box = setup(); select(box, "ar");
    let neutral;
    vm.runInNewContext(readFileSync(join(ROOT, "data/core/a1-01.js"), "utf8"), { LINGUAI: { addUnits(_code, units) { neutral = units[0].lessons.find(l => l.id === id); } } });
    const current = box.Core.getLesson(id).lesson;
    function same(source, translated) {
      for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === "object") same(value, translated[key]);
        else assert.equal(translated[key], value, id + ": " + key);
      }
    }
    same(neutral, current);
    const en = overlays("en")["lesson:" + id], ar = overlays("ar")["lesson:" + id];
    for (let i = 0; i < en.grammar.table.rows.length; i++) {
      const count = id.endsWith("l2") ? 3 : 4;
      assert.deepEqual(ar.grammar.table.rows[i].slice(1, count), en.grammar.table.rows[i].slice(1, count));
    }
  });
}

test("all nine noun-gender exercise meanings match their original Italian answer keys", () => {
  const box = setup(); select(box, "ar");
  const ex = plain(box.Core.getLesson(ids[0]).lesson.exercises);
  assert.equal(ex[0].opts[ex[0].a], "la chiave"); assert.match(ex[0].q, /مؤنّث/);
  assert.deepEqual(ex[1].a, ["le"]); assert.match(ex[1].q, /ragazze/);
  assert.deepEqual(ex[2].a, ["ristoranti"]); assert.match(ex[2].q, /ristorante/);
  assert.deepEqual(ex[3].items.map(x => x.a), ["il", "la", "la", "il", "la", "il"]);
  assert.deepEqual(ex[3].items.map(x => x.gloss), ["كتاب", "بيت", "محطة", "مطعم", "مفتاح", "يوم"]);
  assert.equal(ex[4].a, 1); assert.equal(ex[4].opts[1], "فنجانان"); assert.match(ex[4].q, /due caffè/);
  assert.deepEqual(ex[5].a, [0, 2, 4]); assert.deepEqual(ex[5].a.map(i => ex[5].opts[i]), ["la città", "il bar", "lo sport"]);
  assert.deepEqual(ex[6].a, ["il ristorante è chiuso"]); assert.equal(ex[6].tr, "المطعم مغلق.");
  assert.equal(ex[7].it, "Le chiavi sono sul tavolo."); assert.equal(ex[7].tr, "المفاتيح على الطاولة.");
  assert.equal(ex[8].it, "La città è molto bella."); assert.equal(ex[8].tr, "المدينة جميلة جدًا.");
});

test("all nine article exercise meanings match their original Italian answer keys", () => {
  const box = setup(); select(box, "ar");
  const ex = plain(box.Core.getLesson(ids[1]).lesson.exercises);
  assert.equal(ex[0].opts[ex[0].a], "lo"); assert.match(ex[0].q, /zucchero/);
  assert.equal(ex[1].opts[ex[1].a], "gli specchi"); assert.match(ex[1].q, /specchio/);
  assert.deepEqual(ex[2].items.map(x => x.a), ["il", "lo", "l'", "l'", "la", "lo"]);
  assert.deepEqual(ex[2].items.map(x => x.gloss), ["قطار", "طالب", "صديقة", "ماء", "زجاجة", "حقيبة ظهر"]);
  assert.deepEqual(ex[3].a, ["un'"]); assert.match(ex[3].q, /amica/);
  assert.deepEqual(ex[4].a, ["gli"]); assert.match(ex[4].q, /studenti/);
  assert.equal(ex[5].a, 1); assert.match(ex[5].opts[1], /قهوة معيّنة/); assert.match(ex[5].opts[1], /قهوة غير محدّدة/);
  assert.deepEqual(ex[6].pairs.map(x => x.it), ["___ psicologo → lo", "___ albergo → l'", "___ bicchiere → il", "___ gente → la"]);
  assert.deepEqual(ex[6].pairs.map(x => x.tr), ["اسم مذكّر يبدأ بـps", "اسم مذكّر يبدأ بحرف متحرّك", "اسم مذكّر يبدأ بحرف ساكن عادي", "اسم مؤنّث"]);
  assert.deepEqual(ex[7].a, ["lo zaino dello studente è pesante"]); assert.equal(ex[7].tr, "حقيبة ظهر الطالب ثقيلة.");
  assert.equal(ex[8].it, "Gli studenti sono all'università."); assert.equal(ex[8].tr, "الطلاب في الجامعة.");
});

test("contrast notes explain Arabic gender differences and avoid the source's apostrophe-only claim", () => {
  const ar = overlays("ar");
  const gender = ar["lesson:" + ids[0]].theory;
  assert.match(gender.find(x => x.contrast).contrast, /لا تنقل الجنس من العربية/);
  assert.match(gender.find(x => x.contrast).contrast, /لا توجد صيغة خاصّة للمثنّى/);
  assert.match(gender.find(x => x.trap).trap, /لها استثناءات/);
  const articles = ar["lesson:" + ids[1]].theory;
  assert.match(articles.find(x => x.trap).trap, /الفاصلة ليست الفرق الوحيد/);
  assert.match(articles.find(x => x.trap).trap, /في العربية/);
  assert.match(ar["lesson:" + ids[1]].exercises[6].pairs[0], /يبدأ بـps$/);
});

test("Arabic-English-Arabic restores both whole lessons exactly; untranslated C1 Unit 1 keeps English", () => {
  const box = setup();
  const snapshot = () => plain(box.Core.registry.byCode.A1.units[0]);
  select(box, "en"); const en = snapshot(), fallback = plain(box.Core.registry.byCode.C1.units[0]);
  select(box, "ar"); const ar = snapshot();
  for (const lang of ["en", "ar", "en", "ar"]) {
    select(box, lang); assert.deepEqual(snapshot(), lang === "ar" ? ar : en);
    assert.deepEqual(plain(box.Core.registry.byCode.C1.units[0]), fallback);
    assert.deepEqual(plain(box.Core.getLesson("c1-u01-l1").lesson), fallback.lessons[0]);
    assert.deepEqual(plain(box.Core.getLesson("c1-u01-test").lesson), fallback.test);
  }
});

test("a malformed new Arabic lesson falls back independently without disabling the other translations", () => {
  for (const id of ids) {
    const box = setup(), ar = overlays("ar"), en = overlays("en");
    delete ar["lesson:" + id].grammar;
    box.sandbox.LINGUAI.addStrings("ar", ar); select(box, "es"); select(box, "ar");
    assert.equal(box.sandbox.LINGUAI.lessonLanguage("ar", id), "en");
    assert.equal(box.Core.getLesson(id).lesson.title, en["lesson:" + id].title);
    const other = ids.find(x => x !== id);
    assert.equal(box.sandbox.LINGUAI.lessonLanguage("ar", other), "ar");
    const problems = [];
    checkPartialCourse(plain(box.sandbox.I18n.courseOverrides("ar")), { "a1-01.js": ar, "a1-02.js": overlayFile("ar", "a1-02.js"), "a1-03.js": overlayFile("ar", "a1-03.js"), "a2-01.js": overlayFile("ar", "a2-01.js"), "a2-02.js": overlayFile("ar", "a2-02.js"), "b1-01.js": overlayFile("ar", "b1-01.js"), "b2-01.js": overlayFile("ar", "b2-01.js"), "b2-02.js": overlayFile("ar", "b2-02.js"), "b2-03.js": overlayFile("ar", "b2-03.js") }, { ...overlays("pl"), ...overlayFile("pl", "a1-02.js"), ...overlayFile("pl", "a1-03.js"), ...overlayFile("pl", "a2-01.js"), ...overlayFile("pl", "a2-02.js"), ...overlayFile("pl", "b1-01.js"), ...overlayFile("pl", "b2-01.js"), ...overlayFile("pl", "b2-02.js"), ...overlayFile("pl", "b2-03.js") }, problems);
    assert.ok(problems.some(p => p.includes(id + ".grammar")));
  }
});

test("new Arabic vocabulary glosses do not overwrite English or alter lesson progress and review scheduling", () => {
  const box = setup(), C = box.Core;
  select(box, "en"); C.addCard("il libro", "book", ids[0]); C.addCard("lo zaino", "backpack", ids[1]);
  C.recordLesson(ids[0], 8, 9, 80); C.recordLesson(ids[1], 9, 9, 90);
  select(box, "ar"); C.addCard("il libro", "كتاب", ids[0]); C.addCard("lo zaino", "حقيبة ظهر", ids[1]);
  const before = plain(C.state);
  for (const lang of ["en", "ar", "en", "ar"]) {
    select(box, lang);
    assert.equal(C.cardTr(C.state.srs[C.cardKey("il libro")]), lang === "ar" ? "كتاب" : "book");
    assert.equal(C.cardTr(C.state.srs[C.cardKey("lo zaino")]), lang === "ar" ? "حقيبة ظهر" : "backpack");
    const current = plain(C.state); delete current.settings.lang;
    const expected = plain(before); delete expected.settings.lang;
    assert.deepEqual(current, expected);
  }
});

function overlayFile(lang,file){let map;vm.runInNewContext(readFileSync(join(ROOT,"data/i18n",lang,file),"utf8"),{LINGUAI:{addStrings(_l,value){map=JSON.parse(JSON.stringify(value));}}});return map;}
