(function (global) {
  "use strict";

  var API = "/api/demo";
  var copy = {
    loading: "جارٍ تحميل التجربة…",
    loadError: "تعذّر تحميل الدرس الآن. تحقّق من اتصالك وحاول مجددًا.",
    audioError: "تعذّر تشغيل الصوت الآن. يمكنك متابعة الحوار والتمرين.",
    audioPlaying: "جارٍ تشغيل التسجيل…",
    audioReady: "يمكنك الاستماع إلى أي جملة في الحوار.",
    retry: "حاول مرة أخرى",
    check: "تحقّق من الإجابة",
    next: "تابع إلى التمرين التالي",
    completed: "كمّلت التجربة المجانية! 🎉"
  };

  function node(tag, className, text, attrs) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
  }

  function request(path, method, body) {
    return global.fetch(path, {
      method: method,
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body)
    }).then(async function (response) {
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw Error(data.error || "unavailable");
      return data;
    });
  }

  function mountHeroPreview(root, onStart) {
    if (!root || root.dataset.heroPreviewMounted === "1") return;
    root.dataset.heroPreviewMounted = "1";

    var figure = root.closest(".guest-hero-product");
    var title = figure && figure.querySelector("[data-hero-preview-title]");
    var lesson = null, selected = null, loading = false, currentAudio = null;

    function setAudioStatus(text, bad) {
      var status = root.querySelector("[data-hero-audio-status]");
      if (!status) return;
      status.textContent = text;
      status.setAttribute("role", bad ? "alert" : "status");
    }

    function stopAudio() {
      if (!currentAudio) return;
      currentAudio.pause();
      currentAudio = null;
      root.querySelectorAll("[data-hero-preview-audio]").forEach(function (button) {
        button.setAttribute("aria-pressed", "false");
      });
    }

    function renderError() {
      if (!root.isConnected) return;
      root.setAttribute("aria-busy", "false");
      root.replaceChildren();
      var message = node("p", "guest-hero-preview__status", copy.loadError, { role: "alert" });
      var retry = node("button", "btn btn--ghost guest-hero-preview__load-retry", copy.retry, { type: "button" });
      retry.addEventListener("click", load);
      root.append(message, retry);
    }

    function appendMixedPrompt(target, prompt) {
      var phrase = "Dica pure";
      var phraseAt = prompt.indexOf(phrase);
      if (phraseAt < 0) {
        target.textContent = prompt;
        return;
      }
      target.append(document.createTextNode(prompt.slice(0, phraseAt)));
      target.append(node("bdi", "", phrase, { lang: "it", dir: "ltr" }));
      target.append(document.createTextNode(prompt.slice(phraseAt + phrase.length)));
    }

    function render() {
      if (!root.isConnected || !lesson) return;
      stopAudio();
      root.setAttribute("aria-busy", "false");
      if (title) title.textContent = lesson.subtitle;
      root.replaceChildren();

      var preview = node("div", "guest-hero-preview");
      var dialogue = node("ol", "guest-hero-preview__dialogue", null, { "aria-label": "مقتطف من الحوار" });
      lesson.dialogue.slice(0, 2).forEach(function (line, index) {
        var row = node("li", "guest-hero-preview__line" + (index === 0 ? " guest-hero-preview__line--barista" : " guest-hero-preview__line--customer"));
        var speaker = node("span", "guest-hero-preview__speaker", index === 0 ? "الباريستا" : "الزبون");
        var words = node("div", "guest-hero-preview__line-copy");
        words.append(node("bdi", "guest-hero-preview__italian", line.italian, { lang: "it", dir: "ltr" }));
        words.append(node("span", "guest-hero-preview__arabic", line.arabic, { lang: "ar", dir: "rtl" }));

        var play = node("button", "guest-hero-preview__audio", null, {
          type: "button",
          "aria-label": "استمع إلى الجملة " + (index + 1) + " بالإيطالية",
          "aria-pressed": "false",
          "data-hero-preview-audio": String(index)
        });
        var icon = node("img", "guest-hero-preview__audio-icon", null, {
          src: "assets/icons/phosphor/regular/speaker-high.svg",
          alt: "",
          "aria-hidden": "true",
          width: "20",
          height: "20"
        });
        play.append(icon, node("span", "visually-hidden", "استمع"));
        play.addEventListener("click", async function () {
          stopAudio();
          play.setAttribute("aria-pressed", "true");
          setAudioStatus(copy.audioPlaying, false);
          try {
            currentAudio = new global.Audio(line.audio);
            currentAudio.onended = function () {
              play.setAttribute("aria-pressed", "false");
              currentAudio = null;
              setAudioStatus(copy.audioReady, false);
            };
            currentAudio.onerror = function () {
              play.setAttribute("aria-pressed", "false");
              currentAudio = null;
              setAudioStatus(copy.audioError, true);
            };
            await currentAudio.play();
          } catch (_) {
            play.setAttribute("aria-pressed", "false");
            currentAudio = null;
            setAudioStatus(copy.audioError, true);
          }
        });
        row.append(speaker, words, play);
        dialogue.append(row);
      });
      preview.append(dialogue);
      preview.append(node("p", "guest-hero-preview__audio-status", copy.audioReady, { "data-hero-audio-status": "", role: "status" }));

      var exercise = lesson.exercises[0];
      var section = node("section", "guest-hero-preview__exercise", null, { "aria-labelledby": "guest-hero-preview-question" });
      section.append(node("p", "guest-hero-preview__exercise-label", "جرّب بنفسك"));
      var form = node("form", "guest-hero-preview__form");
      var fieldset = node("fieldset", "guest-hero-preview__fieldset");
      var prompt = node("legend", "guest-hero-preview__prompt", null, { id: "guest-hero-preview-question", lang: "ar", dir: "rtl" });
      appendMixedPrompt(prompt, exercise.prompt);
      fieldset.append(prompt);

      var options = node("div", "guest-hero-preview__options");
      exercise.options.forEach(function (option, index) {
        var label = node("label", "guest-hero-preview__option");
        var radio = node("input", "", null, {
          type: "radio",
          name: "hero-preview-answer",
          value: option.id,
          "data-hero-preview-choice": String(index)
        });
        var value = node("bdi", "guest-hero-preview__option-copy", option.text, {
          lang: option.lang,
          dir: option.lang === "it" ? "ltr" : "rtl"
        });
        radio.addEventListener("change", function () {
          selected = option.id;
          options.querySelectorAll(".guest-hero-preview__option").forEach(function (item) { item.classList.remove("is-selected"); });
          label.classList.add("is-selected");
          submit.disabled = false;
        });
        label.append(radio, value);
        options.append(label);
      });
      fieldset.append(options);

      var feedback = node("p", "guest-hero-preview__feedback", "", { "data-hero-preview-feedback": "", dir: "auto", hidden: "" });
      var actions = node("div", "guest-hero-preview__actions");
      var submit = node("button", "btn btn--primary guest-hero-preview__submit", copy.check, { type: "submit", disabled: "" });
      actions.append(submit);
      form.append(fieldset, feedback, actions);
      section.append(form);
      preview.append(section);
      root.append(preview);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!selected || loading) return;
        loading = true;
        root.setAttribute("aria-busy", "true");
        fieldset.disabled = true;
        submit.disabled = true;
        feedback.classList.remove("is-correct", "is-incorrect");
        feedback.hidden = true;
        request(API, "POST", { exerciseId: exercise.id, answer: selected }).then(function (result) {
          if (!root.isConnected) return;
          loading = false;
          root.setAttribute("aria-busy", "false");
          feedback.textContent = result.feedback;
          feedback.hidden = false;
          feedback.classList.add(result.correct ? "is-correct" : "is-incorrect");
          feedback.setAttribute("role", result.correct ? "status" : "alert");
          submit.hidden = true;

          if (result.correct) {
            var start = node("button", "btn btn--primary guest-hero-preview__start", "ابدأ التجربة المجانية", { type: "button" });
            start.addEventListener("click", function () {
              if (typeof onStart === "function") onStart();
            });
            actions.append(start);
          } else {
            var retry = node("button", "btn btn--ghost guest-hero-preview__retry", copy.retry, { type: "button" });
            retry.addEventListener("click", render);
            actions.append(retry);
          }
        }).catch(function () {
          if (!root.isConnected) return;
          loading = false;
          root.setAttribute("aria-busy", "false");
          fieldset.disabled = false;
          submit.disabled = !selected;
          submit.hidden = false;
          feedback.textContent = "تعذّر التحقّق من الإجابة. حاول مجددًا.";
          feedback.hidden = false;
          feedback.classList.add("is-incorrect");
          feedback.setAttribute("role", "alert");
        });
      });
    }

    function load() {
      if (loading) return;
      loading = true;
      root.setAttribute("aria-busy", "true");
      root.replaceChildren(node("p", "guest-hero-preview__status", "جارٍ تحميل معاينة الدرس…", { role: "status" }));
      request(API, "GET").then(function (data) {
        var first = data && Array.isArray(data.exercises) && data.exercises[0];
        var valid = data && data.exerciseCount === 3 && Array.isArray(data.dialogue) && data.dialogue.length === 5 && first && first.type === "choice" && Array.isArray(first.options) && first.options.length === 3;
        if (!valid) throw Error("invalid_demo_preview");
        lesson = data;
        loading = false;
        render();
      }).catch(function () {
        loading = false;
        renderError();
      });
    }

    load();
  }

  function mount(root) {
    if (!root || root.dataset.demoMounted === "1") return;
    root.dataset.demoMounted = "1";

    var section = root.closest(".guest-demo");
    var start = section && section.querySelector("[data-demo-start]");
    var privacy = section && section.querySelector(".guest-demo__privacy");
    var lesson = null, active = 0, currentAudio = null, loading = false;

    function message(text, bad) {
      var status = root.querySelector("[data-demo-status]");
      if (!status) return;
      status.textContent = text || "";
      status.hidden = !text;
      status.setAttribute("role", bad ? "alert" : "status");
    }

    function setStartVisible(value) {
      if (start) start.hidden = !value;
    }

    function renderLoading() {
      root.replaceChildren(node("p", "guest-demo__status", copy.loading, { role: "status" }));
    }

    async function begin() {
      if (loading) return;
      loading = true;
      setStartVisible(false);
      if (privacy) privacy.hidden = true;
      renderLoading();

      try {
        lesson = await request(API, "GET");
        if (!lesson || lesson.exerciseCount !== 3 || !Array.isArray(lesson.exercises) || lesson.exercises.length !== 3 || !Array.isArray(lesson.dialogue) || lesson.dialogue.length !== 5) {
          throw Error("invalid_demo");
        }
        active = 0;
        render();
      } catch (_) {
        root.replaceChildren(node("p", "guest-demo__status", copy.loadError, { role: "alert" }));
        setStartVisible(true);
        if (start) start.textContent = "أعد المحاولة";
        if (privacy) privacy.hidden = false;
      } finally {
        loading = false;
      }
    }

    function stopAudio() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
    }

    function renderLessonHero(card) {
      var hero = node("header", "guest-demo__lesson-hero");
      var art = node("img", "guest-demo__lesson-art", null, {
        src: "assets/marketing/vita-italia.svg",
        alt: "مشهد تعليمي في مقهى إيطالي",
        width: "720",
        height: "780",
        loading: "lazy",
        decoding: "async"
      });
      var copyBlock = node("div", "guest-demo__lesson-heading");
      copyBlock.append(node("bdi", "guest-demo__level", "A1", { dir: "ltr", lang: "it" }));
      copyBlock.append(node("p", "guest-demo__lesson-kicker", lesson.subtitle, { lang: "it", dir: "ltr" }));
      copyBlock.append(node("h3", "guest-demo__lesson-title", lesson.title, { id: "guest-demo-lesson-title" }));
      hero.append(art, copyBlock);
      card.append(hero);
    }

    function renderDialogue(target) {
      var panel = node("section", "guest-demo__conversation", null, { "aria-labelledby": "guest-demo-dialogue-title" });
      var head = node("div", "guest-demo__dialogue-head");
      head.append(node("h4", "", "حوار في المقهى", { id: "guest-demo-dialogue-title" }));
      head.append(node("p", "", copy.audioReady, { "data-audio-status": "", role: "status" }));
      panel.append(head);

      var list = node("ol", "guest-demo__dialogue");
      lesson.dialogue.forEach(function (line, i) {
        var row = node("li", "guest-demo__line" + (i % 2 === 0 ? " guest-demo__line--barista" : " guest-demo__line--customer"));
        var speaker = node("span", "guest-demo__speaker", i % 2 === 0 ? "الباريستا" : "الزبون");
        var text = node("div", "guest-demo__line-copy");
        text.append(node("bdi", "guest-demo__italian", line.italian, { lang: "it", dir: "ltr" }));
        text.append(node("span", "guest-demo__arabic", line.arabic, { lang: "ar", dir: "rtl" }));
        var play = node("button", "guest-demo__audio", null, {
          type: "button",
          "aria-label": "استمع إلى الجملة " + (i + 1) + " بالإيطالية",
          "data-demo-audio": String(i)
        });
        var icon = node("img", "guest-demo__audio-icon", null, {
          src: "assets/icons/phosphor/regular/speaker-high.svg",
          alt: "",
          "aria-hidden": "true",
          width: "20",
          height: "20"
        });
        play.append(icon, node("span", "visually-hidden", "استمع"));
        play.addEventListener("click", async function () {
          var audioStatus = panel.querySelector("[data-audio-status]");
          stopAudio();
          if (audioStatus) {
            audioStatus.textContent = copy.audioPlaying;
            audioStatus.setAttribute("role", "status");
          }
          try {
            currentAudio = new global.Audio(line.audio);
            currentAudio.onended = function () {
              if (audioStatus) audioStatus.textContent = copy.audioReady;
              currentAudio = null;
            };
            currentAudio.onerror = function () {
              if (audioStatus) {
                audioStatus.textContent = copy.audioError;
                audioStatus.setAttribute("role", "alert");
              }
              currentAudio = null;
            };
            await currentAudio.play();
          } catch (_) {
            currentAudio = null;
            if (audioStatus) {
              audioStatus.textContent = copy.audioError;
              audioStatus.setAttribute("role", "alert");
            }
          }
        });
        row.append(speaker, text, play);
        list.append(row);
      });
      panel.append(list);
      target.append(panel);
    }

    function renderQuickExplanation(target) {
      var panel = node("aside", "guest-demo__notes", null, { "aria-labelledby": "guest-demo-notes-title" });
      panel.append(node("h4", "", "شرح سريع", { id: "guest-demo-notes-title" }));
      panel.append(node("p", "", lesson.explanation, { lang: "ar", dir: "rtl" }));
      target.append(panel);
    }

    function renderProgress(target, completed) {
      var wrap = node("div", "guest-demo__progress-wrap");
      var label = node("span", "guest-demo__progress-label", "التمرين " + Math.min(completed + 1, 3) + " من 3", { "data-demo-step": "", tabindex: "-1" });
      var segments = node("div", "guest-demo__progress-steps", null, { "aria-hidden": "true" });
      for (var i = 0; i < 3; i += 1) {
        var state = i < completed ? "is-complete" : i === completed ? "is-current" : "";
        segments.append(node("span", "guest-demo__progress-segment" + (state ? " " + state : "")));
      }
      var progress = node("progress", "guest-demo__progress visually-hidden", null, {
        max: "3",
        value: String(Math.min(completed, 3)),
        "aria-label": "تقدّم التجربة المجانية"
      });
      wrap.append(label, segments, progress);
      target.append(wrap);
    }

    function renderStepper(target) {
      var nav = node("nav", "guest-demo__stepper", null, { "aria-label": "خطوات التمرين" });
      var list = node("ol", "");
      lesson.exercises.forEach(function (_, i) {
        var item = node("li", "guest-demo__step" + (i === active ? " is-current" : i < active ? " is-complete" : ""));
        if (i === active) item.setAttribute("aria-current", "step");
        item.append(node("span", "guest-demo__step-number", String(i + 1), { "aria-hidden": "true" }));
        item.append(node("span", "", "التمرين " + (i + 1)));
        list.append(item);
      });
      nav.append(list);
      target.append(nav);
    }

    function render() {
      if (!lesson) return;
      stopAudio();
      root.replaceChildren();

      var card = node("article", "guest-demo__lesson", null, { "aria-labelledby": "guest-demo-lesson-title" });
      renderLessonHero(card);

      if (active >= lesson.exerciseCount) {
        renderCompletion(card);
        root.append(card);
        setStartVisible(false);
        return;
      }

      var learning = node("div", "guest-demo__learning-grid");
      renderDialogue(learning);
      renderQuickExplanation(learning);
      card.append(learning);

      var practice = node("div", "guest-demo__practice-layout");
      renderStepper(practice);
      var work = node("div", "guest-demo__practice-main");
      renderProgress(work, active);
      renderExercise(work, lesson.exercises[active]);
      work.append(node("p", "guest-demo__status", "", { "data-demo-status": "", hidden: "" }));
      practice.append(work);
      card.append(practice);
      root.append(card);
    }

    function answer(payload, exercise, onCorrect) {
      var buttons = root.querySelectorAll("button");
      buttons.forEach(function (button) {
        if (!button.matches("[data-demo-audio]")) button.disabled = true;
      });
      request(API, "POST", { exerciseId: exercise.id, answer: payload }).then(function (result) {
        var status = root.querySelector("[data-demo-status]");
        if (!status) return;
        status.textContent = result.feedback;
        status.hidden = false;
        status.className = "guest-demo__status " + (result.correct ? "is-correct" : "is-incorrect");
        status.setAttribute("role", result.correct ? "status" : "alert");
        if (result.correct) {
          var next = node("button", "btn btn--primary guest-demo__next", active === 2 ? "أكمل التجربة" : copy.next, { type: "button" });
          next.addEventListener("click", onCorrect);
          status.insertAdjacentElement("afterend", next);
        } else {
          var retry = node("button", "btn btn--ghost guest-demo__retry", copy.retry, { type: "button" });
          retry.addEventListener("click", function () { render(); });
          status.insertAdjacentElement("afterend", retry);
        }
      }).catch(function () {
        var status = root.querySelector("[data-demo-status]");
        if (status) {
          status.textContent = "تعذّر التحقّق من الإجابة. حاول مجددًا.";
          status.hidden = false;
          status.setAttribute("role", "alert");
        }
        root.querySelectorAll("button").forEach(function (button) { button.disabled = false; });
      });
    }

    function continueNext() {
      active += 1;
      render();
      if (active < lesson.exerciseCount) {
        var heading = root.querySelector(".guest-demo__exercise-title");
        if (heading) heading.focus();
      }
    }

    function renderExercise(target, exercise) {
      var panel = node("section", "guest-demo__exercise", null, { "aria-labelledby": "guest-demo-question" });
      panel.append(node("p", "guest-demo__exercise-label", "جرّب بنفسك"));
      panel.append(node("h4", "guest-demo__exercise-title", exercise.prompt, { id: "guest-demo-question", tabindex: "-1" }));

      if (exercise.type === "choice") {
        var choices = node("div", "guest-demo__choices", null, { role: "group", "aria-labelledby": "guest-demo-question" });
        exercise.options.forEach(function (option) {
          var button = node("button", "guest-demo__choice", null, { type: "button", "aria-pressed": "false" });
          button.append(node("bdi", "", option.text, { lang: option.lang, dir: option.lang === "it" ? "ltr" : "rtl" }));
          button.addEventListener("click", function () {
            button.setAttribute("aria-pressed", "true");
            answer(option.id, exercise, continueNext);
          });
          choices.append(button);
        });
        panel.append(choices);
      } else {
        var selected = [];
        var selectedBox = node("div", "guest-demo__selected", null, { "aria-label": "الكلمات المختارة بالترتيب" });
        var bank = node("div", "guest-demo__tokens", null, { role: "group", "aria-labelledby": "guest-demo-question" });
        var check;

        function refreshTokens() {
          selectedBox.replaceChildren();
          selected.forEach(function (id, index) {
            var token = exercise.tokens.find(function (item) { return item.id === id; });
            var remove = node("button", "guest-demo__token guest-demo__token--selected", token.text, {
              type: "button",
              lang: "it",
              dir: "ltr",
              "aria-label": "إزالة " + token.text + " من الترتيب",
              "data-token-id": token.id
            });
            remove.addEventListener("click", function () {
              selected.splice(index, 1);
              refreshTokens();
            });
            selectedBox.append(remove);
          });
          bank.replaceChildren();
          exercise.tokens.forEach(function (token) {
            if (selected.includes(token.id)) return;
            var pick = node("button", "guest-demo__token", token.text, {
              type: "button",
              lang: "it",
              dir: "ltr",
              "data-token-id": token.id
            });
            pick.addEventListener("click", function () {
              selected.push(token.id);
              refreshTokens();
            });
            bank.append(pick);
          });
          check.disabled = selected.length !== exercise.tokens.length;
        }

        var actions = node("div", "guest-demo__token-actions");
        check = node("button", "btn btn--primary", copy.check, { type: "button", disabled: "" });
        var clear = node("button", "btn btn--ghost", "أعد الترتيب", { type: "button" });
        check.addEventListener("click", function () { answer(selected.slice(), exercise, continueNext); });
        clear.addEventListener("click", function () {
          selected = [];
          message("", false);
          refreshTokens();
        });
        actions.append(check, clear);
        refreshTokens();
        panel.append(selectedBox, bank, actions);
      }
      target.append(panel);
    }

    function renderCompletion(card) {
      card.classList.add("guest-demo__lesson--complete");
      card.removeAttribute("aria-labelledby");
      var completion = node("section", "guest-demo__complete", null, { "aria-labelledby": "guest-demo-complete-title" });
      var visual = node("img", "guest-demo__complete-visual", null, {
        src: "assets/marketing/vita-italia.svg",
        alt: "",
        "aria-hidden": "true",
        width: "720",
        height: "780",
        loading: "lazy",
        decoding: "async"
      });
      var content = node("div", "guest-demo__complete-content");
      renderProgress(content, 3);
      content.append(node("span", "guest-demo__complete-mark", "✓", { "aria-hidden": "true" }));
      content.append(node("h3", "", copy.completed, { id: "guest-demo-complete-title" }));
      content.append(node("p", "", "هذه خطوة صغيرة من طريقك. يمنحك اشتراك Vita Reale وصولًا إلى المسار التعليمي الكامل والدروس والتدريب، مع حفظ تقدّمك في حسابك."));
      var actions = node("div", "guest-demo-actions");
      var subscribe = node("a", "btn btn--primary guest-subscribe", null, { href: "#/billing" });
      subscribe.append(document.createTextNode("كمّل تعلّمك بـ"));
      subscribe.append(node("bdi", "", "9.99€", { dir: "ltr" }));
      subscribe.append(document.createTextNode(" شهرياً"));
      var repeat = node("button", "btn btn--ghost guest-demo__repeat", "ابدأ التجربة مرة أخرى", { type: "button" });
      repeat.addEventListener("click", function () {
        lesson = null;
        active = 0;
        setStartVisible(true);
        if (privacy) privacy.hidden = false;
        root.replaceChildren();
        begin();
      });
      actions.append(subscribe, repeat);
      content.append(actions);
      completion.append(visual, content);
      card.append(completion);
    }

    if (start) start.addEventListener("click", begin);
  }

  global.PublicDemo = Object.freeze({ mount: mount, mountHeroPreview: mountHeroPreview });
})(window);
