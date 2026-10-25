/* ============================================================
   views-grammar.js — grammar as a browsable encyclopaedia.

   A screen split out of views.js, which held eight screens at once. The
   pattern is the same one views-talk.js, views-train.js and views-today.js
   already use: the shell (set, pageHead, el, empty) comes from
   `Views.shell`, and the file adds a route of its own to `Views`.

   It loads AFTER views.js, because `Views.shell` is created at the end of
   that file.
   ============================================================ */
(function (global) {
  "use strict";

  var esc = Core.esc;
  var t = function (k, v) { return I18n.t(k, v); };
  var set = Views.shell.set;
  var pageHead = Views.shell.head;
  var el = Views.shell.root;
  /* ═══════════════════════════════════════════════════════════
     GRAMMAR (the encyclopaedia)
     ═══════════════════════════════════════════════════════════ */
  Views.grammatica = function (params) {
    var ref = global.GRAMMAR_REF || [];
    if (params && params.id) {
      var a = null;
      ref.forEach(function (sec) { (sec.items || []).forEach(function (it) { if (it.id === params.id) a = { sec: sec, it: it }; }); });
      if (a) {
        set('<button class="btn btn--ghost btn--sm js-back" style="margin-bottom:18px">' + t("gram.backToIndex") + "</button>" +
          pageHead(a.sec.title + " · " + a.it.cefr, a.it.title, a.it.sub || "", { kicker: "refsec:titles", title: "ref:" + a.it.id, intro: "ref:" + a.it.id }) +
          '<div class="card"><div class="prose"' + I18n.contentAttrs("ref:" + a.it.id) + '>' + a.it.body + "</div></div>");
        // Reference tables can overflow at mobile widths in either content language.
        // Match the existing lesson/conjugator keyboard-scroll contract.
        el().querySelectorAll(".prose .table-wrap").forEach(function (table) {
          table.setAttribute("tabindex", "0");
          table.setAttribute("role", "region");
          table.setAttribute("aria-label", a.it.title);
        });
        el().querySelector(".js-back").addEventListener("click", function () { App.go("grammatica"); });
        return;
      }
    }

    set(pageHead(t("gram.kicker"), t("gram.title"), t("gram.intro")) +
      ref.map(function (sec) {
        return '<section style="margin-bottom:30px"><h2 style="font-size:1.24rem;margin-bottom:12px"' + I18n.contentAttrs("refsec:titles") + '>' + esc(sec.title) + "</h2>" +
          '<div class="stack">' + (sec.items || []).map(function (it) {
            return '<button class="list-row" data-gram="' + esc(it.id) + '" style="text-align:left;cursor:pointer;width:100%">' +
              '<span class="chip chip--cefr">' + esc(it.cefr) + "</span>" +
              '<span class="list-row__main"><b' + I18n.contentAttrs("ref:" + it.id) + '>' + esc(it.title) + "</b><span" + I18n.contentAttrs("ref:" + it.id) + ">" + esc(it.sub || "") + "</span></span>" +
              "<span aria-hidden=\"true\">→</span></button>";
          }).join("") + "</div></section>";
      }).join(""));

    el().querySelectorAll("[data-gram]").forEach(function (b) {
      b.addEventListener("click", function () { App.go("grammatica", { id: b.getAttribute("data-gram") }); });
    });
  };
})(window);
