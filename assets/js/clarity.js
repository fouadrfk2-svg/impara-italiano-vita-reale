/* Microsoft Clarity — minimal, cookieless installation for Vita Reale.
 * No consent UI is installed. Do not claim that consent has been obtained.
 * Microsoft enforces restricted analytics in the EEA without consent.
 * Only run on the public canonical domains, not local tests or preview URLs.
 */
(function () {
  "use strict";

  if (!/^(?:www\.)?vitare\.it$/i.test(window.location.hostname)) return;
  if (document.getElementById("vita-clarity-tag")) return;

  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };

  window.clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "denied"
  });

  var script = document.createElement("script");
  script.id = "vita-clarity-tag";
  script.async = true;
  script.src = "https://www.clarity.ms/tag/ynz53y5oh3";
  document.head.appendChild(script);
})();
