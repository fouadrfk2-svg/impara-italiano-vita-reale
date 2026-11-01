/* First-run onboarding: a five-step, resumable guide for authenticated learners. */
(function () {
  "use strict";

  var esc = Core.esc;
  var t = function (k, v) { return I18n.t(k, v); };
  var set = Views.shell.set;
  var el = Views.shell.root;
  var step = 1;

  function profile() { return LearningJourney.profile(); }
  function checked(name, value, current) { return value === current ? " checked" : ""; }
  function goalOptions(current) {
    return [
      ["everyday", "welcome.goalEveryday"],
      ["work", "welcome.goalWork"],
      ["a2-exam", "welcome.goalA2"],
      ["b1-exam", "welcome.goalB1"],
      ["general", "welcome.goalGeneral"]
    ].map(function (item) {
      return '<label class="journey-choice"><input type="radio" name="journey-goal" value="' + item[0] + '"' +
        checked("goal", item[0], current) + '><span><b>' + esc(t(item[1])) + "</b></span></label>";
    }).join("");
  }
  function minuteOptions(current) {
    return LearningJourney.MINUTES.map(function (n) {
      return '<label class="journey-choice journey-choice--compact"><input type="radio" name="journey-minutes" value="' + n + '"' +
        checked("minutes", n, current) + '><span><b>' + n + "</b> " + esc(t("welcome.minutesLabel")) + "</span></label>";
    }).join("");
  }
  function startOptions(current) {
    return [
      ["zero", "welcome.startZero", "welcome.startZeroHint"],
      ["known", "welcome.startKnown", "welcome.startKnownHint"],
      ["placement", "welcome.startPlacement", "welcome.startPlacementHint"]
    ].map(function (item) {
      return '<label class="journey-choice"><input type="radio" name="journey-start" value="' + item[0] + '"' +
        checked("start", item[0], current) + '><span><b>' + esc(t(item[1])) + "</b><small>" +
        esc(t(item[2])) + "</small></span></label>";
    }).join("");
  }
  function levelOptions(current) {
    return (Core.registry.levels || []).map(function (level) {
      return '<option value="' + esc(level.code) + '"' + (level.code === current ? " selected" : "") + ">" +
        esc(level.code + (level.name ? " · " + level.name : "")) + "</option>";
    }).join("");
  }
  function stepMarkers(current) {
    return '<div class="journey-step-markers" aria-hidden="true">' + [1, 2, 3, 4, 5].map(function (n) {
      return '<span class="journey-step-marker' + (n < current ? ' is-done' : n === current ? ' is-current' : '') + '"></span>';
    }).join('') + '</div>';
  }
  function head(current, title, body) {
    return '<header class="journey-head"><p class="journey-eyebrow">' + esc(t("welcome.wizardKicker")) +
      " · " + esc(t("welcome.wizardStep", { i: current, n: 5 })) + "</p><h1>" + esc(title) +
      "</h1><p>" + esc(body) + '</p><div class="journey-track" role="progressbar" aria-label="' +
      esc(t("welcome.wizardProgress")) + '" aria-valuemin="1" aria-valuemax="5" aria-valuenow="' + current +
      '"><i style="width:' + (current * 20) + '%"></i></div>' + stepMarkers(current) + '</header>';
  }
  function routePanel() {
    var items = ["welcome.routeNotice", "welcome.routeUnderstand", "welcome.routeTry"];
    return '<aside class="journey-route" aria-labelledby="journeyRouteTitle"><p class="journey-route__title" id="journeyRouteTitle">' +
      esc(t("welcome.routeTitle")) + '</p><ol>' + items.map(function (key, index) {
        return '<li><span class="journey-route__index" aria-hidden="true">0' + (index + 1) + '</span><span>' +
          esc(t(key)) + '</span></li>';
      }).join('') + '</ol></aside>';
  }
  function stepActions(disabled) {
    return '<div class="journey-actions"><button type="button" class="btn btn--primary js-step-next" ' +
      (disabled ? 'disabled ' : '') + '>' + esc(t("welcome.wizardContinue")) + '</button><button type="button" class="btn btn--quiet js-step-back">' +
      esc(t("welcome.wizardBack")) + '</button></div>';
  }
  function render(focusHeading) {
    var p = profile();
    step = p.onboardingStep;
    var html = '<section class="journey-wizard" dir="rtl" data-step="' + step + '">';
    if (step === 1) {
      html += '<div class="journey-welcome-grid"><div class="journey-welcome-copy">' +
        head(1, t("welcome.wizardWelcomeTitle"), t("welcome.wizardWelcomeText")) +
        '<div class="journey-card"><p>' + esc(t("welcome.wizardApproach")) + '</p></div>' +
        '<button type="button" class="btn btn--primary js-step-next">' + esc(t("welcome.wizardContinue")) + "</button></div>" + routePanel() + '</div>';
    } else if (step === 2) {
      html += head(2, t("welcome.wizardLevelTitle"), t("welcome.wizardLevelText")) +
        '<fieldset class="journey-options"><legend class="sr-only">' + esc(t("welcome.wizardLevelTitle")) + "</legend>" +
        startOptions(p.startMode) + '</fieldset><div class="journey-level" ' +
        (p.startMode === "known" ? "" : "hidden") + '><label for="journeyLevel">' + esc(t("welcome.selectLevel")) +
        '</label><select id="journeyLevel">' + levelOptions(p.startingLevel || "A1") + '</select></div>' + stepActions(!p.startMode);
    } else if (step === 3) {
      html += head(3, t("welcome.wizardGoalTitle"), t("welcome.wizardGoalText")) +
        '<fieldset class="journey-options"><legend class="sr-only">' + esc(t("welcome.wizardGoalTitle")) +
        "</legend>" + goalOptions(p.goal) + '</fieldset>' + stepActions(false);
    } else if (step === 4) {
      html += head(4, t("welcome.wizardTimeTitle"), t("welcome.wizardTimeText")) +
        '<fieldset class="journey-options journey-options--minutes"><legend class="sr-only">' +
        esc(t("welcome.wizardTimeTitle")) + "</legend>" + minuteOptions(p.dailyMinutes) +
        '</fieldset><p class="journey-note">' + esc(t("welcome.wizardNoSchedule")) + '</p>' + stepActions(false);
    } else {
      var secondary = p.startMode === "zero"
        ? '<button type="button" class="btn btn--quiet js-start-direct">' + esc(t("welcome.startLessonDirect")) + "</button>"
        : '<button type="button" class="btn btn--quiet js-sounds">' + esc(t("welcome.optionalSounds")) + "</button>";
      html += head(5, t("welcome.wizardReadyTitle"), recommendation(p)) +
        '<div class="journey-card journey-card--summary"><b>' + esc(t("welcome.goalLabel")) + "</b><span>" +
        esc(t("welcome.goal." + p.goal)) + "</span><b>" + esc(t("welcome.minutesLabel")) +
        "</b><span>" + esc(String(p.dailyMinutes)) + '</span></div>' +
        '<div class="journey-actions"><button type="button" class="btn btn--primary js-start-journey">' +
        esc(t("welcome.startJourney")) + '</button><button type="button" class="btn btn--quiet js-step-back">' +
        esc(t("welcome.wizardBack")) + '</button></div>' + secondary;
    }
    html += "</section>";
    set(html);
    var heading = focusHeading && el().querySelector(".journey-head h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    wire(p);
  }
  function recommendation(p) {
    if (p.startMode === "placement") return t("welcome.recommendPlacement");
    if (p.startMode === "known") return t("welcome.recommendKnown", { level: p.startingLevel || "A1" });
    return t("welcome.recommendZero");
  }
  function advance(changes) {
    changes.onboardingStep = step + 1;
    LearningJourney.updateProfile(changes);
    render(true);
  }
  function wire(p) {
    var next = el().querySelector(".js-step-next");
    var back = el().querySelector(".js-step-back");
    if (back) back.addEventListener("click", function () {
      LearningJourney.updateProfile({ onboardingStep: Math.max(1, step - 1) });
      render(true);
    });
    if (step === 2) {
      el().querySelectorAll('[name="journey-start"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
          var mode = radio.value;
          LearningJourney.updateProfile({ startMode: mode, startingLevel: mode === "known" ? (p.startingLevel || "A1") : null });
          var group = el().querySelector(".journey-level");
          if (group) group.hidden = mode !== "known";
          next.disabled = false;
        });
      });
      var level = el().querySelector("#journeyLevel");
      if (level) level.addEventListener("change", function () { LearningJourney.updateProfile({ startingLevel: level.value }); });
    }
    if (next) next.addEventListener("click", function () {
      if (step === 1) advance({});
      else if (step === 2) {
        var mode = el().querySelector('[name="journey-start"]:checked');
        if (!mode) return;
        var selected = mode.value === "known" ? el().querySelector("#journeyLevel").value : null;
        advance({ startMode: mode.value, startingLevel: selected });
      } else if (step === 3) {
        var goal = el().querySelector('[name="journey-goal"]:checked');
        if (goal) advance({ goal: goal.value });
      } else if (step === 4) {
        var minutes = el().querySelector('[name="journey-minutes"]:checked');
        advance({ dailyMinutes: minutes ? Number(minutes.value) : 20 });
      }
    });
    el().querySelectorAll('[name="journey-goal"]').forEach(function (radio) {
      radio.addEventListener("change", function () { LearningJourney.updateProfile({ goal: radio.value }); });
    });
    el().querySelectorAll('[name="journey-minutes"]').forEach(function (radio) {
      radio.addEventListener("change", function () { LearningJourney.updateProfile({ dailyMinutes: Number(radio.value) }); });
    });
    var start = el().querySelector(".js-start-journey");
    if (start) start.addEventListener("click", function () { begin(p, false); });
    var direct = el().querySelector(".js-start-direct");
    if (direct) direct.addEventListener("click", function () { begin(p, true); });
    var sounds = el().querySelector(".js-sounds");
    if (sounds) sounds.addEventListener("click", function () { App.go("suoni"); });
  }
  function begin(p, skipSounds) {
    var mode = p.startMode || "zero";
    if (mode === "placement") {
      App.go("piazzamento", { go: "1", onboarding: "1" });
      return;
    }
    if (mode === "zero" && !skipSounds) {
      /* Reuse the existing A1 recordings before the first lesson. */
      App.go("suoni", { set: "ph-doppie", onboarding: "1" });
      return;
    }
    var code = mode === "known" ? (p.startingLevel || "A1") : "A1";
    var from = Math.max(0, Core.registry.levels.findIndex(function (level) { return level.code === code; }));
    Core.findNextLesson(function (next) {
      if (!next || (mode === "known" && Core.registry.levels.indexOf(next.level) < from)) {
        Core.toast(t("welcome.startLoadError"));
        return;
      }
      LearningJourney.markOnboarded();
      App.go("lezione", { id: next.lesson.id });
    }, from);
  }
  Views.benvenuto = function () { render(); };
})();
