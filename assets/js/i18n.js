/* ============================================================
   i18n.js — interface strings in the student's language.

   I18n.t("nav.path") returns a string, I18n.apply(root) rewrites the
   elements marked with data-i18n in already rendered HTML, I18n.set(lang)
   switches the language together with the lang attribute and number
   formatting.

   The file described itself as "two things" and was two things: these
   strings plus attaching the student's texts to the course content. That
   second half now lives in i18n-merge.js. They shared no state — two
   separate dictionaries, two separate sets of keys — so all that is left
   here is the split nobody has to keep in their head.

   Arabic is the only interface language. English remains an internal
   fallback for incomplete educational entries and missing interface keys.

   No external dependencies. Classic script (works from file://).
   ============================================================ */
(function (global) {
  "use strict";

  var LINGUAI = global.LINGUAI = global.LINGUAI || {};

  /* Arabic is the interface locale; English is used only for fallback data. */
  var LOCALE = { en: "en-US", ar: "ar" };
  var FALLBACK = "en";

  /**
   * The one public interface language and its explicitly translated content.
   */
  var LANGS = [
    // Partial course pilot: English baseline plus explicitly declared lessons.
    { code: "ar", flag: "🌐", name: "العربية", contentLanguage: "en", contentOverrides: {"conversations.js":["conv:bar-mattina","conv:presentarsi","conv:mercato","conv:ristorante","conv:treno","conv:medico","conv:affitto","conv:colloquio","conv:burocrazia","conv:dibattito","conv:ristorante-scelte","conv:treno-perso","conv:casa-visita","conv:medico-gola"],"curriculum-index.js":["level:A1","level:A2","level:B1","level:B2","level:C1"],"grammar-reference.js":["refsec:titles","ref:g-nome-genere","ref:g-nome-plurale","ref:g-articolo-det","ref:g-articolo-indet","ref:g-articolo-omissione","ref:g-agg-accordo","ref:g-agg-posizione","ref:g-agg-gradi","ref:g-possessivi","ref:g-pron-soggetto","ref:g-pron-diretti","ref:g-pron-indiretti","ref:g-pron-combinati","ref:g-ci-ne","ref:g-relativi","ref:g-si","ref:g-verbi-pronominali","ref:g-presente","ref:g-passato-prossimo","ref:g-imperfetto","ref:g-futuro","ref:g-trapassato","ref:g-passato-remoto","ref:g-condizionale","ref:g-congiuntivo-pres","ref:g-congiuntivo-imp","ref:g-periodo-ipotetico","ref:g-imperativo","ref:g-gerundio","ref:g-infinito","ref:g-passivo","ref:g-preposizioni","ref:g-prep-verbi","ref:g-avverbi","ref:g-connettivi","ref:g-frase","ref:g-discorso-indiretto","ref:g-registri","ref:g-fonologia"],"readings.js":["read:r-a1-mattina","read:r-a1-mercato","read:r-a2-treno","read:r-a2-casa","read:r-a2-medico","read:r-b1-affitto","read:r-b1-lavoro","read:r-b1-giornale","read:r-b2-lavoro-remoto","read:r-b2-cibo","read:r-c1-burocrazia","read:r-a2-scontrino","read:r-a2-piano-terra","read:r-a2-farmacia-turno","read:r-a2-ferie","read:r-b1-condominio","read:r-b1-codice-fiscale","read:r-b1-convalida","read:r-b1-caffe-sospeso","read:r-b2-case-un-euro","read:r-b2-dialetti","read:r-b2-tirocinio","read:r-c1-due-giugno"],"library-a1.js":["read:lib-a1-giornata"],"library-a2.js":["read:lib-a2-casa"],"library-b1.js":["read:lib-b1-permesso"],"library-b2.js":["read:lib-b2-dialetto"],"library-c1.js":["read:lib-c1-burocrazia"],"writing.js":["write:w-a2-giornata","write:w-a2-ieri","write:w-b1-email","write:w-b1-opinione","write:w-b2-argomentare","write:w-c1-riassunto"],"phonetics.js":["ph:ph-doppie","ph:ph-accento","ph:ph-e-aperta","ph:ph-gli","ph:ph-dolci-dure"]}, courseOverrides: {"a1-01.js":["lesson:a1-u01-l1","lesson:a1-u01-l2","lesson:a1-u01-l3","unit:a1-u01","lesson:a1-u01-l4","lesson:a1-u01-test","unit:a1-u02","lesson:a1-u02-l1","lesson:a1-u02-l2","lesson:a1-u02-l3","lesson:a1-u02-l4","lesson:a1-u02-test","unit:a1-u03","lesson:a1-u03-l1","lesson:a1-u03-l2","lesson:a1-u03-l3","lesson:a1-u03-l4","lesson:a1-u03-test"],"a1-02.js":["unit:a1-u04","lesson:a1-u04-l1","lesson:a1-u04-l2","lesson:a1-u04-l3","lesson:a1-u04-l4","lesson:a1-u04-test","unit:a1-u05","lesson:a1-u05-l1","lesson:a1-u05-l2","lesson:a1-u05-l3","lesson:a1-u05-l4","lesson:a1-u05-test","unit:a1-u06","lesson:a1-u06-l1","lesson:a1-u06-l2","lesson:a1-u06-l3","lesson:a1-u06-l4","lesson:a1-u06-test","unit:a1-u07","lesson:a1-u07-l1","lesson:a1-u07-l2","lesson:a1-u07-l3","lesson:a1-u07-l4","lesson:a1-u07-test"],"a1-03.js":["unit:a1-u08","lesson:a1-u08-l1","lesson:a1-u08-l2","lesson:a1-u08-l3","lesson:a1-u08-l4","lesson:a1-u08-test","unit:a1-u09","lesson:a1-u09-l1","lesson:a1-u09-l2","lesson:a1-u09-l3","lesson:a1-u09-l4","lesson:a1-u09-test","unit:a1-u10","lesson:a1-u10-l1","lesson:a1-u10-l2","lesson:a1-u10-l3","lesson:a1-u10-l4","lesson:a1-u10-test"],"a2-01.js":["unit:a2-u01","lesson:a2-u01-l1","lesson:a2-u01-l2","lesson:a2-u01-l3","lesson:a2-u01-l4","lesson:a2-u01-test","unit:a2-u02","lesson:a2-u02-l1","lesson:a2-u02-l2","lesson:a2-u02-l3","lesson:a2-u02-l4","lesson:a2-u02-test","unit:a2-u03","lesson:a2-u03-l1","lesson:a2-u03-l2","lesson:a2-u03-l3","lesson:a2-u03-l4","lesson:a2-u03-test","unit:a2-u04","lesson:a2-u04-l1","lesson:a2-u04-l2","lesson:a2-u04-l3","lesson:a2-u04-l4","lesson:a2-u04-test"],"a2-02.js":["unit:a2-u05","lesson:a2-u05-l1","lesson:a2-u05-l2","lesson:a2-u05-l3","lesson:a2-u05-l4","lesson:a2-u05-test","unit:a2-u06","lesson:a2-u06-l1","lesson:a2-u06-l2","lesson:a2-u06-l3","lesson:a2-u06-l4","lesson:a2-u06-test","unit:a2-u07","lesson:a2-u07-l1","lesson:a2-u07-l2","lesson:a2-u07-l3","lesson:a2-u07-l4","lesson:a2-u07-test","unit:a2-u08","lesson:a2-u08-l1","lesson:a2-u08-l2","lesson:a2-u08-l3","lesson:a2-u08-l4","lesson:a2-u08-test"],"b1-01.js":["unit:b1-u01","lesson:b1-u01-l1","lesson:b1-u01-l2","lesson:b1-u01-l3","lesson:b1-u01-l4","lesson:b1-u01-test","unit:b1-u02","lesson:b1-u02-l1","lesson:b1-u02-l2","lesson:b1-u02-l3","lesson:b1-u02-l4","lesson:b1-u02-test","unit:b1-u03","lesson:b1-u03-l1","lesson:b1-u03-l2","lesson:b1-u03-l3","lesson:b1-u03-l4","lesson:b1-u03-test","unit:b1-u04","lesson:b1-u04-l1","lesson:b1-u04-l2","lesson:b1-u04-l3","lesson:b1-u04-l4","lesson:b1-u04-test"],"b2-01.js":["unit:b2-u01","lesson:b2-u01-l1","lesson:b2-u01-l2","lesson:b2-u01-l3","lesson:b2-u01-test","unit:b2-u02","lesson:b2-u02-l1","lesson:b2-u02-l2","lesson:b2-u02-l3","lesson:b2-u02-test","unit:b2-u03","lesson:b2-u03-l1","lesson:b2-u03-l2","lesson:b2-u03-l3","lesson:b2-u03-test","unit:b2-u04","lesson:b2-u04-l1","lesson:b2-u04-l2","lesson:b2-u04-l3","lesson:b2-u04-test"],"b2-02.js":["unit:b2-u05","lesson:b2-u05-l1","lesson:b2-u05-l2","lesson:b2-u05-l3","lesson:b2-u05-test"],"b2-03.js":["unit:b2-u06","lesson:b2-u06-l1","lesson:b2-u06-l2","lesson:b2-u06-l3","lesson:b2-u06-test"],"c1-01.js":["unit:c1-u01","lesson:c1-u01-l1","lesson:c1-u01-l2","lesson:c1-u01-l3","lesson:c1-u01-test","unit:c1-u02","lesson:c1-u02-l1","lesson:c1-u02-l2","lesson:c1-u02-l3","lesson:c1-u02-test","unit:c1-u03","lesson:c1-u03-l1","lesson:c1-u03-l2","lesson:c1-u03-l3","lesson:c1-u03-test"],"c1-02.js":["unit:c1-u04","lesson:c1-u04-l1","lesson:c1-u04-l2","lesson:c1-u04-l3","lesson:c1-u04-test"],"c1-03.js":["unit:c1-u05","lesson:c1-u05-l1","lesson:c1-u05-l2","lesson:c1-u05-l3","lesson:c1-u05-test"]} }
  ];

  /* ═══════════════════════════════════════════════════════════
     INTERFACE STRINGS
     ═══════════════════════════════════════════════════════════ */

  var ui = {};          // lang -> key -> string or plural forms
  var absent = {};      // keys that were missing — for I18n.missing()
  var current = "ar";

  /** Registers an interface dictionary. Called by data/i18n/ui-<lang>.js */
  function addUI(lang, dict) {
    if (lang !== "ar" && lang !== "en") return;
    var bag = ui[lang] || (ui[lang] = {});
    Object.keys(dict).forEach(function (k) { bag[k] = dict[k]; });
  }

  /**
   * Picks the number form by the rules of the language, not by "n === 1".
   * Arabic uses six CLDR plural categories; English fallback forms use the
   * English locale so missing Arabic UI keys remain grammatically consistent.
   */
  function plural(forms, n, lang) {
    var cat = new Intl.PluralRules(LOCALE[lang] || lang).select(n || 0);
    return forms[cat] !== undefined ? forms[cat] : forms.other;
  }

  function interpolate(s, vars) {
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] !== undefined ? vars[name] : m;
    });
  }

  /**
   * An interface string. A missing key is visible, not silent:
   * the key itself comes back and lands in I18n.missing().
   */
  function t(key, vars) {
    var lang = current;
    var v = ui[lang] && ui[lang][key];
    if (v === undefined) {
      absent[key] = true;
      v = ui[FALLBACK] && ui[FALLBACK][key];
      lang = FALLBACK; // English fallback plurals follow English, not Arabic rules.
    }
    if (v === undefined) return key;
    if (typeof v === "object") v = plural(v, vars && vars.n, lang);
    return interpolate(v, vars);
  }

  function missing() { return Object.keys(absent).sort(); }

  /* ---------------- Substitution in rendered HTML ---------------- */

  /* DOM attribute -> the attribute it sets */
  var ATTRS = {
    "data-i18n-label": "aria-label",
    "data-i18n-content": "content",
    "data-i18n-placeholder": "placeholder"
  };

  /** Rewrites the static strings for the current language. */
  function apply(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Object.keys(ATTRS).forEach(function (data) {
      scope.querySelectorAll("[" + data + "]").forEach(function (el) {
        el.setAttribute(ATTRS[data], t(el.getAttribute(data)));
      });
    });
  }

  /** Changes the language of explanations: strings, the lang attribute, date formatting. */
  function setLang() {
    current = "ar";
    document.documentElement.setAttribute("lang", LOCALE[current] || current);
    document.documentElement.setAttribute("dir", current === "ar" ? "rtl" : "ltr");
    apply();
  }

  function locale() { return LOCALE[current] || current; }

  /** Pilot languages reuse a complete content overlay, never the previous selection. */
  function contentLanguage(_lang) {
    return "en";
  }

  /** Explicit complete lesson overlays; all unlisted course content uses the base. */
  function courseOverrides(lang) {
    if (lang !== "ar") return {};
    var entry = LANGS.filter(function (l) { return l.code === lang; })[0];
    return entry && entry.courseOverrides || {};
  }

  /** Supporting entries are opt-in, separately from the unchanged course manifest.
      Keep this empty until a complete existing entry has actually been translated. */
  function contentOverrides(lang) {
    if (lang !== "ar") return {};
    var entry = LANGS.filter(function (l) { return l.code === lang; })[0];
    return entry && entry.contentOverrides || {};
  }

  function supportsContent(file, key) {
    if (typeof file !== "string" || typeof key !== "string") return false;
    var families = {
      "curriculum-index.js": /^level:/,
      "grammar-reference.js": /^(ref:|refsec:titles$)/,
      "conversations.js": /^conv:/,
      "readings.js": /^read:r-/,
      "writing.js": /^write:/,
      "phonetics.js": /^ph:/
    };
    var library = /^library-(a1|a2|b1|b2|c1|c2)\.js$/.exec(file);
    if (library) return key.indexOf("read:lib-" + library[1] + "-") === 0;
    return Object.prototype.hasOwnProperty.call(families, file) && families[file].test(key);
  }

  /** The loader requests English first and only explicitly declared overlay files. */
  function overlayOverrides(lang) {
    var out = {}, course = courseOverrides(lang), content = contentOverrides(lang);
    Object.keys(course).forEach(function (f) { out[f] = course[f].slice(); });
    Object.keys(content).forEach(function (f) {
      var keys = Array.isArray(content[f]) ? content[f].filter(function (k) { return supportsContent(f, k); }) : [];
      if (keys.length) out[f] = (out[f] || []).concat(keys);
    });
    return out;
  }

  function languageAttrs(lang) {
    var actual = lang === "it" || Object.prototype.hasOwnProperty.call(LOCALE, lang) ? lang : FALLBACK;
    return ' lang="' + actual + '" dir="' + (actual === "ar" ? "rtl" : "ltr") + '" data-content-language="' + actual + '"';
  }

  function contentAttrs(key) {
    return languageAttrs(key === "it" ? "it" : global.LINGUAI.entryLanguage(current, key));
  }

  /** Saved/user-edited meanings can have a different language from the interface. */
  function meaningLanguage(text) {
    return /[\u0600-\u06ff]/.test(String(text || "")) ? "ar" : contentLanguage(current);
  }

  function meaningAttrs(text) { return languageAttrs(meaningLanguage(text)); }

  function markLanguage(node, lang) {
    if (!node) return;
    node.setAttribute("lang", lang);
    node.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    node.setAttribute("data-content-language", lang);
  }

  function markContent(node, key) {
    markLanguage(node, global.LINGUAI.entryLanguage(current, key));
  }

  function markMeaning(node, text) { markLanguage(node, meaningLanguage(text)); }

  /** Rich explanations can contain Italian examples and mixed-language tables. */
  function isolateContent(root) {
    root.querySelectorAll('[data-content-language="ar"] em,[data-content-language="ar"] i,[data-content-language="ar"] .gt th,[data-content-language="ar"] .gt td').forEach(function (node) {
      markLanguage(node, /[\u0600-\u06ff]/.test(node.textContent) ? "ar" : "it");
    });
  }

  /**
   * First visits always use Arabic. This compatibility helper recognizes
   * Arabic browser preferences only; other locales do not become choices.
   */
  function pickLang(prefs) {
    var list = prefs || [];
    for (var i = 0; i < list.length; i++) {
      var c = String(list[i] || "").toLowerCase().split("-")[0];
      if (c === "ar") return "ar";
    }
    return null;
  }

  var I18n = {
    t: t,
    apply: apply,
    set: setLang,
    missing: missing,
    locale: locale,
    contentLanguage: contentLanguage,
    courseOverrides: courseOverrides,
    contentOverrides: contentOverrides,
    supportsContent: supportsContent,
    overlayOverrides: overlayOverrides,
    contentAttrs: contentAttrs,
    meaningAttrs: meaningAttrs,
    markContent: markContent,
    markMeaning: markMeaning,
    isolateContent: isolateContent,
    languageAttrs: languageAttrs,
    pickLang: pickLang,
    LANGS: LANGS,
    // exposed so that scripts/parity.mjs reads the map from here instead of
    // duplicating it: two copies would drift apart at the first new language
    LOCALE: LOCALE,
    get lang() { return current; }
  };

  /* `addUI` stays under LINGUAI, not under I18n: data/i18n/ui-<lang>.js has
     called it that way since day one, and those are data files, not code. */
  LINGUAI.addUI = addUI;

  global.I18n = I18n;

})(window);
