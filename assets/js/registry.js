/* ============================================================
   registry.js — the course structure and pulling it in on demand.

   Pulled out of core.js: it is the only part of that file that is not
   about the student but about the material. It holds levels, units and
   lessons, builds indexes over them, and injects data files when the
   student enters a level or changes the language of explanations.

   It loads BEFORE core.js, because core reads the vocabulary index from
   here while its module body runs. The dependency goes one way: the
   registry knows nothing about progress, cards or Core.

   Two non-obvious things, both consequences of having no build step:
   - files come in through <script>, not through fetch, because the course
     must also work from file://, where fetch is forbidden by CORS;
   - the neutral layer goes before the text overlay and applyStrings is
     only called after both — each pipeline advances only after onload.
   ============================================================ */
(function (global) {
  "use strict";

  var norm = global.Txt.norm;
  var Store = global.Store;
  var save = Store.save;

  /* ---------------- Course registry ---------------- */
  var registry = {
    levels: [],          // [{code, cefrLabel, dataFiles, name, desc, units}]
    byCode: {},          // code -> level
    lessonIndex: {},     // lessonId -> {lesson, unit, level}
    vocabIndex: {},      // norm(italian) -> translation in the current language
    loaded: {}           // code -> true
  };

  /* ---------------- Registering course data ---------------- */
  function registerLevel(level) {
    if (registry.byCode[level.code]) {
      // loaded again: swap the units
      registry.byCode[level.code].units = level.units;
    } else {
      registry.levels.push(level);
      registry.byCode[level.code] = level;
    }
    reindex();
  }

  function reindex() {
    registry.lessonIndex = {};
    registry.vocabIndex = {};
    function note(l, u, lv) {
      registry.lessonIndex[l.id] = { lesson: l, unit: u, level: lv };
      (l.vocab || []).forEach(function (v) {
        if (v.it && v.tr) registry.vocabIndex[norm(v.it)] = v.tr;
      });
    }
    registry.levels.forEach(function (lv) {
      (lv.units || []).forEach(function (u) {
        (u.lessons || []).forEach(function (l) { note(l, u, lv); });
        if (u.test) note(u.test, u, lv);
      });
    });
  }

  function getLesson(id) { return registry.lessonIndex[id] || null; }

  /** Adds units to an already registered level (data split across files). */
  function addUnits(code, units) {
    var lv = registry.byCode[code];
    if (!lv) return;
    lv.units = (lv.units || []).concat(units);
    reindex();
  }

  /**
   * Injects this pipeline one file at a time so core data always precedes its
   * overlay. Keep the scripts async: false serializes unrelated level pipelines
   * globally, allowing a slow level to block a route that needs another one.
   */
  function loadScripts(paths, cb) {
    var i = 0, failed = [];
    function next() {
      if (i >= paths.length) { cb(failed); return; }
      var s = document.createElement("script");
      var src = paths[i++];
      s.src = src;
      s.async = true;
      s.onload = next;
      s.onerror = function () { failed.push(src); next(); };
      document.head.appendChild(s);
    }
    next();
  }

  /* Text files already loaded for a given language: "lang/file.js" -> true */
  var i18nLoaded = {};
  var supportLoaded = {};
  var supportLoading = {};

  var I18N_DIR = "data/i18n/";

  function i18nPaths(lang, files) {
    if (lang !== "ar" && lang !== "en") lang = "ar";
    var base = global.I18n && global.I18n.contentLanguage ? global.I18n.contentLanguage(lang) : lang;
    var overrides = global.I18n && global.I18n.overlayOverrides ? global.I18n.overlayOverrides(lang) : {};
    var paths = files.filter(function (f) { return !i18nLoaded[base + "/" + f]; })
      .map(function (f) { return I18N_DIR + base + "/" + f; });
    if (base !== lang) files.forEach(function (f) {
      if (overrides[f] && !i18nLoaded[lang + "/" + f]) paths.push(I18N_DIR + lang + "/" + f);
    });
    return paths;
  }

  /** Supporting datasets opt in to localization independently of course levels.
      Some are Italian-only (for example free-chat scenarios) and have no
      English or Arabic overlay; requesting a guessed overlay turns a valid
      route into a false load failure. */
  function supportingI18nPaths(lang, files) {
    var declared = global.I18n && typeof global.I18n.contentOverrides === "function"
      ? global.I18n.contentOverrides(lang) : null;
    if (!declared) return i18nPaths(lang, files);
    return i18nPaths(lang, files.filter(function (file) {
      return Object.prototype.hasOwnProperty.call(declared, file);
    }));
  }

  /** Remembers only what actually loaded: a failure must be retried. */
  function markI18n(paths, failed) {
    paths.forEach(function (p) {
      if (p.indexOf(I18N_DIR) !== 0 || failed.indexOf(p) >= 0) return;
      i18nLoaded[p.slice(I18N_DIR.length)] = true;
    });
  }

  /**
   * Loads a level's data files on demand (works from file:// too).
   * The neutral layer first, then the texts in the student's language —
   * loadScripts keeps the order, and merging happens only once both are in.
   */
  /* Callers that asked for a level while its files were already on the way.
     They hear back when the files land, not at once: an immediate "done"
     had them draw from a level with no units yet. */
  var waiting = {};

  function loadLevelData(code, cb) {
    var lv = registry.byCode[code];
    var files = lv && lv.dataFiles;
    if (registry.loaded[code] === "loading") {
      if (cb) (waiting[code] = waiting[code] || []).push(cb);
      return;
    }
    if (registry.loaded[code] || !lv || !files || !files.length) { cb && cb(!!lv); return; }
    registry.loaded[code] = "loading";

    var lang = Store.state.settings.lang;
    var paths = files.map(function (f) { return "data/core/" + f; }).concat(i18nPaths(lang, files));

    loadScripts(paths, function (failed) {
      markI18n(paths, failed);
      global.LINGUAI.applyStrings(lang);
      // reindex once more: addUnits built the index before the overlay wrote the translations in
      reindex();
      // a partial failure does not block the level: what counts is whether anything loaded
      var got = (lv.units || []).length > 0;
      registry.loaded[code] = got ? true : "error";
      if (failed.length && got) console.warn("[LinguAI] Nie wczytano: " + failed.join(", "));
      var reszta = waiting[code] || [];
      delete waiting[code];
      cb && cb(got);
      reszta.forEach(function (f) { f(got); });
    });
  }

  /* Only the small navigation index is needed to enter the learner shell.
     Route-specific reference and activity datasets are loaded on demand. */
  var EAGER_FILES = ["curriculum-index.js"];

  function loadOneSupportingFile(file) {
    if (supportLoaded[file]) return Promise.resolve(true);
    if (supportLoading[file]) return supportLoading[file];
    supportLoading[file] = new Promise(function (resolve) {
      var path = "data/core/" + file;
      var request = global.Guest && typeof global.Guest.loadScript === "function"
        ? global.Guest.loadScript(path).then(function () { return true; }, function () { return false; })
        : new Promise(function (done) { loadScripts([path], function (failed) { done(failed.length === 0); }); });
      request.then(function (ok) {
        if (ok) supportLoaded[file] = true;
        delete supportLoading[file];
        resolve(ok);
      });
    });
    return supportLoading[file];
  }

  /** Loads only the neutral supporting datasets requested by the active view.
      Every request still passes through the authenticated Guest loader. */
  function loadSupportingData(files, cb) {
    var requested = (files || []).filter(function (file, index, all) {
      return /^[a-z0-9-]+\.js$/.test(file) && all.indexOf(file) === index;
    });
    var promise = requested.reduce(function (chain, file) {
      return chain.then(function (failed) {
        return loadOneSupportingFile(file).then(function (ok) {
          if (!ok) failed.push("data/core/" + file);
          return failed;
        });
      });
    }, Promise.resolve([]));
    if (typeof cb === "function") promise.then(cb);
    return promise;
  }

  /**
   * Changes the language of explanations. The neutral layer stays in memory
   * as it is: we only pull the missing overlays and apply them on top of the
   * same objects, because merging is idempotent. Hence no page reload.
   *
   * cb(missing) — the list of files that failed to load. A non-empty list
   * means part of the course stayed in the previous language; the caller
   * must show that, not ignore it.
   */
  function setLanguage(lang, cb) {
    lang = "ar";
    var files = EAGER_FILES.slice();
    var supportingFiles = Object.keys(supportLoaded);
    registry.levels.forEach(function (lv) {
      if (registry.loaded[lv.code] === true) files = files.concat(lv.dataFiles || []);
    });
    Store.state.settings.lang = lang;
    save();
    var paths = i18nPaths(lang, files).concat(supportingI18nPaths(lang, supportingFiles));
    // Keep every neutral fallback ahead of every localized overlay, even when
    // they come from different loading scopes. Otherwise an English support
    // file appended after the Arabic curriculum overlay can overwrite Arabic
    // fields when the scripts register their strings.
    var basePrefix = I18N_DIR + (global.I18n && global.I18n.contentLanguage
      ? global.I18n.contentLanguage(lang) : lang) + "/";
    paths = paths.filter(function (path, index) { return paths.indexOf(path) === index; })
      .filter(function (path) { return path.indexOf(basePrefix) === 0; })
      .concat(paths.filter(function (path, index) {
        return path.indexOf(basePrefix) !== 0 && paths.indexOf(path) === index;
      }));
    loadScripts(paths, function (failed) {
      markI18n(paths, failed);
      global.LINGUAI.applyStrings(lang);
      reindex();   // the card dictionary must point at glosses in the new language
      cb && cb(failed);
    });
  }

  global.Registry = {
    registry: registry,
    registerLevel: registerLevel, addUnits: addUnits, getLesson: getLesson,
    reindex: reindex,
    i18nPaths: i18nPaths, markI18n: markI18n,
    loadLevelData: loadLevelData, setLanguage: setLanguage,
    loadSupportingData: loadSupportingData,
    loadedSupportingData: function () { return Object.keys(supportLoaded); },
    EAGER_FILES: EAGER_FILES
  };

  /**
   * Reading texts arriving with a level, rather than at startup.
   *
   * `data/core/readings.js` is loaded eagerly and assigns `window.READINGS`
   * whole. The library of long texts cannot do that twice over — the second
   * file would replace the first — and it must not be eager either: it is
   * ten times the prose of the short readings, for material a student opens
   * a fraction of.
   *
   * So the library files APPEND, one per level, pulled in with the rest of
   * that level's data. Deduplicated by id because a level can be asked for
   * twice in a session (the coverage screen pulls every level to count what
   * the course teaches), and a text listed twice would be a text that gets
   * two different reading positions.
   */
  function addReadings(lista) {
    var wszystkie = global.READINGS || (global.READINGS = []);
    (lista || []).forEach(function (r) {
      if (!r || !r.id) return;
      for (var i = 0; i < wszystkie.length; i++) if (wszystkie[i].id === r.id) return;
      wszystkie.push(r);
    });
  }

  /* The course data files call these when they load. */
  global.LINGUAI = global.LINGUAI || {};
  global.LINGUAI.registerLevel = registerLevel;
  global.LINGUAI.addUnits = addUnits;
  global.LINGUAI.addReadings = addReadings;

})(window);
