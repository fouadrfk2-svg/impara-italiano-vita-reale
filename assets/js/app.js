/* ============================================================
   app.js — the shell and the application start.

   The router lives in router.js; what is here is whatever knows specific
   page elements: the side rail, the theme, the language switcher and the
   startup order.
   ============================================================ */
(function (global) {
  "use strict";

  var App = {};
  var courseReady = false, intended = null, hadSession = false, accessStarted = false;
  var routeReady = Object.create(null), routeLoading = Object.create(null), wrappedViews = Object.create(null);
  var backgroundLoading = null, backgroundReady = false;
  var preparedLanguageKey = "";

  /* A route's modules are grouped by feature in index.html. Keep the dependency
     list here, while the DOM retains the canonical classic-script order. */
  var ROUTE_FEATURES = {
    oggi: ["verbs", "errors", "drills", "exercise-types", "flash", "audio", "consent", "consent-ui", "training", "today"],
    percorso: ["path"],
    lezione: ["verbs", "errors", "exercise-types", "audio", "consent", "consent-ui", "lesson"],
    ripasso: ["errors", "flash", "audio", "consent", "consent-ui", "training", "review", "exercise-types"],
    cinque: ["errors", "flash", "audio"],
    grammatica: ["grammar"], coniugatore: ["verbs", "conjugator"],
    lessico: ["word-tools", "lexicon", "audio"], progressi: ["progress"],
    impostazioni: ["audio", "consent", "llm", "retention", "anki", "settings"],
    conversazione: ["exercise-types", "audio", "consent", "consent-ui", "llm", "talk"],
    chiacchiere: ["consent", "llm", "audio", "chat"],
    allenamento: ["verbs", "errors", "drills", "exercise-types", "audio", "consent", "consent-ui", "training"],
    piazzamento: ["verbs", "exercise-types", "placement"],
    suoni: ["errors", "consent", "consent-ui", "exercise-types", "audio", "phonetics"],
    benvenuto: ["welcome"], guida: ["guide"],
    lettura: ["exercise-types", "audio", "word-tools", "reading"],
    scrittura: ["verbs", "exercise-types", "consent", "llm", "writing"],
    copertura: ["word-tools", "frequency", "audio", "coverage"],
    shadowing: ["consent", "consent-ui", "audio", "recorder", "shadow"],
    velocita: ["audio", "speed"],
    esame: ["exercise-types", "audio", "writing", "recorder", "consent", "llm", "exam"],
    falsi: ["errors", "exercise-types", "falsi"],
    cerca: ["word-tools", "frequency", "audio", "search"]
  };
  var ROUTE_SUPPORT = {
    grammatica: ["grammar-reference.js"], conversazione: ["conversations.js"],
    chiacchiere: ["chat-scenarios.js"], suoni: ["phonetics.js"],
    esame: ["cils.js"], lettura: ["readings.js"], scrittura: ["writing.js"],
    copertura: ["frequenza.js"], falsi: ["interference.js"], velocita: ["readings.js"], shadowing: ["readings.js"]
  };

  /* The shell after every render: highlighting the rail entry and closing
     the drawer on a narrow screen. The router does not know these elements. */
  Router.onRender = function (route) {
    markRail(route);
    closeRail();
    if (courseReady && !publicRoute(route)) startBackgroundServices();
  };

  App.go = function (route, params) { Router.go(route, params); };

  function markRail(route) {
    document.querySelectorAll(".rail__item, .bottom-nav__item[data-route]").forEach(function (b) {
      var r = b.getAttribute("data-route");
      if (r === route || (route === "lezione" && r === "percorso")) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* ---------------- The shell ---------------- */
  /** A counter tile. The word form follows the number, not the other way round. */
  function stat(n, key) {
    return '<span class="rail__stat"><b>' + n + "</b><span>" + Core.esc(I18n.t(key, { n: n })) + "</span></span>";
  }

  App.refreshRail = function () {
    if (!courseReady) return;
    var s = Core.state;
    var box = document.getElementById("railStats");
    if (box) {
      box.innerHTML =
        /* "days" alone did not say they are consecutive; the box is a button
           to Progress, where every number is explained. */
        stat(s.streak.count, "stats.streak") +
        stat(s.stats.lessonsDone, "stats.lessons") +
        stat(s.xp, "stats.points") +
        '<span class="rail__stats-go">' + Core.esc(I18n.t("stats.open")) + " →</span>";
    }
    // the badge counts both decks: flashcards and the mistake notebook live in the same tab
    var due = Core.dueCount() + (global.Errors ? global.Errors.dueCount() : 0);
    var badge = document.getElementById("dueBadge");
    if (badge) {
      badge.hidden = due === 0;
      badge.textContent = due > 99 ? "99+" : due;
    }
  };

  function openRail() {
    document.getElementById("rail").classList.add("is-open");
    document.getElementById("railScrim").hidden = false;
    document.getElementById("railToggle").setAttribute("aria-expanded", "true");
    document.querySelector(".bottom-nav .js-more").setAttribute("aria-expanded", "true");
  }
  function closeRail() {
    document.getElementById("rail").classList.remove("is-open");
    document.getElementById("railScrim").hidden = true;
    document.getElementById("railToggle").setAttribute("aria-expanded", "false");
    document.querySelector(".bottom-nav .js-more").setAttribute("aria-expanded", "false");
  }

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var b = document.getElementById("themeToggle");
    // the key sits in the attribute, not only in this line: that way
    // I18n.apply() translates the button on a language change, unaided
    if (b) {
      b.setAttribute("data-i18n", t === "dark" ? "theme.light" : "theme.dark");
      b.textContent = I18n.t(b.getAttribute("data-i18n"));
    }
  }


  /* Arabic is the only selectable language, so language-switcher code is absent. */
  /**
   * Applies the language and theme from the state onto the interface.
   * Separate from switchLang, because importing a file changes
   * state.settings BEFORE the view is refreshed: the "same language" guard
   * in switchLang would then return immediately, leaving the interface in
   * the previous language despite a correctly loaded state.
   */
  App.applyLang = function (lang) {
    // Older backups may contain a language choice that is no longer supported.
    // Keep their learning data and normalize only the interface preference.
    lang = "ar";
    Core.state.settings.lang = lang;
    preparedLanguageKey = "";
    if (!courseReady || !global.Account.snapshot().authenticated) { Core.state.settings.lang = lang; Core.save(); I18n.set(lang); applyTheme(Core.state.settings.theme || "light"); Router.render(Router.current.route, Router.current.params); return; }
    Core.setLanguage(lang, function (missing) {
      I18n.set(lang);
      applyTheme(Core.state.settings.theme || "light");
      App.refreshRail();
      Router.render(Router.current.route, Router.current.params);
      // a silent failure would leave part of the course in the previous language
      if (missing.length) Core.toast(I18n.t("lang.partial", { n: missing.length }));
    });
  };

  /* ---------------- Startup ---------------- */
  function boot() {
    /* Arabic is the first-visit and returning-profile interface language. */
    Core.load();
    var lang = Core.state.settings.lang;
    I18n.set(lang);
    applyTheme(Core.state.settings.theme || "light");
    App.refreshRail();

    document.querySelectorAll(".rail__item, .bottom-nav__item[data-route]").forEach(function (b) {
      b.addEventListener("click", function () { App.go(b.getAttribute("data-route")); });
    });
    document.querySelector(".rail__brand").addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      // Router.go also redraws Today and closes the drawer when the hash is unchanged.
      App.go("oggi");
    });
    document.querySelector(".bottom-nav .js-more").addEventListener("click", openRail);
    document.getElementById("railStats").addEventListener("click", function () { App.go("progressi"); });
    document.getElementById("railToggle").addEventListener("click", function () {
      document.getElementById("rail").classList.contains("is-open") ? closeRail() : openRail();
    });
    document.getElementById("railScrim").addEventListener("click", closeRail);
    document.getElementById("railSearch").addEventListener("click", function () { App.go("cerca"); });
    document.getElementById("themeToggle").addEventListener("click", function () {
      var t = Core.state.settings.theme === "dark" ? "light" : "dark";
      Core.state.settings.theme = t; Core.save(); applyTheme(t);
    });
    var signout=document.getElementById("railLogout");
    if(signout)signout.addEventListener("click",async function(){
      if(signout.disabled)return;
      signout.disabled=true;signout.textContent="جارٍ تسجيل الخروج…";
      try{
        if(await global.Account.logout()){Router.go("home");return;}
      }catch(e){/* The session remains protected; never pretend logout succeeded. */}
      signout.disabled=false;signout.textContent="تعذّر تسجيل الخروج، حاول مجدداً";
    });
    Router.listen();
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { if (global.Audio2) global.Audio2.stop(); closeRail(); }
    });

    /* Learner content is loaded only after the server verifies the session. */
    startAccess();
  }


  /** The first render: the level the student is coming back to. */
  function startRouting() {
    var d = intended || { route: "oggi", params: {} }; intended = null;
    if (!publicRoute(d.route) && !Object.prototype.hasOwnProperty.call(ROUTE_FEATURES, d.route)) d = { route: "oggi", params: {} };
    if (d.route === "lezione" && !/^[a-c][12]-u\d{2}-(?:l\d|test)$/.test(d.params.id || "")) d = { route: "oggi", params: {} };
    Router.go(d.route, d.params || {});
  }

  /** Which level to load at startup: the one with unfinished progress. */
  function guessLevel(d) {
    if (d.route === "lezione" && d.params.id) {
      var m = /^([a-z]\d)/i.exec(d.params.id);
      if (m) return m[1].toUpperCase();
    }
    var levels = Core.registry.levels;
    for (var i = 0; i < levels.length; i++) {
      var p = Core.levelProgress(levels[i]);
      if (p.total === 0 || p.pct < 1) return levels[i].code;
    }
    return levels.length ? levels[0].code : null;
  }

  function publicRoute(route) { return ["home", "account", "admin", "privacy", "billing"].indexOf(route) >= 0; }
  function routeKey(route, params) { return Router.encode(route, params || {}); }
  function currentHashMatches(route, params) {
    var d = Router.decode(global.location.hash);
    return routeKey(d.route, d.params) === routeKey(route, params);
  }
  function routeLevel(route, params) {
    if (route === "lezione") {
      var match = /^([a-z]\d)/i.exec(params.id || "");
      return match ? match[1].toUpperCase() : null;
    }
    if (route === "lettura") {
      var libraryMatch = /^lib-([a-z]\d)-/i.exec(params.id || "");
      if (libraryMatch) return libraryMatch[1].toUpperCase();
    }
    if (["oggi", "percorso", "allenamento", "benvenuto", "lettura"].indexOf(route) < 0) return null;
    return params.level || guessLevel({ route: route, params: params });
  }
  function routeLevels(route, params) {
    var single = routeLevel(route, params || {});
    if (single) return [single];
    if (route !== "ripasso" || (params || {}).tab !== "errori" || !global.Errors) return [];
    var available = Object.create(null), needed = Object.create(null);
    (Core.registry.levels || []).forEach(function (level) { available[level.code.toUpperCase()] = true; });
    global.Errors.due().forEach(function (card) {
      var source = card.srcId || String(card.key || "").split("#")[0];
      var match = /^([a-z]\d)-u\d{2}-/i.exec(source);
      if (match && available[match[1].toUpperCase()]) needed[match[1].toUpperCase()] = true;
    });
    return Object.keys(needed);
  }
  function loadCourseFeatures(features) {
    var wanted = Object.create(null);
    ["shell"].concat(features || []).forEach(function (feature) { wanted[feature] = true; });
    var scripts = Array.prototype.slice.call(document.querySelectorAll("script[data-course-src][data-course-feature]"))
      .filter(function (script) { return wanted[script.getAttribute("data-course-feature")]; });
    for (var i = 0; i < scripts.length; i += 6) {
      if (!global.Account.snapshot().authenticated) return Promise.reject(Error("Session unavailable"));
      var batch = [];
      for (var j = i; j < Math.min(i + 6, scripts.length); j++) {
        if (!global.Account.snapshot().authenticated) return Promise.reject(Error("Session unavailable"));
        batch.push(global.Guest.loadScript(scripts[j].getAttribute("data-course-src")));
      }
      // Each group is inserted in source order. async=false on the authenticated
      // loader preserves dependencies while network fetches overlap.
      return Promise.allSettled(batch).then(function (results) {
        if (results.some(function (result) { return result.status === "rejected"; })) throw Error("Content unavailable");
        if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
        return loadRemaining();
      });
    }
    return Promise.resolve();

    function loadRemaining() {
      // Continue with subsequent bounded batches without starting unrelated features.
      var next = scripts.slice(6);
      if (!next.length) return Promise.resolve();
      return loadScriptBatches(next, 0);
    }
  }
  function loadScriptBatches(scripts, offset) {
    if (offset >= scripts.length) return Promise.resolve();
    if (!global.Account.snapshot().authenticated) return Promise.reject(Error("Session unavailable"));
    var batch = scripts.slice(offset, offset + 6).map(function (script) {
      return global.Guest.loadScript(script.getAttribute("data-course-src"));
    });
    return Promise.allSettled(batch).then(function (results) {
      if (results.some(function (result) { return result.status === "rejected"; })) throw Error("Content unavailable");
      if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
      return loadScriptBatches(scripts, offset + 6);
    });
  }
  function wrapLearnerViews() {
    Object.keys(global.Views).forEach(function (name) {
      if (!/^[a-z]+$/.test(name) || publicRoute(name) || typeof global.Views[name] !== "function" || wrappedViews[name]) return;
      var view = global.Views[name];
      global.Views[name] = function (params) { if (!global.Account.snapshot().authenticated) return; return view(params); };
      wrappedViews[name] = true;
    });
  }
  function startBackgroundServices() {
    if (backgroundReady || backgroundLoading || !global.Account.snapshot().authenticated) return;
    backgroundLoading = loadCourseFeatures(["errors", "retention"]).then(function () {
      if (!global.Account.snapshot().authenticated) return;
      wrapLearnerViews();
      if (global.Retention) global.Retention.start();
      backgroundReady = true;
      App.refreshRail();
    }).catch(function () {
      // Background conveniences must never take the current learning screen down.
    }).finally(function () { backgroundLoading = null; });
  }
  function loadLevel(code) {
    if (!code) return Promise.resolve(true);
    if (!global.Account.snapshot().authenticated) return Promise.reject(Error("Session unavailable"));
    return new Promise(function (resolve) { Core.loadLevelData(code, resolve); }).then(function (ok) {
      if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
      return ok;
    });
  }
  function prepareRoute(route, params) {
    var key = routeKey(route, params);
    if (routeReady[key]) return Promise.resolve();
    if (routeLoading[key]) return routeLoading[key];
    var fallbackRoute = Object.prototype.hasOwnProperty.call(ROUTE_FEATURES, route) ? route : "percorso";
    var features = ROUTE_FEATURES[fallbackRoute];
    var support = ["curriculum-index.js"].concat(ROUTE_SUPPORT[fallbackRoute] || []);
    routeLoading[key] = loadCourseFeatures(features)
      .then(function () {
        if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
        return support.reduce(function (chain, file) {
          return chain.then(function () {
            if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
            return global.Registry.loadSupportingData([file]).then(function (failed) {
              if (failed.length) throw Error("Content unavailable");
            });
          });
        }, Promise.resolve());
      })
      .then(function () {
        var levels = routeLevels(fallbackRoute, params || {});
        return Promise.all(levels.map(loadLevel)).then(function (results) {
          if (results.some(function (loaded) { return !loaded; })) throw Error("Content unavailable");
        });
      })
      .then(function () { return prepareCourseLanguage(); })
      .then(function () {
        if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
        wrapLearnerViews();
        routeReady[key] = true;
        return true;
      })
      .finally(function () { delete routeLoading[key]; });
    return routeLoading[key];
  }
  function showRouteFailure(route, params) {
    var main = document.getElementById("main");
    if (!main) return;
    main.removeAttribute("aria-busy");
    main.innerHTML = '<section class="course-opening" role="alert"><h1>ما قدرناش نحمّلو هاد الصفحة</h1><p>تحقّق من الاتصال ثم حاول مرة أخرى.</p><button type="button" class="btn btn--primary" data-route-retry>إعادة المحاولة</button></section>';
    var retry = main.querySelector("[data-route-retry]");
    retry.addEventListener("click", function () {
      retry.disabled = true;
      Router.render(route, params || {});
    });
  }
  function remember(route, params) {
    if (!/^[a-z]+$/.test(route) || publicRoute(route)) return;
    var safe = {};
    ["id", "level", "unit", "tab", "topic", "mode", "set", "s", "go"].forEach(function (k) { if (typeof params[k] === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(params[k])) safe[k] = params[k]; });
    if (route === "cerca" && typeof params.q === "string" && params.q.length <= 160) safe.q = params.q;
    intended = { route: route, params: safe };
  }
  Router.beforeRender = function (route, params) {
    if (publicRoute(route)) return true;
    if (courseReady && global.Account.snapshot().authenticated) {
      var key = routeKey(route, params || {});
      if (routeReady[key]) return true;
      showCourseOpening(route);
      prepareRoute(route, params || {}).then(function () {
        if (!global.Account.snapshot().authenticated) { closeCourse(); return; }
        if (!currentHashMatches(route, params || {})) return;
        document.documentElement.setAttribute("data-access", "learner");
        var main = document.getElementById("main");
        if (main) main.removeAttribute("aria-busy");
        App.refreshRail();
        Router.render(route, params || {});
      }).catch(function () {
        if (!global.Account.snapshot().authenticated) closeCourse();
        else if (currentHashMatches(route, params || {})) showRouteFailure(route, params || {});
      });
      return false;
    }
    remember(route, params); global.history.replaceState(null, "", "#/home"); Router.render("home", {}); return false;
  };
  function closeCourse() {
    remember(Router.current.route, Router.current.params);
    courseReady = false;
    document.documentElement.setAttribute("data-access", "guest");
    if (global.Audio2) global.Audio2.stop();
    global.Guest.clearPrivateCaches();
    Router.go("home");
  }
  async function prepareCourseLanguage() {
    var lang = Core.state.settings.lang;
    var dataKey = ["lang:" + lang]
      .concat(global.Registry.loadedSupportingData().sort().map(function (file) { return "support:" + file; }))
      .concat(Core.registry.levels.filter(function (lv) { return Core.registry.loaded[lv.code] === true; }).map(function (lv) { return "level:" + lv.code; }).sort())
      .join("|");
    if (preparedLanguageKey === dataKey) return lang;
    var missing = await new Promise(function (resolve) { Core.setLanguage(lang, resolve); });
    if (missing.length) {
      // A missing optional overlay may fall back only after access is reverified.
      await global.Account.refresh();
      if (!global.Account.snapshot().authenticated || I18n.contentLanguage(lang) === lang || missing.some(function (p) { return p.indexOf("data/i18n/" + lang + "/") !== 0; })) throw Error("Content unavailable");
      Core.toast(I18n.t("lang.partial", { n: missing.length }));
    }
    preparedLanguageKey = dataKey;
    return lang;
  }
  function showCourseOpening() {
    // An authenticated visitor sees a real, accessible loading state instead
    // of a frozen landing page while protected resources are being prepared.
    var main = document.getElementById("main");
    if (!main) return;
    document.documentElement.setAttribute("data-access", "loading");
    main.setAttribute("aria-busy", "true");
    main.innerHTML = '<section class="course-opening" data-course-opening role="status" aria-live="polite">'
      + '<span class="course-opening__mark" aria-hidden="true"></span>'
      + '<p class="course-opening__eyebrow">Vita Reale</p>'
      + '<h1>كنوجدو مساحة التعلّم ديالك…</h1>'
      + '<p class="course-opening__description">دخولك مؤكد. الدروس كتتحمّل بطريقة آمنة.</p>'
      + '<div class="course-opening__track" aria-hidden="true"><span></span></div>'
      + '<p data-course-opening-count>جارٍ تحميل الدروس…</p>'
      + '</section>';
  }
  App.enterCourse = async function (keepPublic) {
    if (!global.Account.snapshot().authenticated) return;
    // A verified session opens the shell; each view's route modules and data
    // arrive only after Router.beforeRender confirms the destination.
    courseReady = true;
    Core.touchDay();
    document.documentElement.setAttribute("data-access", "learner");
    if (keepPublic) { Router.render(keepPublic.route, keepPublic.params); return; }
    startRouting();
  };
  async function startAccess() {
    var d = Router.decode(global.location.hash), explicit = !!global.location.hash;
    if (explicit && !publicRoute(d.route)) remember(d.route, d.params);
    Router.render("home", { checking: true });
    global.Account.subscribe(function () {
      var authenticated = global.Account.snapshot().authenticated;
      var previous = hadSession; hadSession = authenticated;
      if (previous && !authenticated) closeCourse();
      else if (!previous && authenticated && (courseReady || accessStarted) && Router.current.route === "home") App.enterCourse();
    });
    // Clean legacy cache entries while the server checks the session.
    // Wait for both before any protected learner content is displayed.
    await Promise.all([global.Guest.clearPrivateCaches(), global.Account.refresh()]);
    hadSession = global.Account.snapshot().authenticated;
    // Respect a public destination selected while verification was in flight.
    d = Router.decode(global.location.hash); explicit = !!global.location.hash;
    if (hadSession) await App.enterCourse(explicit && publicRoute(d.route) && d.route !== "home" && !(d.route === "billing" && d.params.signin === "1") ? d : null);
    else { document.documentElement.setAttribute("data-access", "guest"); var publicDestination=explicit && publicRoute(d.route) ? d.route : "home"; var billingParams=publicDestination==="billing" && d.params.checkout==="success" ? {checkout:"success"} : publicDestination==="billing" && d.params.manage==="1" ? {manage:"1"} : publicDestination==="billing" && d.params.signin==="1" ? {signin:"1"} : {}; Router.go(publicDestination,billingParams); }
    accessStarted = true;
    global.addEventListener("offline", function () { global.Account.suspend(); });
    global.addEventListener("focus", function () { if (global.Account.snapshot().authenticated) global.Account.refresh(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) return; global.Account.refresh(); });
    global.setInterval(function () { if (!document.hidden && global.Account.snapshot().authenticated) global.Account.refresh(); }, 45000);
  }
  global.App = App;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();


})(window);
