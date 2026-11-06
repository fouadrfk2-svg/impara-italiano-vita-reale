/* ============================================================
   views-lesson.js — a lesson: theory, grammar, vocabulary, dialogue, exercises.

   A screen split out of views.js, which held eight screens at once. The
   pattern is the same one views-talk.js, views-train.js and views-today.js
   already use: the shell (set, pageHead, el, empty) comes from
   `Views.shell`, and the file adds a route of its own to `Views`.

   It loads AFTER views.js, because `Views.shell` is created at the end of
   that file.
   ============================================================ */
(function () {
  "use strict";

  var esc = Core.esc;
  var t = function (k, v) { return I18n.t(k, v); };
  var set = Views.shell.set;
  var el = Views.shell.root;
  var empty = Views.shell.empty;
  var pct = Views.shell.pct;
  /* ═══════════════════════════════════════════════════════════
     THE LESSON
     ═══════════════════════════════════════════════════════════ */
  var session = null;
  var run = null;       // LessonRun state: which exercise shows, which are answered
  var activeExercises = [];

  /** The jump bar: the lesson stays one page, the sections are one tap away. */
  function steps(L) {
    var list = [["theory", L.theory && L.theory.length, "lesson.theory"], ["gram", L.grammar, "lesson.grammar"],
      ["vocab", L.vocab && L.vocab.length, "lesson.vocab"], ["dlg", L.dialogue, "lesson.stepDialogue"],
      ["ex", L.exercises && L.exercises.length, "lesson.exercises"]].filter(function (s) { return s[1]; });
    if (list.length < 2) return "";
    return '<nav class="lesson-steps" aria-label="' + esc(t("lesson.stepsLabel")) + '">' + list.map(function (s) {
      return '<button type="button" class="lesson-steps__btn" data-step="' + s[0] + '">' + esc(t(s[2])) + "</button>";
    }).join("") + "</nav>";
  }

  Views.lezione = function (params) {
    var found = Core.getLesson(params.id);
    if (!found) {
      // arriving from a bookmark, or moving to a lesson of a level not loaded yet:
      // pull the data of the level derived from the id (e.g. "b2-u02-l1" -> B2) and try again
      var m = /^([a-z]\d)/i.exec(params.id || "");
      var code = m ? m[1].toUpperCase() : null;
      if (code && Core.registry.byCode[code] && !Core.registry.loaded[code]) {
        set(empty(t("path.loading")));
        Core.loadLevelData(code, function () {
          if (Core.getLesson(params.id)) Views.lezione(params);
          else set(empty(t("lesson.notFound"), t("lesson.notFoundHint")));
        });
        return;
      }
      set(empty(t("lesson.notFound"), t("lesson.notFoundHint")));
      return;
    }
    var L = found.lesson, U = found.unit, LV = found.level;

    var savedResume = LearningJourney.resumeFor(L.id, (L.exercises || []).length);
    activeExercises = L.exercises || [];
    session = {
      id: L.id, total: activeExercises.length, score: 0, answered: 0,
      started: savedResume ? savedResume.startedAt : Date.now()
    };

    var parts = [];

    parts.push('<div class="lesson-top">' +
      '<button class="btn btn--ghost btn--sm js-back">' + t("lesson.back") + "</button>" +
      '<div class="lesson-top__bar" role="progressbar" aria-label="' + esc(t("journey.lessonProgress")) + '" aria-valuemin="0" aria-valuemax="' + session.total + '" aria-valuenow="0" aria-valuetext="0/' + session.total + '"><i id="lessonBar" style="width:0%"></i></div>' +
      '<span class="lesson-top__hearts" id="lessonScore">0/' + session.total + "</span></div>");

    parts.push('<div class="meta-row">' +
      '<span class="chip chip--cefr">' + esc(L.cefr || LV.code) + "</span>" +
      '<span class="chip">' + esc(U.title) + "</span>" +
      (L.theme ? '<span class="chip chip--green">' + esc(L.theme) + "</span>" : "") +
      "</div>");

    parts.push('<header class="view-head"><h1 lang="it" dir="ltr">' + esc(L.titleIt) + "</h1><p>" + esc(L.title) + "</p></header>");
    parts.push(steps(L));

    if (L.objectives && L.objectives.length) {
      parts.push('<div class="callout"><b>' + t("lesson.objectives") + '</b><ul style="margin:8px 0 0;padding-left:20px">' +
        L.objectives.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul></div>");
    }

    /* --- theory --- */
    if (L.theory && L.theory.length) {
      parts.push('<section class="step" id="step-theory"><h2 class="step__label">' + t("lesson.theory") + '</h2><div class="prose">' +
        L.theory.map(function (b) {
          if (typeof b === "string") return "<p>" + b + "</p>";
          var list = b.list ? "<ul>" + b.list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : "";
          /* A heading travels with a paragraph or with a list ({h, list}, 65
             blocks per language): leaving at the heading dropped the list. */
          if (b.h) return "<h4>" + esc(b.h) + "</h4>" + (b.p ? "<p>" + b.p + "</p>" : "") + list;
          if (b.list) return list;
          if (b.trap) return '<div class="callout callout--trap"><b>' + t("lesson.trapLabel") + "</b> " + b.trap + "</div>";
          if (b.contrast) return '<div class="callout callout--pl"><b>' + t("lesson.contrastLabel") + "</b> " + b.contrast + "</div>";
          if (b.tip) return '<div class="callout"><b>' + t("lesson.tipLabel") + "</b> " + b.tip + "</div>";
          return "<p>" + (b.p || "") + "</p>";
        }).join("") + "</div></section>");
    }

    /* --- grammar --- */
    if (L.grammar) {
      var g = L.grammar;
      var gh = '<div class="gram-box"><p class="gram-box__rule">' + esc(g.title) + "</p>" +
        (g.note ? '<p class="gram-box__note">' + g.note + "</p>" : "");
      if (g.table) {
        /* Focusable and named: on a phone the box scrolls sideways, and a
           scrolling region the keyboard cannot reach hides half the table. */
        gh += '<div class="table-wrap" tabindex="0" role="region" aria-label="' + esc(g.title) + '"><table class="gt"><thead><tr>' +
          g.table.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          g.table.rows.map(function (r) {
            return "<tr>" + r.map(function (c, i) {
              return "<td" + (i === 1 ? ' class="it"' : "") + ">" + c + "</td>";
            }).join("") + "</tr>";
          }).join("") + "</tbody></table></div>";
      }
      if (g.examples) {
        gh += '<ul class="ex-list">' + g.examples.map(function (e) {
          return "<li>" + '<button type="button" class="say-btn" data-say="' + esc(e.it) + '" aria-label="' + esc(t("a11y.listen")) + '">🔊</button>' +
            '<span class="it">' + esc(e.it) + '</span><span class="pl">' + esc(e.tr) + "</span>" +
            (e.note ? '<span class="nb">' + esc(e.note) + "</span>" : "") + "</li>";
        }).join("") + "</ul>";
      }
      gh += "</div>";
      parts.push('<section class="step step--gram" id="step-gram"><h2 class="step__label">' + t("lesson.grammar") + "</h2>" + gh + "</section>");
    }

    /* --- vocabulary --- */
    if (L.vocab && L.vocab.length) {
      parts.push('<section class="step step--vocab" id="step-vocab"><h2 class="step__label">' + t("lesson.vocab") + "</h2>" +
        '<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn--ghost btn--sm js-play-all">' + t("lesson.playAll") + "</button>" +
        '<button class="btn btn--ghost btn--sm js-save-all">' + t("lesson.saveAll") + "</button></div>" +
        '<div class="vocab-grid">' + L.vocab.map(function (v) {
          var key = Core.cardKey(v.it);
          var saved = !!Core.state.srs[key];
          return '<div class="vocab-card">' +
            '<button type="button" class="say-btn" data-say="' + esc(v.it) + '" aria-label="' + esc(t("a11y.listenTo", { what: v.it })) + '">🔊</button>' +
            '<span class="vocab-card__txt"><span class="vocab-card__it">' + esc(v.it) + "</span>" +
            '<span class="vocab-card__pl">' + esc(v.tr) + "</span>" +
            (v.ex ? '<span class="vocab-card__ex">' + esc(v.ex) + "</span>" : "") + "</span>" +
            '<button type="button" class="vocab-card__star js-star" data-it="' + esc(v.it) + '" data-tr="' + esc(v.tr) + '" ' +
            'aria-pressed="' + saved + '" aria-label="' + esc(t("lesson.addToReview")) + '">' + gwiazdka(saved) + "</button></div>";
        }).join("") + "</div></section>");
    }

    /* --- dialogue --- */
    if (L.dialogue) {
      parts.push('<section class="step" id="step-dlg"><h2 class="step__label">' + t("lesson.dialogue", { title: esc(L.dialogue.titleIt || "") }) + "</h2>" +
        '<button class="btn btn--ghost btn--sm js-play-dlg" style="margin-bottom:12px">' + t("lesson.playDialogue") + "</button>" +
        '<div class="dlg">' + L.dialogue.lines.map(function (ln, i) {
          return '<div class="dlg__line' + (i % 2 ? " dlg__line--b" : "") + '">' +
            '<div class="dlg__who" aria-hidden="true">' + esc(ln.who || (i % 2 ? "🙋" : "🧑")) + "</div>" +
            '<div class="dlg__bubble"><span class="dlg__it">' + esc(ln.it) +
            ' <button type="button" class="say-btn" data-say="' + esc(ln.it) + '" aria-label="' + esc(t("a11y.listen")) + '">🔊</button></span>' +
            '<span class="dlg__pl">' + esc(ln.tr) + "</span></div></div>";
        }).join("") + "</div></section>");
    }

    /* --- culture --- */
    if (L.culture) {
      parts.push('<section class="step"><h2 class="step__label">' + esc(L.culture.title || t("lesson.culture")) + "</h2>" +
        '<div class="card" style="border-color:var(--line-mint)"><div class="prose">' + L.culture.text + "</div></div></section>");
    }

    /* --- exercises --- */
    if (L.exercises && L.exercises.length) {
      /* One exercise at a time: nine open at once were answered out of order
         and one skipped while scrolling kept the lesson from ever closing. */
      parts.push('<section class="step step--ex" id="step-ex"><h2 class="step__label">' + t("lesson.exercises") + "</h2>" +
        '<div class="ex-nav">' +
        '<button type="button" class="ex-nav__toggle js-ex-menu" aria-expanded="false" aria-controls="lessonExerciseList">' +
        '<span class="sr-only">' + esc(t("lesson.exercises")) + '</span>' +
        '<span class="ex-nav__current js-ex-current"></span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></button>' +
        '<div class="ex-nav__progress" role="progressbar" aria-label="' + esc(t("journey.lessonProgress")) + '" aria-valuemin="0" aria-valuemax="' + session.total + '" aria-valuenow="0" aria-valuetext="0/' + session.total + '"><i class="js-ex-progress" style="width:0%"></i></div>' +
        '<div id="lessonExerciseList" class="ex-chips" role="group" aria-label="' + esc(t("lesson.exercises")) + '">' +
        L.exercises.map(function (e, i) {
          return '<button type="button" class="ex-chip" data-go="' + i + '">' + (i + 1) + "</button>";
        }).join("") + '</div><span class="ex-open js-ex-open"></span></div>' +
        '<p class="journey-lesson-ex-progress js-ex-answered" aria-live="polite"></p>' +
        '<details class="journey-ex-guidance" hidden><summary><b>' + esc(t("journey.exerciseHintLabel")) +
        '</b><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg></summary>' +
        '<div class="journey-ex-guidance__content"><p class="journey-ex-guidance__text"></p><button type="button" class="journey-companion__dismiss js-dismiss-ex-guidance" aria-label="' +
        esc(t("journey.dismissGuidance")) + '">×</button></div></details>' +
        '<div id="exWrap"></div>' +
        '<div class="ex-foot"><button type="button" class="btn btn--ghost btn--sm js-ex-prev">' + esc(t("lesson.exPrev")) + "</button>" +
        '<span class="ex-foot__pos js-ex-pos"></span>' +
        '<button type="button" class="btn btn--primary btn--sm js-ex-next">' + esc(t("lesson.exNext")) + "</button></div></section>");
      parts.push('<div id="lessonEnd"></div>');
    }

    set(parts.join(""));
    var contentLang = LINGUAI.lessonLanguage(I18n.lang, L.id);
    el().setAttribute("data-lesson-language", contentLang);

    /* --- wiring --- */
    el().querySelector(".js-back").addEventListener("click", function () { Audio2.stop(); App.go("percorso"); });

    var playAll = el().querySelector(".js-play-all");
    if (playAll) playAll.addEventListener("click", function () {
      Audio2.speakSequence((L.vocab || []).map(function (v) { return { it: v.it }; }));
    });

    var saveAll = el().querySelector(".js-save-all");
    if (saveAll) saveAll.addEventListener("click", function () {
      (L.vocab || []).forEach(function (v) { Core.addCard(v.it, v.tr, L.id); });
      el().querySelectorAll(".js-star").forEach(function (b) { b.setAttribute("aria-pressed", "true"); b.innerHTML = gwiazdka(true); });
      var n = (L.vocab || []).length;
      Core.toast(t("lesson.savedVocab", { n: n }), "ok");
    });

    el().querySelectorAll(".js-star").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = b.getAttribute("data-it"), tr = b.getAttribute("data-tr");
        var key = Core.cardKey(it);
        if (Core.state.srs[key]) {
          delete Core.state.srs[key]; Core.save();
          b.setAttribute("aria-pressed", "false"); b.innerHTML = gwiazdka(false);
        } else {
          Core.addCard(it, tr, L.id);
          b.setAttribute("aria-pressed", "true"); b.innerHTML = gwiazdka(true);
        }
        App.refreshRail();
      });
    });

    el().querySelectorAll(".lesson-steps [data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = document.getElementById("step-" + b.getAttribute("data-step"));
        if (s) s.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    var playDlg = el().querySelector(".js-play-dlg");
    if (playDlg) playDlg.addEventListener("click", function () {
      Audio2.speakSequence(L.dialogue.lines);
    });

    /* --- exercises: mounting --- */
    var wrap = document.getElementById("exWrap");
    if (wrap) {
      wrap.addEventListener("focusin", scheduleFocusedLessonFieldClear);
      wrap.addEventListener("focusout", cancelFocusedLessonFieldClear);
    }
    if (wrap && L.exercises) {
      var built = L.exercises.map(function (ex, i) { return Ex.build(ex, i, L.id); });
      wrap.innerHTML = built.map(function (b) { return b.html; }).join("");
      var nodes = wrap.querySelectorAll(".exq");
      run = savedResume
        ? LessonRun.restore(built.length, savedResume.answers, savedResume.exerciseIndex)
        : LessonRun.create(built.length);
      session.answered = run.answers.filter(function (answer) { return answer !== null; }).length;
      session.score = run.answers.filter(function (answer) { return answer === true; }).length;
      /* A previous free-text response is never retained. Restored steps show
         only their saved correctness, so a learner can continue without
         silently submitting the same answer or changing its score. */
      nodes.forEach(function (node, i) {
        if (run.answers[i] === null) return;
        node.innerHTML = '<div class="journey-answer" role="status"><b>' +
          esc(t(run.answers[i] ? "journey.savedCorrect" : "journey.savedReview")) + "</b><p>" +
          esc(t("journey.savedPrivacy")) + "</p></div>";
      });
      /* An answer may report late (the model judge goes over the network):
         one from a lesson the student has left must not land in this one. */
      var mine = session;
      built.forEach(function (b, i) {
        /* Restored answers render as read-only feedback above, so their
           original input controls are intentionally absent from the DOM. */
        if (run.answers[i] !== null) return;
        b.wire(nodes[i], function (ok) {
          if (session !== mine) return;
          run = LessonRun.answer(run, i, ok);
          LearningJourney.saveResume(L.id, i, run.answers);
          LearningJourney.recordInteraction(false);
          drawRun();
          onAnswer(ok, L, U, LV);
          if (!LessonRun.isDone(run)) requestAnimationFrame(keepLessonActionsClear);
        });
      });
      Ex.wireSpeakers(wrap);
      var guidancePanel = el().querySelector(".journey-ex-guidance");
      if (guidancePanel) guidancePanel.open = !window.matchMedia("(max-width: 430px)").matches;
      var exerciseMenu = el().querySelector(".js-ex-menu");
      if (exerciseMenu) {
        setExerciseNavExpanded(false, false);
        exerciseMenu.addEventListener("click", function () {
          setExerciseNavExpanded(exerciseMenu.getAttribute("aria-expanded") !== "true", false);
        });
      }
      var dismissHint = el().querySelector(".js-dismiss-ex-guidance");
      if (dismissHint) dismissHint.addEventListener("click", function () {
        LearningJourney.dismissGuidance("lesson-" + L.id);
        drawRun();
      });
      el().querySelectorAll(".ex-chip").forEach(function (c) {
        c.addEventListener("click", function () { showEx(+c.getAttribute("data-go"), true); });
      });
      el().querySelector(".js-ex-prev").addEventListener("click", function () { showEx(run.current - 1); });
      el().querySelector(".js-ex-next").addEventListener("click", function () {
        var n = LessonRun.next(run);
        if (n !== null) showEx(n);
        else document.getElementById("lessonEnd").scrollIntoView({ behavior: "smooth", block: "center" });
      });
      drawRun();
      if (LessonRun.isDone(run)) finishRestoredRun(L, U, LV);
      else if (!savedResume) LearningJourney.saveResume(L.id, run.current, run.answers);
      if (savedResume && (run.current > 0 || session.answered > 0)) {
        requestAnimationFrame(function () {
          var restoredExercise = wrap.querySelector(".exq:not([hidden])");
          if (!restoredExercise) return;
          revealLessonExercise(restoredExercise, true);
        });
      }
    }
    // Give screen readers the actual language of each explanation block.
    var translated = ".view-head > p,.prose,.gram-box__rule,.gram-box__note,.pl,.nb,.vocab-card__pl,.dlg__pl,.exq__prompt,.exq__sub,.voice-pl,.gt th";
    el().querySelectorAll(translated).forEach(function (node) {
      node.setAttribute("lang", contentLang);
      node.setAttribute("dir", contentLang === "ar" ? "rtl" : "ltr");
    });
    el().querySelectorAll(".it,.dlg__it,.vocab-card__it,.vocab-card__ex,.opts,.tok-bank,.tok-target,.match-col.js-l,.conj-grid,input,.field-row > b,.field-row select,.voice-target").forEach(function (node) {
      node.setAttribute("lang", "it"); node.setAttribute("dir", "ltr");
    });
    // Arabic overlays can mix explanation cells and Italian examples in any
    // column. Choices may likewise be Arabic meanings or Italian forms.
    if (contentLang === "ar") el().querySelectorAll(".gt th,.gt td,.opts,.field-row > span,.match-col.js-r").forEach(function (node) {
      var isArabic = /[\u0600-\u06ff]/.test(node.textContent);
      node.setAttribute("lang", isArabic ? "ar" : "it");
      node.setAttribute("dir", isArabic ? "rtl" : "ltr");
    });
  };

  function showEx(i, returnFocus) {
    setExerciseNavExpanded(false, !!returnFocus);
    var hint = el().querySelector(".journey-ex-guidance");
    if (hint && window.matchMedia("(max-width: 430px)").matches) hint.open = false;
    run = LessonRun.go(run, i);
    if (session && run.answers.length) LearningJourney.saveResume(session.id, run.current, run.answers);
    drawRun();
    var cur = document.querySelectorAll("#exWrap .exq")[run.current];
    if (cur) revealLessonExercise(cur, false);
  }

  function setExerciseNavExpanded(open, returnFocus) {
    var nav = el().querySelector(".ex-nav");
    var toggle = el().querySelector(".js-ex-menu");
    if (!nav || !toggle) return;
    var mobile = window.matchMedia && window.matchMedia("(max-width: 430px)").matches;
    var expanded = mobile ? !!open : true;
    nav.classList.toggle("is-expanded", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    if (returnFocus && mobile) toggle.focus({ preventScroll: true });
  }

  function keepLessonActionsClear() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 880px)").matches) return;
    var bottomBar = document.querySelector(".bottom-nav");
    var actions = document.querySelector(".ex-foot");
    if (!bottomBar || !actions) return;
    /* Use the bar's untransformed height: it may be animating back in after
       an answer field loses focus, but its final safe area is still reserved. */
    var availableBottom = window.innerHeight - bottomBar.getBoundingClientRect().height - 12;
    var actionsBottom = actions.getBoundingClientRect().bottom;
    if (actionsBottom > availableBottom) window.scrollBy(0, actionsBottom - availableBottom);
  }

  function keepFocusedLessonFieldClear() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 880px)").matches) return;
    var field = document.activeElement;
    if (!field || !el().contains(field) || !field.matches("input,textarea,select")) return;
    var viewport = window.visualViewport;
    var visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
    var fieldBottom = field.getBoundingClientRect().bottom;
    var safeBottom = visibleBottom - 12;
    if (fieldBottom > safeBottom) {
      var root = document.documentElement;
      var previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollBy(0, fieldBottom - safeBottom);
      root.style.scrollBehavior = previousBehavior;
    }
  }

  var focusViewportResize = null;
  function scheduleFocusedLessonFieldClear() {
    requestAnimationFrame(keepFocusedLessonFieldClear);
    var viewport = window.visualViewport;
    if (!viewport) return;
    if (focusViewportResize) viewport.removeEventListener("resize", focusViewportResize);
    focusViewportResize = function () {
      viewport.removeEventListener("resize", focusViewportResize);
      focusViewportResize = null;
      requestAnimationFrame(keepFocusedLessonFieldClear);
    };
    viewport.addEventListener("resize", focusViewportResize, { once: true, passive: true });
  }
  function cancelFocusedLessonFieldClear() {
    var viewport = window.visualViewport;
    if (viewport && focusViewportResize) viewport.removeEventListener("resize", focusViewportResize);
    focusViewportResize = null;
  }
  /* On phones the menu shortcut scrolls away with the page, and the exercise
     shortcuts are in normal document flow. Place the task navigator near the
     top of the viewport without reserving space for a fixed overlay. */
  function revealLessonExercise(node, isResume) {
    var root = document.documentElement;
    var previousBehavior = root.style.scrollBehavior;
    var mobile = window.matchMedia && window.matchMedia("(max-width: 880px)").matches;
    if (mobile) {
      root.style.scrollBehavior = "auto";
      var nav = document.querySelector(".ex-nav");
      if (nav) {
        var navTop = nav.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo(0, Math.max(0, navTop - 16));
      } else {
        node.scrollIntoView({ behavior: "auto", block: isResume ? "center" : "nearest" });
      }
      /* A tall task can leave Previous/Next underneath the persistent bar. */
      keepLessonActionsClear();
    } else if (isResume) {
      root.style.scrollBehavior = "auto";
      node.scrollIntoView({ behavior: "auto", block: "center" });
    } else {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    root.style.scrollBehavior = previousBehavior;
  }

  /** Draws the run: which exercise shows, the chips' states, the counters. */
  function drawRun() {
    var n = run.answers.length;
    var answered = n - LessonRun.unanswered(run).length;
    var bar = document.getElementById("lessonBar"), score = document.getElementById("lessonScore");
    var progressTrack = el().querySelector(".lesson-top__bar");
    if (bar) bar.style.width = pct(n ? answered / n : 0) + "%";
    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(answered));
      progressTrack.setAttribute("aria-valuetext", answered + "/" + n);
    }
    if (score) score.textContent = run.answers.filter(function (answer) { return answer === true; }).length + "/" + n;
    var navProgress = el().querySelector(".ex-nav__progress");
    var navProgressFill = el().querySelector(".js-ex-progress");
    if (navProgress) {
      navProgress.setAttribute("aria-valuenow", String(answered));
      navProgress.setAttribute("aria-valuetext", t("journey.answeredProgress", {
        done: answered, total: n, remaining: n - answered
      }));
    }
    if (navProgressFill) navProgressFill.style.width = pct(n ? answered / n : 0) + "%";
    var answerSummary = el().querySelector(".js-ex-answered");
    if (answerSummary) answerSummary.textContent = t("journey.answeredProgress", {
      done: answered, total: n, remaining: n - answered
    });
    var hintPanel = el().querySelector(".journey-ex-guidance");
    if (hintPanel) {
      var hintKey = LearningJourney.exerciseGuidance(activeExercises[run.current], LearningJourney.profile().meaningfulSessions);
      var hintHidden = LearningJourney.guidanceDismissed("lesson-" + session.id);
      hintPanel.hidden = !hintKey || hintHidden;
      var hintText = hintPanel.querySelector(".journey-ex-guidance__text");
      if (hintText) hintText.textContent = hintKey ? t(hintKey) : "";
    }
    document.querySelectorAll("#exWrap .exq").forEach(function (q, i) { q.hidden = i !== run.current; });
    document.querySelectorAll(".ex-chip").forEach(function (c, i) {
      var a = run.answers[i];
      c.className = "ex-chip" + (a === true ? " is-ok" : a === false ? " is-ko" : "");
      if (i === run.current) c.setAttribute("aria-current", "step"); else c.removeAttribute("aria-current");
      c.setAttribute("aria-label", t(a === true ? "lesson.chipOk" : a === false ? "lesson.chipKo" : "lesson.chipOpen", { i: i + 1 }));
    });
    var open = LessonRun.unanswered(run).length;
    el().querySelector(".js-ex-open").textContent = open ? t("lesson.exOpen", { n: open }) : "";
    var currentExercise = t("lesson.exOf", { i: run.current + 1, n: n });
    var currentLabel = el().querySelector(".js-ex-current");
    if (currentLabel) currentLabel.textContent = currentExercise;
    el().querySelector(".js-ex-pos").textContent = currentExercise;
    el().querySelector(".js-ex-prev").disabled = run.current === 0;
    el().querySelector(".js-ex-next").disabled = LessonRun.next(run) === null && !LessonRun.isDone(run);
  }

  /** The star with words: the glyph alone did not say that it sends the word to the reviews. */
  function gwiazdka(saved) {
    return '<span aria-hidden="true">' + (saved ? "★" : "☆") + "</span> " +
      esc(t(saved ? "lesson.starIn" : "lesson.starAdd"));
  }

  function onAnswer(ok, L, U, LV) {
    session.answered += 1;
    if (ok) session.score += 1;
    var bar = document.getElementById("lessonBar");
    var sc = document.getElementById("lessonScore");
    if (bar) bar.style.width = pct(session.answered / session.total) + "%";
    if (sc) sc.textContent = session.score + "/" + session.total;

    if (!ok && L.vocab) {
      // a mistake -> add the lesson's words to the reviews so that they come back
      L.vocab.slice(0, 4).forEach(function (v) { Core.addCard(v.it, v.tr, L.id); });
    }

    if (session.answered >= session.total) {
      var wasDone = Core.isLessonDone(L.id);
      var previous = Core.lessonState(L.id);
      var saved = LearningJourney.resumeFor(L.id, session.total);
      var alreadyRecorded = saved && previous && previous.ts >= saved.updatedAt &&
        previous.total === session.total && previous.score === session.score;
      var res = alreadyRecorded ? previous : Core.recordLesson(L.id, session.score, session.total, (Date.now() - session.started) / 1000);
      /* A lesson passed for the FIRST time puts its words in the reviews: until
         now only a star, "add all" or a mistake did, and after two lessons the
         deck was empty. Only then: at every run it brought back words the
         student had deleted, and a failed run will be taken again. */
      session.newWords = res.done && !wasDone;
      if (session.newWords) (L.vocab || []).forEach(function (v) { Core.addCard(v.it, v.tr, L.id); });
      LearningJourney.recordLessonCompletion(L.id, LV.code);
      LearningJourney.clearResume(L.id);
      renderLessonEnd(res, L, U, LV);
      App.refreshRail();
    }
  }

  function finishRestoredRun(L, U, LV) {
    var score = run.answers.filter(function (answer) { return answer === true; }).length;
    var previous = Core.lessonState(L.id);
    var res = previous && previous.ts >= (LearningJourney.resumeFor(L.id, session.total) || {}).updatedAt &&
      previous.total === session.total && previous.score === score
      ? previous : Core.recordLesson(L.id, score, session.total, (Date.now() - session.started) / 1000);
    session.score = score; session.answered = session.total;
    LearningJourney.recordLessonCompletion(L.id, LV.code);
    LearningJourney.clearResume(L.id);
    renderLessonEnd(res, L, U, LV);
    App.refreshRail();
  }

  function renderLessonEnd(res, L, U, LV) {
    var p = res.total ? res.score / res.total : 0;
    var msg = p === 1 ? t("lesson.end.perfect")
      : p >= 0.85 ? t("lesson.end.great")
      : p >= 0.7 ? t("lesson.end.pass")
      : t("lesson.end.fail");

    var next = Core.nextLesson(LV);
    var levelProgress = Core.levelProgress(LV);
    var levelComplete = levelProgress.total > 0 && levelProgress.done === levelProgress.total;
    var unitComplete = U.lessons && U.lessons.length > 0 && U.lessons.every(function (lesson) { return Core.isLessonDone(lesson.id); });
    var completedLessons = LearningJourney.completedCount(Core.state);
    var completionMessage = unitComplete ? t("journey.completeUnit", { unit: U.title })
      : completedLessons === 1 ? t("journey.completeFirst") : "";
    var registryLevels = Core.registry.levels;
    var levelIndex = registryLevels.findIndex(function (level) { return level.code === LV.code; });
    var hasLaterLevel = levelIndex >= 0 && levelIndex + 1 < registryLevels.length;
    var descriptionIsArabic = /[\u0600-\u06ff]/.test(LV.desc || "");
    var outcome = levelComplete && LV.desc
      ? '<section class="journey-level-complete" aria-labelledby="journeyLevelCompleteTitle">' +
        '<h3 id="journeyLevelCompleteTitle">' + esc(t("lesson.levelComplete", { level: LV.code })) +
        "</h3><p><b>" + esc(t("lesson.levelOutcome")) +
        '</b></p><p lang="' + (descriptionIsArabic ? "ar" : "en") + '" dir="' + (descriptionIsArabic ? "rtl" : "ltr") + '">' +
        esc(LV.desc) + "</p></section>" : "";
    var nextMarkup = next
      ? '<button type="button" class="btn btn--primary js-next">' + t("lesson.next", { title: esc(next.lesson.titleIt) }) + "</button>"
      : levelComplete && hasLaterLevel
        ? '<button type="button" class="btn btn--primary js-next-loading" disabled>' + esc(t("lesson.nextLevelLoading")) + "</button>" : "";
    var box = document.getElementById("lessonEnd");
    box.innerHTML = '<div class="summary">' +
      '<div class="summary__score">' + pct(p) + "%</div>" +
      '<p class="summary__msg">' + esc(msg) + " (" + res.score + "/" + res.total + ")</p>" +
      (completionMessage ? '<aside class="journey-completion-note" lang="ar" dir="rtl">' + esc(completionMessage) + '</aside>' : "") +
      outcome +
      '<div class="summary__acts">' +
      '<button class="btn btn--ghost js-again">' + t("lesson.again") + "</button>" +
      nextMarkup +
      '<button class="btn btn--ghost js-path">' + t("nav.path") + "</button>" +
      "</div>" + recap(L) + "</div>";

    box.querySelector(".js-again").addEventListener("click", function () { App.go("lezione", { id: L.id }); });
    box.querySelector(".js-path").addEventListener("click", function () { App.go("percorso"); });
    var nb = box.querySelector(".js-next");
    if (nb) nb.addEventListener("click", function () { App.go("lezione", { id: next.lesson.id }); });
    else if (levelComplete && hasLaterLevel) Core.findNextLesson(function (found) {
      var loading = box.querySelector(".js-next-loading");
      if (!loading || !loading.isConnected) return;
      if (!found) { loading.remove(); return; }
      loading.outerHTML = '<button type="button" class="btn btn--primary js-next">' +
        t("lesson.next", { title: esc(found.lesson.titleIt) }) + "</button>";
      box.querySelector(".js-next").addEventListener("click", function () { App.go("lezione", { id: found.lesson.id }); });
    }, levelIndex + 1);
    box.querySelectorAll(".lesson-recap [data-go]").forEach(function (b) {
      b.addEventListener("click", function () { showEx(+b.getAttribute("data-go")); });
    });
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /** What went wrong, each a way back to its exercise, and where the words went. */
  function recap(L) {
    var zle = LessonRun.wrong(run);
    var n = session.newWords ? (L.vocab || []).length : 0;
    return (zle.length ? '<div class="lesson-recap"><b>' + esc(t("lesson.end.recap")) + "</b> " + zle.map(function (i) {
      return '<button type="button" class="btn btn--quiet btn--sm" data-go="' + i + '">' +
        esc(t("lesson.exOf", { i: i + 1, n: run.answers.length })) + "</button>";
    }).join("") + "</div>" : "") +
      (n ? '<p class="lesson-vocab-in">✓ ' + esc(t("lesson.end.vocabIn", { n: n })) + "</p>" : "");
  }
})();
