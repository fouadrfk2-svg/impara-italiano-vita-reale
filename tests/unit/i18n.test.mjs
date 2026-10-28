/* ============================================================
   Interface strings (assets/js/i18n.js).

   Attaching texts to the course content has a file of its own next door
   (i18n-merge.test.mjs) — as the engine has had since the split.

   `t()` decides something no data file shows: the plural form. "1 dni" and
   "5 dzień" are not typos but the wrong category, and they only surface in
   front of the student, at one specific number.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadEngine, CORE } from "./_harness.mjs";

/** We load i18n.js AFTER the engine, so that it overrides the sandbox's I18n double. */
function swiezy() {
  const box = loadEngine({ files: [...CORE, "assets/js/i18n.js"] });
  box.Core.load();
  return { I18n: box.sandbox.I18n, LINGUAI: box.sandbox.LINGUAI };
}

function zNapisami(dict, lang) {
  const { I18n, LINGUAI } = swiezy();
  LINGUAI.addUI(lang || "ar", dict);
  I18n.set("ar");
  return I18n;
}

describe("napisy interfejsu", () => {
  test("a missing key comes back as the key and lands on the missing list", () => {
    const I18n = zNapisami({ "a.b": "jest" });
    assert.equal(I18n.t("nie.ma"), "nie.ma");
    assert.ok(I18n.missing().indexOf("nie.ma") >= 0);
    assert.equal(I18n.missing().indexOf("a.b"), -1, "a key that exists does not land on the missing list");
  });

  test("the variables go in where the braces are", () => {
    const I18n = zNapisami({ "x": "masz {n} punktów i {ile} dni" });
    assert.equal(I18n.t("x", { n: 5, ile: 2 }), "masz 5 punktów i 2 dni");
  });

  test("an unknown variable stays in the text instead of disappearing", () => {
    const I18n = zNapisami({ "x": "masz {n} i {czego}" });
    assert.equal(I18n.t("x", { n: 1 }), "masz 1 i {czego}");
  });

  test("Arabic selects all six CLDR plural categories", () => {
    const I18n = zNapisami({ "d": { zero: "صفر {n}", one: "واحد {n}", two: "اثنان {n}", few: "قليل {n}", many: "كثير {n}", other: "آخر {n}" } });
    assert.equal(I18n.t("d", { n: 0 }), "صفر 0");
    assert.equal(I18n.t("d", { n: 1 }), "واحد 1");
    assert.equal(I18n.t("d", { n: 2 }), "اثنان 2");
    assert.equal(I18n.t("d", { n: 3 }), "قليل 3");
    assert.equal(I18n.t("d", { n: 11 }), "كثير 11");
    assert.equal(I18n.t("d", { n: 100 }), "آخر 100");
  });

  test("missing interface plurals use English rules only as fallback", () => {
    const { I18n, LINGUAI } = swiezy();
    LINGUAI.addUI("en", { "l": { one: "{n} lesson", other: "{n} lessons" } });
    I18n.set("ar");
    assert.equal(I18n.t("l", { n: 1 }), "1 lesson");
    assert.equal(I18n.t("l", { n: 2 }), "2 lessons");
  });

  test("a missing number counts as zero, not as a missing form", () => {
    const I18n = zNapisami({ "l": { zero: "{n} دروس", one: "{n} درس", two: "{n} درسان", few: "{n} دروس", many: "{n} درسًا", other: "{n} درس" } });
    assert.equal(I18n.t("l"), "{n} دروس", "zero selects the Arabic zero category and an absent variable stays visible");
  });

  test("the public interface stays Arabic even when asked for an internal fallback", () => {
    const I18n = zNapisami({ "a": "a" }, "en");
    assert.equal(I18n.lang, "ar");
    assert.equal(I18n.locale(), "ar");
  });

  test("a string missing in the current language falls back to English, not to the key", () => {
    /* English remains an internal fallback when Arabic has no matching key. */
    const { I18n, LINGUAI } = swiezy();
    LINGUAI.addUI("en", { "x": "Fallback text" });
    LINGUAI.addUI("ar", {});
    I18n.set("ar");

    assert.equal(I18n.t("x"), "Fallback text");
    assert.ok(I18n.missing().indexOf("x") >= 0, "the gap is still visible on the list");
  });
});

describe("Arabic-only first visit", () => {
  test("Arabic regional preferences resolve to Arabic; other locales are not selectable", () => {
    const { I18n } = swiezy();
    assert.equal(I18n.pickLang(["ar-MA", "fr-FR"]), "ar");
    assert.equal(I18n.pickLang(["it-IT", "de-AT", "en"]), null);
  });

  test("a browser with none of the course languages gives null, not a guess", () => {
    const { I18n } = swiezy();
    assert.equal(I18n.pickLang(["it-IT", "ja"]), null);
    assert.equal(I18n.pickLang([]), null);
    assert.equal(I18n.pickLang(undefined), null);
  });
});

describe("applying translations to a root", () => {
  /* A rerendered view needs both visible copy and input hints translated. */
  test("apply translates text and placeholder inside the supplied root", () => {
    const I18n = zNapisami({ greeting: "مرحبًا", search: "ابحث" });
    const text = {
      textContent: "Old text",
      getAttribute: name => name === "data-i18n" ? "greeting" : null
    };
    const attributes = { "data-i18n-placeholder": "search", placeholder: "Old hint" };
    const input = {
      getAttribute: name => attributes[name] ?? null,
      setAttribute: (name, value) => { attributes[name] = value; }
    };
    const elements = { "[data-i18n]": [text], "[data-i18n-placeholder]": [input] };
    const root = { querySelectorAll: selector => elements[selector] || [] };
    I18n.apply(root);
    assert.equal(text.textContent, "مرحبًا");
    assert.equal(attributes.placeholder, "ابحث");
  });

  /* An incomplete plural dictionary must still produce readable text. */
  test("a missing plural category uses the other form", () => {
    const I18n = zNapisami({ days: { one: "{n} درس", other: "{n} دروس" } });
    assert.equal(I18n.t("days", { n: 1 }), "1 درس");
    assert.equal(I18n.t("days", { n: 3 }), "3 دروس");
  });
});
