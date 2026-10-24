const { test, expect } = require("@playwright/test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
let arabicUI;
vm.runInNewContext(readFileSync(path.join(__dirname, "../../data/i18n/ui-ar.js"), "utf8"), { LINGUAI: { addUI(_lang, data) { arabicUI = data; } } });
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const id = "a1-u01-l1";
const active = ".exq:not([hidden])";

async function ready(page) {
  await page.waitForFunction(() => window.Core && window.Core.registry.loaded.A1 === true && document.querySelector(".exq"));
  await page.evaluate(() => { window.Core.state.settings.autoplay = false; window.Core.save(); });
}
async function language(page, code) {
  if (await page.locator("#railToggle").isVisible() && !await page.locator("#rail").evaluate(el => el.classList.contains("is-open"))) await page.locator("#railToggle").click();
  await page.locator("#langToggle").click();
  await page.locator('#langList [data-lang="' + code + '"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", code === "en" ? "en-US" : code);
  await expect(page.locator("#main")).toHaveAttribute("data-lesson-language", code);
}
async function audit(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const problems = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
  expect(problems).toEqual([]);
}
async function shot(page, info, name) {
  const target = process.env.ARABIC_QA_DIR ? path.join(process.env.ARABIC_QA_DIR, name) : info.outputPath(name);
  await page.screenshot({ path: target, fullPage: true });
  await info.attach(name, { path: target, contentType: "image/png" });
}

for (const width of [1440, 390]) {
  test.describe("Complete Arabic first lesson at " + width + "px", () => {
    test.use({ viewport: { width, height: 920 }, locale: "ar-MA" });
    test.beforeEach(async ({ page }, info) => {
      await page.addInitScript(AXE);
      if (!info.title.includes("microphone consent")) await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
    });

    test("full translation, language cycle, fallback, RTL/LTR and unchanged Italian audio", async ({ page }, info) => {
      const errors = [], failed = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("response", r => { if (r.status() >= 400) failed.push(r.url()); });
      await page.goto("/index.html#/lezione?id=" + id); await ready(page);
      await expect(page.locator("#main")).toHaveAttribute("data-lesson-language", "ar");
      await expect(page.locator(".view-head > p")).toHaveText("التحية وطلبك الأول في المقهى");
      await expect(page.locator("#step-theory .prose")).toContainText("اختر التحية بحسب وقت اليوم");
      await expect(page.locator(".gt th").last()).toHaveText("المعنى بالعربية");
      await expect(page.locator(".vocab-card__pl")).toHaveCount(14);
      await expect(page.locator(".dlg__pl")).toHaveCount(5);
      for (const selector of [".prose", ".vocab-card__pl", ".dlg__pl", ".gram-box__note", ".exq__prompt"]) {
        expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
        expect(await page.locator(selector).first().getAttribute("lang")).toBe("ar");
      }
      for (const selector of [".dlg__it", ".vocab-card__it", ".opts", ".tok-bank", ".conj-grid", 'input[type="text"]']) {
        expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).direction)).toBe("ltr");
      }
      const snapshot = () => page.evaluate(() => JSON.stringify(window.Core.getLesson("a1-u01-l1").lesson));
      const ar = await snapshot();
      await audit(page); await shot(page, info, "arabic-complete-" + width + ".png");
      const audio = page.locator(".vocab-card [data-say]").first();
      await expect(audio).toHaveAttribute("data-say", "buongiorno");
      const response = page.waitForResponse(r => /\/audio\/.*\.mp3$/.test(r.url()));
      await audio.click(); expect((await response).status()).toBe(200);
      await language(page, "en");
      await expect(page.locator(".view-head > p")).toHaveText("Greetings and your first order");
      await expect(page.locator(".vocab-card__pl").first()).toContainText("good morning");
      const en = await snapshot(); expect(en).not.toBe(ar);
      await language(page, "ar"); expect(await snapshot()).toBe(ar);
      await language(page, "en"); expect(await snapshot()).toBe(en);
      await language(page, "ar"); expect(await snapshot()).toBe(ar);
      // The next lesson remains the exact complete English fallback.
      await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('B2',resolve)));
      const englishNeighbor = await page.evaluate(() => window.Core.getLesson("b2-u01-l1").lesson.title);
      await page.evaluate(() => window.App.go("lezione", { id: "b2-u01-l1" }));
      await expect(page.locator("#main")).toHaveAttribute("data-lesson-language", "en");
      await expect(page.locator(".view-head > p")).toHaveText(englishNeighbor);
      expect(await page.locator(".prose").first().evaluate(el => getComputedStyle(el).direction)).toBe("ltr");
      await page.evaluate(() => window.App.go("percorso"));
      await expect(page.locator("#main")).not.toHaveAttribute("data-lesson-language");
      expect(errors).toEqual([]); expect(failed).toEqual([]);
    });

    test("Arabic microphone consent can be refused and the real speaking exercise remains usable", async ({ page }) => {
      await page.goto("/index.html#/lezione?id=" + id); await ready(page);
      await page.locator('.ex-chip[data-go="8"]').click();
      const current = page.locator(active);
      await current.locator(".js-mic").click();
      await expect(page.locator("#sttConsentTitle")).toHaveText("سيُرسل صوتك خارج المتصفّح");
      await expect(page.locator("#sttConsent .js-body")).toContainText("يستعيد النص");
      await audit(page);
      await page.locator("#sttConsent .js-no").click();
      await expect(page.locator("#sttConsent")).toHaveCount(0);
      await expect(current.locator(".js-heard")).toContainText("اكتب إجابتك");
      expect(await page.evaluate(() => window.Core.state.settings.sttConsent)).not.toBe(true);
      await current.locator(".js-in").fill("Buongiorno, un caffè per favore.");
      await current.locator(".js-check").click();
      await expect(current).toHaveClass(/exq--ok/);
      await expect(current.locator(".fb")).toContainText("أحسنت");
      await audit(page);
    });

    test("wrong answer feedback, all nine real exercises, completion and reload", async ({ page }, info) => {
      const errors = []; page.on("pageerror", e => errors.push(e.message));
      await page.goto("/index.html#/lezione?id=" + id); await ready(page);
      // A fresh attempt verifies wrong-answer feedback without changing grading.
      await page.locator(active + ' [data-orig="0"]').click();
      await page.locator(active + " .js-check").click();
      await expect(page.locator(active)).toHaveClass(/exq--ko/);
      await expect(page.locator(active + " .fb__why")).toContainText("نقول");
      await audit(page);
      await page.reload(); await ready(page);
      // Observe real lesson UI requests; a translated course must not silently
      // fall back to English instructions or feedback in its shared builders.
      await page.evaluate(() => {
        const original = window.I18n.t;
        window.__lessonUIKeys = [];
        window.I18n.t = function (key, vars) {
          if (/^(lesson\.|ex\.|tense\.|stt\.)/.test(key) || key === "talk.checking") window.__lessonUIKeys.push(key);
          return original(key, vars);
        };
        window.App.go("lezione", { id: "a1-u01-l1" });
      });
      for (let i = 0; i < 9; i++) {
        await page.locator('.ex-chip[data-go="' + i + '"]').click();
        const current = page.locator(active);
        if (i < 2) await current.locator('[data-orig="1"]').click();
        if (i === 2) {
          const forms = ["sono", "sei", "è", "siamo", "siete", "sono"];
          for (let p = 0; p < forms.length; p++) await current.locator(".js-cell").nth(p).fill(forms[p]);
        }
        if (i === 3) await current.locator(".js-in").fill("sono");
        if (i === 4) await current.locator(".js-in").fill("Sono dalla Polonia");
        if (i === 5) {
          for (const word of ["Un", "caffè", "e", "un", "cornetto,", "per", "favore"]) await current.locator(".js-bank").getByRole("button", { name: word, exact: true }).first().click();
        }
        if (i === 6) {
          for (let p = 0; p < 4; p++) {
            await current.locator('.js-l [data-i="' + p + '"]').click();
            await current.locator('.js-r [data-i="' + p + '"]').click();
          }
        }
        if (i === 7) await current.locator(".js-in").fill("Buonasera, un cappuccino per favore.");
        if (i === 8) await current.locator(".js-in").fill("Buongiorno, un caffè per favore.");
        if (i !== 6) await current.locator(".js-check").click();
        await expect(current).toHaveClass(/exq--ok/);
        await expect(current.locator(".fb")).toContainText("أحسنت");
        await audit(page);
      }
      const usedKeys = await page.evaluate(() => [...new Set(window.__lessonUIKeys)]);
      expect(usedKeys.length).toBeGreaterThan(40);
      for (const key of usedKeys) {
        expect(arabicUI[key], "Arabic UI translation missing: " + key).toBeDefined();
        const values = typeof arabicUI[key] === "object" ? Object.values(arabicUI[key]) : [arabicUI[key]];
        for (const text of values) expect(text, key).toMatch(/[\u0600-\u06ff]/);
      }
      await expect(page.locator(".summary__score")).toHaveText("100%");
      await expect(page.locator(".summary__msg")).toContainText("9/9");
      await expect(page.locator(".lesson-vocab-in")).toContainText("14");
      await shot(page, info, "arabic-exercises-complete-" + width + ".png");
      const progress = await page.evaluate(() => ({ lesson: window.Core.state.lessons["a1-u01-l1"], card: window.Core.state.srs.grazie }));
      expect(progress.lesson.best).toBe(1); expect(progress.lesson.done).toBe(true);
      expect(progress.card.tr.ar).toBe("شكرًا");
      await language(page, "en"); expect(await page.evaluate(() => window.Core.cardTr(window.Core.state.srs.grazie))).toBe("thank you");
      await language(page, "ar"); expect(await page.evaluate(() => window.Core.cardTr(window.Core.state.srs.grazie))).toBe("شكرًا");
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("linguai.italiano.v2")).lessons["a1-u01-l1"].best === 1);
      await page.reload(); await ready(page);
      expect(await page.evaluate(() => window.Core.state.lessons["a1-u01-l1"].best)).toBe(1);
      await expect(page.locator(".view-head > p")).toHaveText("التحية وطلبك الأول في المقهى");
      expect(errors).toEqual([]);
    });
  });
}
