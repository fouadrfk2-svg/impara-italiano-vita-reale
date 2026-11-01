/* ============================================================
   views-today.js — a learner-specific next step and optional daily review.

   Recommendations use saved lesson progress, unfinished exercise state,
   due review cards, repeated errors, the learner's goal, and time preference.
   The review remains optional; exploration is never locked.

   Classic script. Requires core.js, errors.js, drills.js, views.js.
   ============================================================ */
(function () {
  "use strict";

  var esc = Core.esc;
  var t = function (k, v) { return I18n.t(k, v); };
  var set = Views.shell.set;
  var pageHead = Views.shell.head;
  var runCards = Views.shell.runCards;

  /* Existing review mechanics scale to a learner's chosen session length. */
  function planFor(minutes) {
    return minutes === 10 ? { errors: 3, drills: 1, cards: 4 }
      : minutes === 30 ? { errors: 9, drills: 4, cards: 12 }
      : { errors: 6, drills: 3, cards: 8 };
  }

  function startingLevelIndex(profile) {
    var levels = Core.registry.levels, selected = profile && profile.startingLevel;
    var index = levels.findIndex(function (level) { return level.code === selected; });
    return index < 0 ? 0 : index;
  }
  function nextFromStartingLevel(profile) {
    if (!profile || !profile.startMode) return Core.nextOpenLesson();
    var levels = Core.registry.levels;
    for (var i = startingLevelIndex(profile); i < levels.length; i++) {
      if (Core.registry.loaded[levels[i].code] !== true) continue;
      var next = Core.nextLesson(levels[i]);
      if (next) return { level: levels[i], unit: next.unit, lesson: next.lesson };
    }
    return null;
  }
  function findNextFromStartingLevel(profile, callback) {
    Core.findNextLesson(callback, profile && profile.startMode ? startingLevelIndex(profile) : 0);
  }

  function completedUnit(unit) {
    return !!(unit && Array.isArray(unit.lessons) && unit.lessons.length &&
      unit.lessons.every(function (lesson) { return Core.isLessonDone(lesson.id); }));
  }
  function companionFor(profile, completed, absence, repeated) {
    var last = profile.lastCompletedLessonId && Core.getLesson(profile.lastCompletedLessonId);
    if (last) {
      var level = Core.levelProgress(last.level);
      if (level.total > 0 && level.done === level.total) {
        return { id: "level-" + last.level.code, key: "journey.milestoneLevel", values: { level: last.level.code } };
      }
      if (completedUnit(last.unit)) {
        return { id: "unit-" + (last.unit.id || last.unit.title), key: "journey.milestoneUnit", values: { unit: last.unit.title } };
      }
    }
    if (completed === 1 && absence !== null && absence <= 1) return { id: "first-lesson", key: "journey.milestoneFirstLesson" };
    if (repeated >= 3) return { id: "repeated-mistakes", key: "journey.milestoneMistakes" };
    if (absence !== null && absence >= 3) return { id: "returning", key: "journey.milestoneReturn" };
    var key = profile.meaningfulSessions === 0 ? "journey.coachFirst"
      : profile.meaningfulSessions < 3 ? "journey.coachEarly"
        : profile.meaningfulSessions < 5 ? "journey.coachReview"
          : profile.meaningfulSessions < 7 ? "journey.coachIndependent" : null;
    return key ? { id: "coach-" + key.slice("journey.coach".length).toLowerCase(), key: key } : null;
  }
  function progressRow(className, label, done, total) {
    if (!total) return "";
    done = Math.max(0, Math.min(done || 0, total));
    return '<div class="journey-progress-item ' + className + '"><span>' + esc(label) + '</span><b>' + done + '/' + total +
      '</b><progress max="' + total + '" value="' + done + '" aria-label="' + esc(label) + '" aria-valuetext="' +
      done + '/' + total + '"></progress></div>';
  }

  /** Today's date in the same format Core uses. */
  function dzis() { return Core.today(); }

  /** How many parts of the session have real content today. */
  function zbierz(plan) {
    var bledy = Errors.due(plan.errors);
    var fiszki = Core.dueCards(plan.cards);
    /* The drill topic is chosen where the student has the most open cards:
       training is meant to hammer at a weak spot, not to draw at random.
       Without one, it comes from a lesson already passed (Drills.pickTopic). */
    var wg = Errors.byTag(), goalTags = LearningJourney.goalTags(LearningJourney.profile().goal);
    var availableGoals = goalTags.filter(function (tag) { return wg[tag] && wg[tag].length; })
      .sort(function (a, b) { return wg[b].length - wg[a].length; });
    var najslabszy = availableGoals[0] || Object.keys(wg).sort(function (a, b) { return wg[b].length - wg[a].length; })[0];
    var wybor = Drills.pickTopic({
      weakTag: najslabszy || null,
      isDone: Core.isLessonDone,
      day: Math.floor(Date.now() / 86400000)
    });
    var drille = Drills.session(wybor.topic.id, plan.drills, "oggi-" + dzis());
    return { bledy: bledy, fiszki: fiszki, drille: drille, topic: wybor.topic, why: wybor.why };
  }

  function wiersz(label, n, sub) {
    return '<div class="list-row"><span class="list-row__main"><b>' + esc(label) + "</b>" +
      (sub ? "<span>" + esc(sub) + "</span>" : "") + "</span>" +
      '<span class="chip' + (n ? " chip--green" : "") + '">' + n + "</span></div>";
  }

  Views.oggi = function () {
    var profile = LearningJourney.profile(), plan = planFor(profile.dailyMinutes);
    var s = zbierz(plan), next = nextFromStartingLevel(profile), resume = LearningJourney.activeResume();
    var resumedEntry = resume && Core.getLesson(resume.lessonId);
    var resumed = resumedEntry && !Core.isLessonDone(resume.lessonId)
      ? LearningJourney.resumeFor(resume.lessonId, (resumedEntry.lesson.exercises || []).length) : null;
    var activity = resumed && resumedEntry
      ? LearningJourney.resumeMetrics(resumed, (resumedEntry.lesson.exercises || []).length) : null;
    var completed = LearningJourney.completedCount(Core.state), absence = LearningJourney.daysSinceInteraction(Date.now());
    var away = absence !== null && absence >= 3;
    var dueReview = s.bledy.length + s.fiszki.length > 0;
    var repeated = Object.keys(Core.state.errors || {}).filter(function (key) {
      return Number(Core.state.errors[key].lapses || 0) >= 2;
    }).length;
    var returning = absence !== null && absence >= 3 && dueReview;
    /* An exact saved lesson always stays one tap away, even when a review is due. */
    var mode = resumed ? "resume" : returning ? "review" : repeated >= 3 && dueReview ? "review" : next ? "lesson" : "review";
    var current = resumed && Core.getLesson(resumed.lessonId);
    var actionTitle = mode === "resume" ? t("journey.resume")
      : mode === "review" ? t(returning ? "journey.returnReview" : repeated >= 3 ? "journey.repeated" : "journey.review")
        : t(completed ? "journey.continue" : "journey.firstLesson");
    var actionWhy = mode === "resume" ? t(away ? "journey.resumeReturnWhy" : "journey.resumeWhy", {
      i: resumed.exerciseIndex + 1, n: resumed.answers.length
    }) : mode === "review" ? t(returning ? "journey.returnWhy" : repeated >= 3 ? "journey.repeatedWhy" : "journey.reviewWhy")
      : t(completed ? "journey.nextWhy" : "journey.firstWhy", {
        lesson: next && (next.lesson.titleIt || next.lesson.title)
      });
    var totalTasks = s.bledy.length + s.drille.length + s.fiszki.length;
    var DRILL_SUB = { weak: "today.drillWeak", studied: "today.drillStudied", preview: "today.drillPreview" };
    var progressLevel = current ? current.level : next && next.level;
    var levelProgress = progressLevel ? Core.levelProgress(progressLevel) : { done: completed, total: 0, pct: 0 };
    var levelDone = Math.min(levelProgress.done || 0, levelProgress.total || 0);
    var unitContext = current || next;
    var unitLessons = unitContext && unitContext.unit && unitContext.unit.lessons || [];
    var unitDone = unitLessons.filter(function (lesson) { return Core.isLessonDone(lesson.id); }).length;
    var completedLabel = t("journey.completed");
    var progressCards = progressRow("journey-unit-progress", t("journey.unitProgress"), unitDone, unitLessons.length) +
      progressRow("journey-level-progress", t("journey.levelProgress"), levelDone, levelProgress.total);
    var lessonName = current ? current.lesson.titleIt || current.lesson.title : next && (next.lesson.titleIt || next.lesson.title);
    var primary = mode === "resume" ? '<button class="btn btn--primary js-resume">' + esc(t("journey.resumeCta")) + "</button>"
      : mode === "lesson" ? '<button class="btn btn--primary js-next-lesson">' + esc(t(completed ? "journey.continueCta" : "journey.firstCta")) + "</button>"
        : '<button class="btn btn--primary js-start">' + esc(t("journey.reviewCta", { n: totalTasks })) + "</button>";
    var secondary = mode === "resume" || mode === "lesson"
      ? totalTasks ? '<button class="btn btn--ghost btn--sm js-start">' + esc(t("journey.optionalReview", { n: totalTasks })) + "</button>" : ""
      : resumed ? '<button class="btn btn--ghost btn--sm js-resume">' + esc(t("journey.resumeSecondary", { i: resumed.exerciseIndex + 1, n: resumed.answers.length })) + "</button>"
        : next ? '<button class="btn btn--ghost btn--sm js-next-lesson">' + esc(t("journey.nextSecondary")) + "</button>" : "";
    var companion = companionFor(profile, completed, absence, repeated);
    var companionMarkup = companion && !LearningJourney.guidanceDismissed(companion.id)
      ? '<aside class="journey-companion" role="note"><p><b>' + esc(t("journey.companionHeading")) + '</b><span>' +
        esc(t(companion.key, companion.values)) + '</span></p><button type="button" class="journey-companion__dismiss js-dismiss-journey" data-guidance="' +
        esc(companion.id) + '" aria-label="' + esc(t("journey.dismissGuidance")) + '">×</button></aside>' : "";
    var minutes = LearningJourney.MINUTES.map(function (n) {
      return '<button type="button" class="journey-minutes' + (n === profile.dailyMinutes ? " is-selected" : "") +
        '" data-minutes="' + n + '" aria-pressed="' + (n === profile.dailyMinutes) + '">' + n + " " + esc(t("welcome.minutesLabel")) + "</button>";
    }).join("");
    var activityMarkup = activity ? '<section class="journey-activity-progress" aria-label="' + esc(t("journey.activityProgress")) + '"><div class="journey-activity-progress__head"><span>' +
      esc(t("journey.currentExercise")) + '</span><b>' + activity.current + '/' + activity.total + '</b></div><p>' +
      esc(t("journey.answeredProgress", { done: activity.answered, total: activity.total, remaining: activity.remaining })) +
      '</p><progress max="' + activity.total + '" value="' + activity.answered + '" aria-label="' + esc(t("journey.activityProgress")) +
      '" aria-valuetext="' + activity.answered + '/' + activity.total + '"></progress></section>' : "";

    set(pageHead(t("today.kicker"), t("journey.title"), t("journey.intro")) +
      '<section class="journey-today" aria-labelledby="journeyTodayTitle">' +
      '<p class="journey-eyebrow">' + esc(t("journey.eyebrow")) + "</p>" +
      '<div class="journey-progress"><b>' + completed + "</b><span>" + esc(completedLabel) +
      '</span><span class="journey-level">' + esc(progressLevel ? progressLevel.code : "") + "</span></div>" +
      '<div class="journey-location"><b>' + esc(unitContext && unitContext.unit ? unitContext.unit.title : t("journey.pathReady")) + "</b>" +
      '<span class="journey-lesson-title" lang="it" dir="ltr">' + esc(lessonName || t("journey.noOpenLesson")) + "</span></div>" +
      activityMarkup +
      '<h2 id="journeyTodayTitle">' + esc(actionTitle) + "</h2><p>" + esc(actionWhy) + "</p>" +
      primary + secondary +
      (progressCards ? '<div class="journey-progress-groups">' + progressCards + '</div>' : "") + companionMarkup +
      '<p class="journey-focus">' + esc(t("journey.goalFocus", { goal: t("welcome.goal." + profile.goal) })) + "</p>" +
      '<div class="journey-minutes" role="group" aria-label="' + esc(t("journey.sessionLength")) + '">' + minutes + "</div>" +
      "</section>" +
      (Core.state.session && Core.state.session.date === dzis() ? '<div class="card today-done"><p>' + esc(t("today.alreadyDone")) + "</p></div>" : "") +
      '<details class="journey-plan"><summary>' + esc(t("journey.planSummary", { n: totalTasks })) + "</summary>" +
      '<div class="stack" style="margin-top:12px">' +
      (s.bledy.length ? wiersz(t("today.partErrors"), s.bledy.length) : "") +
      wiersz(t("today.partDrills", { topic: Train.topicLabel(s.topic.id) }), s.drille.length, t(DRILL_SUB[s.why])) +
      (s.fiszki.length ? wiersz(t("today.partCards"), s.fiszki.length) : "") +
      '</div></details><div id="todayBox" style="margin-top:20px"></div>');

    document.querySelectorAll(".js-start").forEach(function (button) {
      button.addEventListener("click", function () { przebieg(s); });
    });
    document.querySelectorAll(".js-resume").forEach(function (button) {
      button.addEventListener("click", function () { App.go("lezione", { id: resumed.lessonId }); });
    });
    document.querySelectorAll(".js-next-lesson").forEach(function (button) {
      button.addEventListener("click", function () { if (next) App.go("lezione", { id: next.lesson.id }); });
    });
    document.querySelectorAll(".js-dismiss-journey").forEach(function (button) {
      button.addEventListener("click", function () {
        LearningJourney.dismissGuidance(button.getAttribute("data-guidance"));
        var note = button.closest(".journey-companion");
        if (note) note.remove();
      });
    });
    document.querySelectorAll(".journey-minutes").forEach(function (button) {
      button.addEventListener("click", function () {
        LearningJourney.updateProfile({ dailyMinutes: Number(button.getAttribute("data-minutes")) });
        Views.oggi();
      });
    });
    if (!next) findNextFromStartingLevel(profile, function (found) {
      if (found && Router.current.route === "oggi" && !document.querySelector(".js-next-lesson")) Views.oggi();
    });
  };

  /* ---------------- The run ---------------- */

  function przebieg(s) {
    var box = document.getElementById("todayBox");
    document.querySelector(".js-start").hidden = true;
    var dobre = 0, zgubione = 0;
    var wszystkie = s.bledy.length + s.drille.length + s.fiszki.length;

    /* The task queue: mistake cards, then drills. Flashcards have a run of
       their own (a different interaction: reveal and grade), so they go
       separately at the end. */
    var kolejka = s.bledy.map(function (k) { return { rodzaj: "blad", karta: k }; })
      .concat(s.drille.map(function (d) { return { rodzaj: "drill", item: d }; }));
    var i = 0;

    function zadanie() {
      if (i >= kolejka.length) { fiszkiEtap(); return; }
      var poz = kolejka[i];
      var ex, seed, idx, opis;

      if (poz.rodzaj === "blad") {
        var gdzie = Errors.locate(poz.karta.key);
        /* A card with no exercise disappears, but the student must hear
           about it: a silent loss looks exactly like a pass. The Mistakes
           tab says the same thing, so it says the same thing here. */
        if (!gdzie) { Errors.drop(poz.karta.key); zgubione++; wszystkie--; i++; zadanie(); return; }
        ex = gdzie.ex;
        idx = gdzie.index;
        /* The seed has to be the lesson id, so that the wrapped Ex.build
           recognises the exercise and updates the card by itself. Generated
           tasks have no such match and are recorded directly, below. */
        seed = gdzie.generated ? "drill-" + gdzie.topicId : gdzie.lesson.id;
        opis = t("today.stepError");
      } else {
        ex = poz.item.ex;
        idx = i;
        seed = "drill-" + poz.item.topicId;
        opis = t("today.stepDrill");
      }

      var zbudowane = Ex.build(ex, idx, seed);
      box.innerHTML = '<p class="exq__num">' + esc(t("today.progress", { i: i + 1, n: wszystkie })) +
        " · " + esc(opis) + "</p>" + zbudowane.html +
        '<div style="margin-top:16px"><button class="btn btn--ghost btn--sm js-next" hidden>' +
        esc(t("today.next")) + "</button></div>";

      Ex.wireSpeakers(box);
      var next = box.querySelector(".js-next");
      /* Who records the result: a lesson exercise updates itself through the
         wrapped Ex.build, a generated task has no lesson to be recognised by
         and has to be recorded here — including when it comes back as a
         card. */
      var wygenerowane = poz.rodzaj === "drill" ? poz.item
        : (gdzie && gdzie.generated ? { topicId: gdzie.topicId, seed: gdzie.seed, tag: poz.karta.tag } : null);

      zbudowane.wire(box.querySelector(".exq"), function (ok) {
        if (ok) dobre++;
        if (wygenerowane) Errors.recordGenerated(wygenerowane, ok);
        next.hidden = false;
        next.focus();
      });
      next.addEventListener("click", function () { i++; zadanie(); });
    }

    function fiszkiEtap() {
      if (!s.fiszki.length) { koniec(); return; }
      box.innerHTML = '<p class="exq__num">' + esc(t("today.stepCards")) + '</p><div id="srsBox"></div>';
      runCards(document.getElementById("srsBox"), s.fiszki, function (right) {
        dobre += right;
        koniec();
      });
    }

    function koniec() {
      Core.state.session = { date: dzis(), score: dobre, total: wszystkie };
      Core.save();
      if (wszystkie > 0) LearningJourney.recordInteraction(true);
      findNextFromStartingLevel(LearningJourney.profile(), function (next) { podsumowanie(next); });
      App.refreshRail();
    }

    function podsumowanie(next) {
      if (!box.isConnected) return;   // the student left before a level finished loading
      box.innerHTML = '<div class="summary"><div class="summary__score">' + dobre + "/" + wszystkie + "</div>" +
        '<p class="summary__msg">' + esc(t("today.done")) + "</p>" +
        (zgubione ? '<p class="summary__msg">' + esc(t("err.gone", { n: zgubione })) + "</p>" : "") +
        '<div class="summary__acts">' +
        (next ? '<button class="btn btn--primary js-lesson">' +
          esc(t("today.nextLesson", { lesson: next.lesson.title || next.lesson.titleIt })) + "</button>" : "") +
        '<button class="btn btn--ghost js-path">' + esc(t("nav.path")) + "</button></div></div>";
      var b = box.querySelector(".js-lesson");
      if (b) b.addEventListener("click", function () { App.go("lezione", { id: next.lesson.id }); });
      box.querySelector(".js-path").addEventListener("click", function () { App.go("percorso"); });
    }

    zadanie();
  }

})(window);
