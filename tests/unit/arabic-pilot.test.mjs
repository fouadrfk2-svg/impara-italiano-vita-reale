import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { loadEngine, CORE, ROOT } from "./_harness.mjs";

const files = [...CORE, "assets/js/i18n.js", "assets/js/i18n-merge.js", "data/i18n/ui-en.js", "data/i18n/ui-ar.js"];
function setup() {
  const box = loadEngine({ files });
  box.Core.load();
  return box;
}
function dictionaries() {
  const bags = {}, ctx = { LINGUAI: { addUI: (lang, data) => { bags[lang] = data; } } };
  vm.createContext(ctx);
  ["en", "ar"].forEach(l => vm.runInContext(readFileSync(join(ROOT, "data/i18n/ui-" + l + ".js"), "utf8"), ctx));
  return bags;
}
const vars = text => [...String(text).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

describe("Arabic interface pilot", () => {
  test("Arabic is selectable and detected from regional browser preferences", () => {
    const { I18n } = setup().sandbox;
    assert.equal(I18n.LANGS.filter(l => l.code === "ar").length, 1);
    assert.equal(I18n.LANGS.find(l => l.code === "ar").name, "العربية");
    assert.equal(I18n.pickLang(["ar-MA", "fr-FR"]), "ar");
    assert.equal(I18n.contentLanguage("ar"), "en");
    for (const lang of ["pl", "en", "es", "fr", "de"]) assert.equal(I18n.contentLanguage(lang), lang);
  });

  test("all translated keys exist, preserve variables and include every Arabic plural category", () => {
    const { en, ar } = dictionaries();
    assert.ok(Object.keys(ar).length > 150, "this must be a usable interface pilot");
    for (const [key, value] of Object.entries(ar)) {
      assert.ok(key in en, "unknown key: " + key);
      assert.equal(typeof value, typeof en[key], key);
      const reference = typeof en[key] === "object" ? en[key].other : en[key];
      if (typeof value === "object") {
        for (const category of new Intl.PluralRules("ar").resolvedOptions().pluralCategories) {
          assert.ok(value[category], key + ": missing " + category);
          // Natural Arabic singular/dual can express the number without {n}.
          assert.ok(vars(value[category]).every(v => vars(reference).includes(v)), key);
        }
      } else {
        assert.deepEqual(vars(value), vars(reference), key);
        assert.match(value, /[\u0600-\u06ff]/, key);
      }
    }
  });

  test("every English UI key has a readable Arabic translation or exact English fallback", () => {
    const box = setup(), I = box.sandbox.I18n, { en, ar } = dictionaries();
    for (const key of Object.keys(en)) {
      for (const n of [0, 1, 2, 3, 11, 100]) {
        I.set("en"); const expected = I.t(key, { n });
        I.set("ar"); const actual = I.t(key, { n });
        assert.equal(typeof actual, "string", key);
        assert.ok(actual.length, key);
        if (!(key in ar)) assert.equal(actual, expected, key + " must fall back to English");
      }
    }
  });

  test("fallback plurals use English rules even for Arabic zero and dual", () => {
    const box = setup(), I = box.sandbox.I18n;
    box.sandbox.LINGUAI.addUI("en", { pilot: { one: "one", other: "many" } });
    I.set("ar");
    assert.equal(I.t("pilot", { n: 1 }), "one");
    assert.equal(I.t("pilot", { n: 0 }), "many");
    assert.equal(I.t("pilot", { n: 2 }), "many");
    assert.equal(I.t("stats.lessons", { n: 2 }), "درسان");
  });

  test("Arabic loads the English base plus only declared lesson files and caches both", () => {
    const box = setup(), R = box.sandbox.Registry;
    assert.deepEqual(R.i18nPaths("ar", ["a1-01.js"]), ["data/i18n/en/a1-01.js", "data/i18n/ar/a1-01.js"]);
    R.markI18n(["data/i18n/en/a1-01.js", "data/i18n/ar/a1-01.js"], []);
    assert.deepEqual(R.i18nPaths("ar", ["a1-01.js"]), []);
    R.setLanguage("ar", () => {});
    box.settleScripts();
    assert.ok(box.scripts.length > 0);
    assert.deepEqual(Array.from(box.scripts), ["curriculum-index.js", "conversations.js", "grammar-reference.js", "phonetics.js", "readings.js", "writing.js", "interference.js"].map(f => "data/i18n/en/" + f).concat(["data/i18n/ar/curriculum-index.js", "data/i18n/ar/conversations.js", "data/i18n/ar/grammar-reference.js", "data/i18n/ar/phonetics.js", "data/i18n/ar/readings.js", "data/i18n/ar/writing.js"]));
  });

  test("a failed English fallback file remains retryable and is reported", () => {
    const box = setup(), R = box.sandbox.Registry;
    let failed;
    R.setLanguage("ar", result => { failed = result; });
    box.settleScripts(["data/i18n/en/writing.js"]);
    assert.deepEqual(Array.from(failed), ["data/i18n/en/writing.js"]);
    assert.deepEqual(R.i18nPaths("ar", ["writing.js"]), ["data/i18n/en/writing.js"]);
  });

  test("Spanish to Arabic reapplies complete English content across all course families", () => {
    const box = setup(), ctx = box.sandbox;
    const core = readdirSync(join(ROOT, "data/core")).filter(f => f.endsWith(".js") && f !== "audio-index.js");
    // The runtime registers the index before lesson files and long readings.
    const order = ["curriculum-index.js", "readings.js", ...core.filter(f => !["curriculum-index.js", "readings.js"].includes(f)).sort()];
    for (const file of order) vm.runInContext(readFileSync(join(ROOT, "data/core", file), "utf8"), ctx);
    for (const lang of ["en", "es"]) {
      for (const file of readdirSync(join(ROOT, "data/i18n", lang)).filter(f => f.endsWith(".js"))) {
        vm.runInContext(readFileSync(join(ROOT, "data/i18n", lang, file), "utf8"), ctx);
      }
    }
    const snapshot = () => JSON.stringify({ levels: ctx.Core.registry.levels, conversations: ctx.CONVERSATIONS, grammar: ctx.GRAMMAR_REF, phonetics: ctx.PHONETICS, readings: ctx.READINGS, writing: ctx.WRITING, interference: ctx.INTERFERENCE });
    ctx.LINGUAI.applyStrings("en"); const english = snapshot();
    ctx.LINGUAI.applyStrings("es"); assert.notEqual(snapshot(), english);
    ctx.LINGUAI.applyStrings("ar"); assert.equal(snapshot(), english);
    ctx.LINGUAI.applyStrings("ar"); assert.equal(snapshot(), english, "idempotent fallback");
  });

  test("language switches preserve lesson scores, SRS, drafts and all non-language settings", () => {
    const box = setup(), C = box.Core;
    C.recordLesson("a1-u01-l1", 8, 10, 60);
    C.addCard("ciao", "hello", "a1-u01-l1");
    C.state.writing = { example: { text: "Buongiorno, mi chiamo Sara." } };
    const snapshot = () => { const s = JSON.parse(JSON.stringify(C.state)); delete s.settings.lang; return s; };
    const before = snapshot();
    for (const lang of ["ar", "fr", "en", "ar"]) {
      C.setLanguage(lang, () => {}); box.settleScripts(); box.flush();
      assert.deepEqual(snapshot(), before);
      assert.equal(box.stored().settings.lang, lang);
    }
    C.load(); assert.deepEqual(snapshot(), before);
    assert.equal(C.state.schema, 2);
  });

  test("Arabic vocabulary cards use English glosses without losing existing Polish glosses", () => {
    const box = setup(), C = box.Core;
    C.state.settings.lang = "pl";
    const key = C.addCard("ciao", "cześć", "lesson");
    C.state.srs[key].tr.en = "hello";
    C.state.settings.lang = "ar";
    assert.equal(C.cardTr(C.state.srs[key]), "hello");
    C.addCard("grazie", "thank you", "lesson");
    assert.equal(C.state.srs.grazie.tr.en, "thank you");
    assert.equal(C.state.srs[key].tr.pl, "cześć");
  });
});
