/* ============================================================
   app.js — the shell and the application start.

   The router lives in router.js; what is here is whatever knows specific
   page elements: the side rail, the theme, the language switcher and the
   startup order.
   ============================================================ */
(function (global) {
  "use strict";

  var App = {};
  var courseReady = false, courseLoading = null, intended = null, hadSession = false, accessStarted = false;

  /* The shell after every render: highlighting the rail entry and closing
     the drawer on a narrow screen. The router does not know these elements. */
  Router.onRender = function (route) {
    markRail(route);
    closeRail();
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
    if (!courseReady || !global.Errors) return;
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
    var due = Core.dueCount() + Errors.dueCount();
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
    if (!Object.prototype.hasOwnProperty.call(global.Views, d.route) || typeof global.Views[d.route] !== "function") d = { route: "oggi", params: {} };
    if (d.route === "lezione" && !/^[a-c][12]-u\d{2}-(?:l\d|test)$/.test(d.params.id || "")) d = { route: "oggi", params: {} };
    var wanted = d.params.level || guessLevel(d);
    if (wanted) Core.loadLevelData(wanted, function () { if (global.Account.snapshot().authenticated) Router.onHashChange(); });
    Router.go(d.route, d.params); App.refreshRail();
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
  function remember(route, params) {
    if (!/^[a-z]+$/.test(route) || publicRoute(route)) return;
    var safe = {};
    ["id", "level", "unit", "tab", "topic", "mode", "set", "s", "go"].forEach(function (k) { if (typeof params[k] === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(params[k])) safe[k] = params[k]; });
    if (route === "cerca" && typeof params.q === "string" && params.q.length <= 160) safe.q = params.q;
    intended = { route: route, params: safe };
  }
  Router.beforeRender = function (route, params) {
    if (publicRoute(route)) return true;
    if (courseReady && global.Account.snapshot().authenticated) return true;
    remember(route, params); global.history.replaceState(null, "", "#/home"); Router.render("home", {}); return false;
  };
  function closeCourse() {
    remember(Router.current.route, Router.current.params);
    document.documentElement.setAttribute("data-access", "guest");
    if (global.Audio2) global.Audio2.stop();
    global.Guest.clearPrivateCaches();
    Router.go("home");
  }
  async function prepareCourseLanguage() {
    var lang = Core.state.settings.lang;
    var missing = await new Promise(function (resolve) { Core.setLanguage(lang, resolve); });
    if (missing.length) {
      // A missing optional overlay may fall back only after access is reverified.
      await global.Account.refresh();
      if (!global.Account.snapshot().authenticated || I18n.contentLanguage(lang) === lang || missing.some(function (p) { return p.indexOf("data/i18n/" + lang + "/") !== 0; })) throw Error("Content unavailable");
      Core.toast(I18n.t("lang.partial", { n: missing.length }));
    }
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
    if (!courseReady && !courseLoading) showCourseOpening();
    var preparedLanguage = null;
    if (!courseReady) {
      if (!courseLoading) courseLoading = (async function () {
        var scripts = document.querySelectorAll("script[data-course-src]");
        // Fetch a few public UI modules at once while preserving strict
        // execution order: Guest.loadScript sets async=false BEFORE append.
        // Never preload private lesson/audio bytes here; those are requested
        // separately by the authenticated registry with a fresh session.
        for (var i = 0; i < scripts.length; i += 6) {
          if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
          var batch = [];
          for (var j = i; j < Math.min(i + 6, scripts.length); j++) {
            if (!global.Account.snapshot().authenticated) throw Error("Session unavailable");
            batch.push(global.Guest.loadScript(scripts[j].getAttribute("data-course-src")));
          }
          // Do not abandon pending scripts on a rejected promise. Finish the
          // batch, then fail closed instead of overlapping a retry.
          var results = await Promise.allSettled(batch);
          if (results.some(function (r) { return r.status === "rejected"; })) throw Error("Content unavailable");
          var progress = document.querySelector("[data-course-opening-count]");
          if (progress) progress.textContent = "جاري تجهيز الدروس… " + Math.min(i + 6, scripts.length) + " / " + scripts.length;
        }
        var prepared = await prepareCourseLanguage();
        Object.keys(global.Views).forEach(function (name) {
          if (!/^[a-z]+$/.test(name) || publicRoute(name) || typeof global.Views[name] !== "function") return;
          var view = global.Views[name]; global.Views[name] = function (params) { if (!global.Account.snapshot().authenticated) return; return view(params); };
        });
        courseReady = true; Core.touchDay(); Retention.start(); return prepared;
      })().catch(function () { courseLoading = null; throw Error("Content unavailable"); });
      try { preparedLanguage = await courseLoading; } catch (e) { document.documentElement.setAttribute("data-access", "guest"); Router.render("home", { unavailable: true }); return; }
    }
    if (!global.Account.snapshot().authenticated) { closeCourse(); return; }
    try { if (preparedLanguage !== Core.state.settings.lang) await prepareCourseLanguage(); } catch (e) { document.documentElement.setAttribute("data-access", "guest"); Router.render("home", { unavailable: true }); return; }
    if (!global.Account.snapshot().authenticated) { closeCourse(); return; }
    document.documentElement.setAttribute("data-access", "learner");
    document.getElementById("main").removeAttribute("aria-busy");
    App.refreshRail();
    if (keepPublic) Router.render(keepPublic.route, keepPublic.params); else startRouting();
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
