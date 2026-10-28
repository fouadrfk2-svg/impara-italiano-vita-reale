/* ============================================================
   Attaching the student's texts to the course content (assets/js/i18n-merge.js).

   An overlay joins the neutral layer BY INDEX: the nth element of the overlay
   attaches to the nth element of the data. The shape is guarded by
   scripts/parity.mjs, but only the shape - the merging mechanism itself had
   no test.

   Three invariants whose breakage upsets nothing on screen:
   - NEUTRAL fields (Italian sentences, answer keys) must never come from an
     overlay: a change of the explanation language would orphan the
     recordings, because their names are computed from the Italian content;
   - merging is IDEMPOTENT and reversible: a second language lays over the
     same objects without reloading the page;
   - a missing overlay entry leaves the field as it was rather than clearing
     it to undefined - an empty lesson title looks like a missing lesson.

   Lessons are one of the eight categories this file merges. The other seven
   (conversations, grammar, minimal pairs, readings, writing, false friends,
   units) ran without a single test until now, even though two of them have
   exceptions to the general rule in the code.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadEngine, CORE } from "./_harness.mjs";

const I18N = ["assets/js/i18n.js", "assets/js/i18n-merge.js"];

/**
 * The real merging route: the overlay comes in through LINGUAI.addStrings and
 * applyStrings walks the course registry - exactly as registry.loadLevelData
 * does after fetching a level's files.
 *
 * i18n.js is loaded AFTER the engine so that it overrides the sandbox I18n
 * stub.
 */
function swiezy() {
  const box = loadEngine({ files: [...CORE, ...I18N] });
  box.Core.load();
  // Synthetic merge tests isolate mechanics from public locale routing.
  box.sandbox.I18n.contentLanguage = function(lang){ return lang; };
  return {
    box: box,
    I18n: box.sandbox.I18n,
    LINGUAI: box.sandbox.LINGUAI,
    Registry: box.sandbox.Registry
  };
}

/** A lesson in the neutral layer: Italian, answer keys, structure. */
function lekcjaNeutralna() {
  return {
    id: "a1-u01-l1",
    cefr: "A1",
    titleIt: "Il caffè",
    tags: ["g-presente"],
    grammar: {
      examples: [{ it: "Prendo un caffè." }, { it: "Bevo un tè." }]
    },
    vocab: [{ it: "caffè", ex: "un caffè, per favore" }, { it: "tè" }],
    dialogue: { titleIt: "Al bar", lines: [{ who: "A", it: "Un caffè?" }, { who: "B", it: "Sì, grazie." }] },
    exercises: [
      { t: "mcq", a: 1, opts: null },
      { t: "match", pairs: [{ it: "caffè" }, { it: "tè" }] },
      { t: "gender", items: [{ it: "caffè", a: "il" }] },
      { t: "dialogue", lines: [{ sp: "A", it: "Ciao", a: 0, choices: ["Ciao"] }] }
    ]
  };
}

/** The overlay: nothing but what the student reads in their own language. */
function nakladkaAr() {
  return {
    "lesson:a1-u01-l1": {
      title: "قهوة",
      theme: "في المقهى",
      objectives: ["طلب قهوة"],
      theory: ["يشرب الإيطاليون القهوة واقفين."],
      culture: { title: "مقهى", text: "المقهى الإيطالي ليس حانة." },
      grammar: { title: "المضارع", note: "ثلاث مجموعات تصريف.", table: { head: ["الشخص"], rows: [["io"]] },
        examples: [{ tr: "أطلب قهوة." }, { tr: "أشرب الشاي." }] },
      vocab: ["قهوة", "شاي"],
      dialogue: ["قهوة؟", "نعم، شكرًا."],
      exercises: [
        { q: "ماذا تطلب؟", why: "لأن هذا هو المطلوب", opts: ["الشاي", "القهوة"] },
        { pairs: ["قهوة", "شاي"] },
        { items: ["قهوة"] },
        { lines: [{ tr: "ألقِ التحية", answerTr: "مرحبًا" }] }
      ]
    }
  };
}

function przygotuj() {
  const box = swiezy();
  const L = lekcjaNeutralna();
  box.Registry.registerLevel({ code: "A1", dataFiles: [], units: [{ id: "a1-u01", lessons: [L] }] });
  box.LINGUAI.addStrings("ar", nakladkaAr());
  return Object.assign(box, { L });
}

describe("merging an overlay with the neutral layer", () => {
  test("the student's texts land in place", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    assert.equal(L.title, "قهوة");
    assert.equal(L.theme, "في المقهى");
    assert.deepEqual(Array.from(L.objectives), ["طلب قهوة"]);
    assert.equal(L.culture.title, "مقهى");
  });

  test("the neutral fields stay untouched", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    assert.equal(L.titleIt, "Il caffè", "the Italian title is the lesson's identity");
    assert.equal(L.vocab[0].it, "caffè");
    assert.equal(L.dialogue.lines[0].it, "Un caffè?");
    assert.equal(L.exercises[0].a, 1, "the answer key does not come from the overlay");
    assert.equal(L.exercises[2].items[0].a, "il", "the article is an answer key, not copy");
    assert.deepEqual(Array.from(L.tags), ["g-presente"]);
  });

  test("arrays join by index, every entry with its own", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    assert.equal(L.vocab[0].tr, "قهوة");
    assert.equal(L.vocab[1].tr, "شاي");
    assert.equal(L.dialogue.lines[1].tr, "نعم، شكرًا.");
    assert.equal(L.grammar.examples[1].tr, "أشرب الشاي.");
  });

  test("exercises get their fields, each type in its own way", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    assert.deepEqual(Array.from(L.exercises[0].opts), ["الشاي", "القهوة"]);
    assert.equal(L.exercises[1].pairs[1].tr, "شاي");
    assert.equal(L.exercises[2].items[0].gloss, "قهوة");
    assert.equal(L.exercises[3].lines[0].tr, "ألقِ التحية");
    assert.equal(L.exercises[3].lines[0].answerTr, "مرحبًا");
  });

  test("the whole grammar table comes from the overlay, cells included", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    assert.equal(L.grammar.title, "المضارع");
    assert.deepEqual(Array.from(L.grammar.table.head), ["الشخص"]);
  });

  test("a unit gets its title separately from the lessons", () => {
    const { LINGUAI, Registry } = swiezy();
    const u = { id: "a1-u01", titleIt: "Al bar", lessons: [] };
    Registry.registerLevel({ code: "A1", dataFiles: [], units: [u] });
    LINGUAI.addStrings("ar", { "unit:a1-u01": { title: "في المقهى", grammarNote: "Czas teraźniejszy." } });
    LINGUAI.applyStrings("ar");
    assert.equal(u.title, "في المقهى");
    assert.equal(u.grammarNote, "Czas teraźniejszy.");
    assert.equal(u.titleIt, "Al bar");
  });

  test("a level gets a name and a description", () => {
    const { LINGUAI, Registry } = swiezy();
    const lv = { code: "A1", dataFiles: [], units: [] };
    Registry.registerLevel(lv);
    LINGUAI.addStrings("ar", { "level:A1": { name: "مبتدئ", desc: "الخطوات الأولى." } });
    LINGUAI.applyStrings("ar");
    assert.equal(lv.name, "مبتدئ");
    assert.equal(lv.desc, "الخطوات الأولى.");
    assert.equal(lv.code, "A1", "the level code is an identifier, not copy");
  });
});

describe("the robustness of the merge", () => {
  test("applying the same language twice breaks nothing", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    const poPierwszym = L.title;
    LINGUAI.applyStrings("ar");
    assert.equal(L.title, poPierwszym);
    assert.equal(L.vocab[0].tr, "قهوة", "not appended twice");
    assert.equal(L.vocab[0].it, "caffè");
  });

  test("a second language overwrites the texts on the same objects", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("ar");
    LINGUAI.addStrings("en", { "lesson:a1-u01-l1": { title: "Coffee", vocab: ["coffee", "tea"] } });
    LINGUAI.applyStrings("en");

    assert.equal(L.title, "Coffee", "with no page reload");
    assert.equal(L.vocab[0].tr, "coffee");
    assert.equal(L.titleIt, "Il caffè", "the Italian is still the same");
    assert.equal(L.theme, "في المقهى", "a field absent from the new overlay stays from the previous one");
  });

  test("no overlay for a language leaves the lesson as it was", () => {
    const { LINGUAI, L } = przygotuj();
    LINGUAI.applyStrings("en");
    assert.equal(L.title, undefined, "nothing was added");
    assert.equal(L.titleIt, "Il caffè", "and nothing was lost");
  });

  test("an overlay shorter than the data attaches to what it covers", () => {
    const { LINGUAI, Registry } = swiezy();
    const L = lekcjaNeutralna();
    Registry.registerLevel({ code: "A1", dataFiles: [], units: [{ id: "u", lessons: [L] }] });
    LINGUAI.addStrings("ar", { "lesson:a1-u01-l1": { vocab: ["قهوة"] } });
    LINGUAI.applyStrings("ar");
    assert.equal(L.vocab[0].tr, "قهوة");
    assert.equal(L.vocab[1].tr, undefined, "the second entry stays without a gloss rather than taking somebody else's");
    assert.equal(L.vocab[1].it, "tè", "and does not lose its Italian");
  });

  test("a unit test travels the same route as an ordinary lesson", () => {
    const { LINGUAI, Registry } = swiezy();
    const test1 = Object.assign(lekcjaNeutralna(), { id: "a1-u01-test" });
    Registry.registerLevel({ code: "A1", dataFiles: [], units: [{ id: "u", lessons: [], test: test1 }] });
    LINGUAI.addStrings("ar", { "lesson:a1-u01-test": { title: "اختبار" } });
    LINGUAI.applyStrings("ar");
    assert.equal(test1.title, "اختبار");
  });

  test("hasStrings says whether a language came in at all", () => {
    const { LINGUAI } = swiezy();
    assert.equal(LINGUAI.hasStrings("ar"), false, "before the files are loaded there is nothing");
    LINGUAI.addStrings("ar", { "lesson:x": { title: "x" } });
    assert.equal(LINGUAI.hasStrings("ar"), true);
    assert.equal(LINGUAI.hasStrings("en"), false);
  });
});

describe("conversations", () => {
  function rozmowa() {
    return {
      id: "c1", titleIt: "Al bar", icon: "☕",
      turns: [
        { sp: "A", it: "Cosa prende?" },
        { sp: "TY", accept: ["un caffè"], opts: [
          { accept: ["solo un caffè"], go: "fine" },
          { accept: ["un caffè e un dolce"] }
        ] },
        { id: "fine", sp: "A", it: "Subito." }
      ]
    };
  }

  function zRozmowa() {
    const s = swiezy();
    const c = rozmowa();
    s.box.sandbox.CONVERSATIONS = [c];
    return Object.assign(s, { c });
  }

  test("the lines and the prompts come from the overlay", () => {
    const { LINGUAI, c } = zRozmowa();
    LINGUAI.addStrings("ar", { "conv:c1": {
      title: "في المقهى", setting: "صباحًا.", closing: "أحسنت.",
      turns: [{ tr: "Co pan zamawia?" }, { task: "Zamów kawę" }, { tr: "Już podaję." }]
    } });
    LINGUAI.applyStrings("ar");

    assert.equal(c.title, "في المقهى");
    assert.equal(c.setting, "صباحًا.");
    assert.equal(c.turns[0].tr, "Co pan zamawia?");
    assert.equal(c.turns[1].task, "Zamów kawę");
  });

  test("every branch of a fork has a translation of its own", () => {
    const { LINGUAI, c } = zRozmowa();
    LINGUAI.addStrings("ar", { "conv:c1": {
      turns: [{}, { opts: [{ tr: "قهوة فقط" }, { tr: "قهوة وحلوى" }] }, {}]
    } });
    LINGUAI.applyStrings("ar");

    assert.equal(c.turns[1].opts[0].tr, "قهوة فقط");
    assert.equal(c.turns[1].opts[1].tr, "قهوة وحلوى");
  });

  test("the direction of a fork and the answer key stay neutral", () => {
    /* Were `go` or `accept` to enter the overlay, changing the explanation
       language could rearrange the flow of the dialogue. */
    const { LINGUAI, c } = zRozmowa();
    LINGUAI.addStrings("ar", { "conv:c1": {
      turns: [{}, { opts: [{ tr: "قهوة فقط", go: "gdzieindziej", accept: ["cokolwiek"] }] }, {}]
    } });
    LINGUAI.applyStrings("ar");

    assert.equal(c.turns[1].opts[0].go, "fine", "the jump target does not come from the overlay");
    assert.deepEqual(Array.from(c.turns[1].opts[0].accept), ["solo un caffè"]);
  });
});

describe("a grammar reference entry", () => {
  test("section titles go by index, entries go by id", () => {
    const s = swiezy();
    const sekcja = { title: "", items: [{ id: "g-presente" }, { id: "g-passato" }] };
    s.box.sandbox.GRAMMAR_REF = [sekcja];
    s.LINGUAI.addStrings("ar", {
      "refsec:titles": ["الفعل"],
      "ref:g-presente": { title: "المضارع", sub: "presente", body: ["ثلاث مجموعات تصريف."] }
    });
    s.LINGUAI.applyStrings("ar");

    assert.equal(sekcja.title, "الفعل");
    assert.equal(sekcja.items[0].title, "المضارع");
    assert.equal(sekcja.items[1].title, undefined, "an entry with no overlay stays untitled rather than taking somebody else's title");
    assert.equal(sekcja.items[0].id, "g-presente", "the id is a key, not copy");
  });
});

describe("minimal pairs, readings, writing", () => {
  test("a minimal pair gets its glosses and its contrastive note", () => {
    const s = swiezy();
    const zbior = { id: "ph1", pairs: [{ a: "nonno", b: "nono" }] };
    s.box.sandbox.PHONETICS = [zbior];
    s.LINGUAI.addStrings("ar", { "ph:ph1": {
      title: "الحروف الساكنة المضعّفة", note: "قد يغيّر طول الصوت معنى الكلمة.",
      contrast: "لا يميز العربية طول الصامت بالطريقة نفسها.",
      pairs: [{ glossA: "جدّ", glossB: "التاسع" }]
    } });
    s.LINGUAI.applyStrings("ar");

    assert.equal(zbior.contrast, "لا يميز العربية طول الصامت بالطريقة نفسها.");
    assert.equal(zbior.pairs[0].glossA, "جدّ");
    assert.equal(zbior.pairs[0].a, "nonno", "the Italian words of the pair stay neutral: they have recordings");
  });

  test("a reading takes its title, the hard-words panel and the tap dictionary", () => {
    const s = swiezy();
    const r = { id: "r1", titleIt: "Il mercato", sentences: ["Vado al mercato."] };
    s.box.sandbox.READINGS = [r];
    s.LINGUAI.addStrings("ar", { "read:r1": {
      title: "السوق", gloss: { mercato: "السوق" }, lex: { vado: "أذهب" }
    } });
    s.LINGUAI.applyStrings("ar");

    assert.equal(r.title, "السوق");
    assert.equal(r.gloss.mercato, "السوق");
    assert.equal(r.lex.vado, "أذهب");
    assert.deepEqual(Array.from(r.sentences), ["Vado al mercato."]);
  });

  test("a writing task: the prompt from the overlay, the accepted Italian forms from the data", () => {
    const s = swiezy();
    const w = { id: "w1", titleIt: "بطاقة بريدية", items: [{ a: ["sono a"] }, { a: ["ti abbraccio"] }] };
    s.box.sandbox.WRITING = [w];
    s.LINGUAI.addStrings("ar", { "write:w1": {
      title: "بطاقة بريدية", brief: "اكتب إلى صديق.", checklist: ["أين أنت"],
      items: [{ q: "قل أين أنت" }, { q: "ودّع" }]
    } });
    s.LINGUAI.applyStrings("ar");

    assert.equal(w.title, "بطاقة بريدية");
    assert.equal(w.items[0].q, "قل أين أنت");
    assert.equal(w.items[1].q, "ودّع");
    assert.deepEqual(Array.from(w.items[0].a), ["sono a"], "the accepted Italian version is not copy to be translated");
  });
});

describe("false friends", () => {
  /* The ONLY category where the overlay can be shorter than the list and has
     the right to be: the trap exists only for the languages that have it. */
  test("an entry with no explanation in the new language loses the old one instead of keeping it", () => {
    const s = swiezy();
    const v = { id: "targa", it: "la targa" };
    s.box.sandbox.INTERFERENCE = [v];
    s.LINGUAI.addStrings("ar", { "int:targa": { looks: "السوق", mean: "لوحة تسجيل", why: "كلمة خادعة" } });
    s.LINGUAI.addStrings("en", { "int:inne": { looks: "x", mean: "y", why: "z" } });

    s.LINGUAI.applyStrings("ar");
    assert.equal(v.mean, "لوحة تسجيل");

    s.LINGUAI.applyStrings("en");
    assert.equal(v.looks, "", "in the English fallback this entry has no corresponding explanation");
    assert.equal(v.mean, "", "the Arabic explanation would stay on screen were it not for the clearing");
    assert.equal(v.why, "");
    assert.equal(v.it, "la targa", "the Italian entry stays: it is the headword");
  });
});
