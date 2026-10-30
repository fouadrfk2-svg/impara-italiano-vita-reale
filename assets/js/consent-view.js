/* ============================================================
   consent-view.js — the shared speech-recognition consent dialog.

   The gate lives in consent.js; this small view feature supplies its DOM
   prompt to routes that can start speech recognition. It is separate from
   the shadowing recorder so a speaking exercise does not load unrelated
   recording controls just to ask for consent.
   ============================================================ */
(function (global) {
  "use strict";

  var t = function (key) { return global.I18n.t(key); };

  function askForSpeechConsent(decision) {
    var previous = global.document.getElementById("sttConsent");
    if (previous) previous.remove();

    var box = global.document.createElement("div");
    box.id = "sttConsent";
    box.className = "stt-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "sttConsentTitle");
    box.innerHTML =
      '<div class="stt-consent__box">' +
      '<h2 id="sttConsentTitle"></h2><p class="js-body"></p><p class="js-later"></p>' +
      '<div class="stt-consent__row">' +
      '<button class="btn btn--primary js-yes"></button>' +
      '<button class="btn btn--ghost js-no"></button></div></div>';
    global.document.body.appendChild(box);

    box.querySelector("h2").textContent = t("stt.consentTitle");
    box.querySelector(".js-body").textContent = t("stt.consentBody");
    box.querySelector(".js-later").textContent = t("stt.consentLater");
    var yes = box.querySelector(".js-yes");
    var no = box.querySelector(".js-no");
    yes.textContent = t("stt.consentYes");
    no.textContent = t("stt.consentNo");

    var returnFocus = global.document.activeElement;
    function close(answer) {
      box.remove();
      if (returnFocus && returnFocus.focus) returnFocus.focus();
      decision(answer);
    }
    yes.addEventListener("click", function () { close(true); });
    no.addEventListener("click", function () { close(false); });
    box.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.stopPropagation(); close(false); }
      if (event.key !== "Tab") return;
      var focusable = [yes, no];
      var index = focusable.indexOf(global.document.activeElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
    });
    yes.focus();
  }

  if (global.Consent) global.Consent.uzyjPytania(askForSpeechConsent);
})(window);
