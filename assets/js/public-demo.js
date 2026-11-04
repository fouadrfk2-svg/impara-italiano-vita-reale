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
  function mount(root) {
    if (!root || root.dataset.demoMounted === "1") return;
    root.dataset.demoMounted = "1";
    var section = root.closest(".guest-demo"), start = section && section.querySelector("[data-demo-start]"), privacy = section && section.querySelector(".guest-demo__privacy");
    var lesson = null, active = 0, currentAudio = null, loading = false;
    function message(text, bad) {
      var status = root.querySelector("[data-demo-status]");
      if (!status) return;
      status.textContent = text || "";
      status.hidden = !text;
      status.setAttribute("role", bad ? "alert" : "status");
    }
    function setStartVisible(value) { if (start) start.hidden = !value; }
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
        if (!lesson || lesson.exerciseCount !== 3 || !Array.isArray(lesson.exercises) || lesson.exercises.length !== 3 || !Array.isArray(lesson.dialogue) || lesson.dialogue.length !== 5) throw Error("invalid_demo");
        active = 0;
        render();
      } catch (_) {
        root.replaceChildren(node("p", "guest-demo__status", copy.loadError, { role: "alert" }));
        setStartVisible(true);
        if (start) start.textContent = "أعد المحاولة";
        if (privacy) privacy.hidden = false;
      } finally { loading = false; }
    }
    function renderDialogue(target) {
      var head = node("div", "guest-demo__dialogue-head");
      head.append(node("h4", "", "حوار في المقهى"));
      var hint = node("p", "", copy.audioReady, { "data-audio-status": "" });
      head.append(hint);
      target.append(head);
      var list = node("ol", "guest-demo__dialogue");
      lesson.dialogue.forEach(function (line, i) {
        var row = node("li", "guest-demo__line");
        var text = node("div", "guest-demo__line-copy");
        text.append(node("span", "guest-demo__arabic", line.arabic, { lang: "ar", dir: "rtl" }));
        text.append(node("bdi", "guest-demo__italian", line.italian, { lang: "it", dir: "ltr" }));
        var play = node("button", "guest-demo__audio", "استمع", { type: "button", "aria-label": "استمع إلى الجملة " + (i + 1) + " بالإيطالية", "data-demo-audio": String(i) });
        play.addEventListener("click", async function () {
          var audioStatus = target.querySelector("[data-audio-status]");
          if (currentAudio) { currentAudio.pause(); currentAudio = null; }
          if (audioStatus) { audioStatus.textContent = copy.audioPlaying; audioStatus.setAttribute("role", "status"); }
          try {
            currentAudio = new global.Audio(line.audio);
            currentAudio.onended = function () { if (audioStatus) audioStatus.textContent = copy.audioReady; currentAudio = null; };
            currentAudio.onerror = function () { if (audioStatus) { audioStatus.textContent = copy.audioError; audioStatus.setAttribute("role", "alert"); } currentAudio = null; };
            await currentAudio.play();
          } catch (_) {
            currentAudio = null;
            if (audioStatus) { audioStatus.textContent = copy.audioError; audioStatus.setAttribute("role", "alert"); }
          }
        });
        row.append(text, play);
        list.append(row);
      });
      target.append(list);
    }
    function renderProgress(target) {
      var wrap = node("div", "guest-demo__progress-wrap");
      var label = node("span", "guest-demo__progress-label", "التمرين " + Math.min(active + 1, 3) + " من 3", { "data-demo-step": "" });
      var progress = node("progress", "guest-demo__progress", null, { max: "3", value: String(active), "aria-label": "تقدّم التجربة المجانية" });
      wrap.append(label, progress);
      target.append(wrap);
    }
    function render() {
      if (!lesson) return;
      root.replaceChildren();
      var card = node("article", "guest-demo__lesson", null, { "aria-labelledby": "guest-demo-lesson-title" });
      var top = node("header", "guest-demo__lesson-head");
      top.append(node("p", "guest-demo__lesson-kicker", lesson.subtitle, { lang: "it", dir: "ltr" }));
      top.append(node("h3", "", lesson.title, { id: "guest-demo-lesson-title" }));
      top.append(node("p", "guest-demo__explanation", lesson.explanation, { lang: "ar", dir: "rtl" }));
      card.append(top);
      renderDialogue(card);
      renderProgress(card);
      if (active < lesson.exerciseCount) renderExercise(card, lesson.exercises[active]);
      else renderCompletion(card);
      card.append(node("p", "guest-demo__status", "", { "data-demo-status": "", hidden: "" }));
      root.append(card);
      var retryAudio = root.querySelectorAll("[data-demo-audio]");
      retryAudio.forEach(function (button) { button.addEventListener("keydown", function (event) { if (event.key === "Escape" && currentAudio) { currentAudio.pause(); currentAudio = null; } }); });
    }
    function answer(payload, exercise, onCorrect) {
      var buttons = root.querySelectorAll("button");
      buttons.forEach(function (button) { if (!button.matches("[data-demo-audio]")) button.disabled = true; });
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
        if (status) { status.textContent = "تعذّر التحقّق من الإجابة. حاول مجددًا."; status.hidden = false; status.setAttribute("role", "alert"); }
        root.querySelectorAll("button").forEach(function (button) { button.disabled = false; });
      });
    }
    function continueNext() { active += 1; render(); var heading = root.querySelector("[data-demo-step]"); if (heading) heading.focus(); }
    function renderExercise(card, exercise) {
      var panel = node("section", "guest-demo__exercise", null, { "aria-labelledby": "guest-demo-question" });
      panel.append(node("p", "guest-demo__exercise-label", "جرّب بنفسك"));
      panel.append(node("h4", "", exercise.prompt, { id: "guest-demo-question" }));
      if (exercise.type === "choice") {
        var choices = node("div", "guest-demo__choices", null, { role: "group", "aria-labelledby": "guest-demo-question" });
        exercise.options.forEach(function (option) {
          var button = node("button", "guest-demo__choice", null, { type: "button" });
          button.append(node("bdi", "", option.text, { lang: option.lang, dir: option.lang === "it" ? "ltr" : "rtl" }));
          button.addEventListener("click", function () { answer(option.id, exercise, continueNext); });
          choices.append(button);
        });
        panel.append(choices);
      } else {
        var selected = [], selectedBox = node("div", "guest-demo__selected", null, { "aria-label": "الكلمات المختارة بالترتيب" });
        var bank = node("div", "guest-demo__tokens", null, { role: "group", "aria-labelledby": "guest-demo-question" });
        function refreshTokens() {
          selectedBox.replaceChildren();
          selected.forEach(function (id, index) {
            var token = exercise.tokens.find(function (item) { return item.id === id; });
            var remove = node("button", "guest-demo__token guest-demo__token--selected", token.text, { type: "button", lang: "it", dir: "ltr", "aria-label": "إزالة " + token.text + " من الترتيب", "data-token-id": token.id });
            remove.addEventListener("click", function () { selected.splice(index, 1); refreshTokens(); });
            selectedBox.append(remove);
          });
          bank.replaceChildren();
          exercise.tokens.forEach(function (token) {
            if (selected.includes(token.id)) return;
            var pick = node("button", "guest-demo__token", token.text, { type: "button", lang: "it", dir: "ltr", "data-token-id": token.id });
            pick.addEventListener("click", function () { selected.push(token.id); refreshTokens(); });
            bank.append(pick);
          });
          check.disabled = selected.length !== exercise.tokens.length;
        }
        var actions = node("div", "guest-demo__token-actions");
        var check = node("button", "btn btn--primary", copy.check, { type: "button", disabled: "" });
        var clear = node("button", "btn btn--ghost", "أعد الترتيب", { type: "button" });
        check.addEventListener("click", function () { answer(selected.slice(), exercise, continueNext); });
        clear.addEventListener("click", function () { selected = []; message("", false); refreshTokens(); });
        actions.append(check, clear);
        refreshTokens();
        panel.append(selectedBox, bank, actions);
      }
      card.append(panel);
    }
    function renderCompletion(card) {
      var completion = node("section", "guest-demo__complete", null, { "aria-labelledby": "guest-demo-complete-title" });
      completion.append(node("span", "guest-demo__complete-mark", "✓", { "aria-hidden": "true" }));
      completion.append(node("h3", "", copy.completed, { id: "guest-demo-complete-title" }));
      completion.append(node("p", "", "هذه خطوة صغيرة من طريقك. يمنحك اشتراك Vita Reale وصولًا إلى المسار التعليمي الكامل والدروس والتدريب، مع حفظ تقدّمك في حسابك."));
      var actions = node("div", "guest-demo-actions");
      var subscribe = node("a", "btn btn--primary guest-subscribe", null, { href: "#/billing" });
      subscribe.append(document.createTextNode("كمّل تعلّمك بـ"));
      subscribe.append(node("bdi", "", "9.99€", { dir: "ltr" }));
      subscribe.append(document.createTextNode(" شهرياً"));
      actions.append(subscribe);
      var repeat = node("button", "btn btn--ghost guest-demo__repeat", "ابدأ التجربة مرة أخرى", { type: "button" });
      repeat.addEventListener("click", function () { lesson = null; active = 0; setStartVisible(true); if (privacy) privacy.hidden = false; root.innerHTML = ""; begin(); });
      actions.append(repeat);
      completion.append(actions);
      card.append(completion);
      setStartVisible(false);
    }
    if (start) start.addEventListener("click", begin);
  }
  global.PublicDemo = Object.freeze({ mount: mount });
})(window);