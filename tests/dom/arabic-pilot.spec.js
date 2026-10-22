const { test, expect } = require("@playwright/test");
const path = require("node:path");
const { readFileSync } = require("node:fs");
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const KEY = "linguai.italiano.v2";
async function ready(page) {
  await page.waitForFunction(() => window.Core && window.I18n && window.Core.registry.loaded.A1 === true);
  await expect(page.locator("#main h1")).toBeVisible();
  await page.evaluate(() => { window.Core.state.settings.autoplay = false; window.Core.save(); });
}
async function language(page, code) {
  if (await page.locator("#railToggle").isVisible() && !await page.locator("#rail").evaluate(el => el.classList.contains("is-open"))) await page.locator("#railToggle").click();
  await page.locator("#langToggle").click();
  await page.locator('#langList [data-lang="' + code + '"]').click();
  await page.waitForFunction(l => window.I18n.lang === l, code);
  await expect(page.locator("html")).toHaveAttribute("dir", code === "ar" ? "rtl" : "ltr");
}
async function overflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
async function a11y(page) {
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }
  })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
  expect(violations).toEqual([]);
}
async function shot(page, testInfo, name) {
  const target = process.env.ARABIC_QA_DIR ? path.join(process.env.ARABIC_QA_DIR, name) : testInfo.outputPath(name);
  await page.screenshot({ path: target, fullPage: true });
  await testInfo.attach(name, { path: target, contentType: "image/png" });
}

for (const width of [1440, 390]) {
  test.describe("Arabic at " + width + "px", () => {
    test.use({ viewport: { width, height: 920 }, locale: "ar-MA" });
    test.beforeEach(async ({ page }) => { await page.addInitScript(AXE); });

    test("first visit has Arabic navigation, usable selector and RTL without overflow", async ({ page }, testInfo) => {
      const errors = []; page.on("pageerror", e => errors.push(e.message));
      const failed = []; page.on("response", r => { if (r.status() >= 400) failed.push(r.url()); });
      await page.goto("/index.html"); await ready(page);
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator('.welcome-lang [data-lang="ar"]')).toHaveText("العربية");
      await expect(page.locator(".js-zero")).toHaveText("لنبدأ ←");
      await overflow(page); await a11y(page);
      await shot(page, testInfo, "welcome-" + width + ".png");
      if (width === 390) {
        await page.locator("#railToggle").click();
        await expect.poll(async () => {
          const rail = await page.locator("#rail").boundingBox();
          return Math.abs(rail.x + rail.width - width);
        }).toBeLessThan(0.5); // Wait for the actual drawer transition, not a sleep.
        await expect(page.locator('#rail [data-route="percorso"]')).toContainText("مسار التعلّم");
        await page.locator("#langToggle").click();
        await page.locator('#langList [data-lang="ar"]').focus();
        await page.keyboard.press("ArrowUp");
        await expect(page.locator('#langList [data-lang="de"]')).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(page.locator("#railToggle")).toHaveAttribute("aria-expanded", "false");
      }
      await page.locator(".js-look").click();
      await expect(page.locator(".unit").first()).toBeVisible();
      await overflow(page); await a11y(page);
      await shot(page, testInfo, "path-" + width + ".png");
      expect(errors).toEqual([]); expect(failed).toEqual([]);
    });

    test("Italian lessons, answers and recordings remain unchanged and LTR", async ({ page }, testInfo) => {
      const errors = []; page.on("pageerror", e => errors.push(e.message));
      await page.goto("/index.html#/lezione?id=a1-u01-l1"); await ready(page);
      await expect(page.locator(".exq").first()).toBeVisible();
      for (const selector of [".dlg__it", ".vocab-card__it", ".exq"]) {
        expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).direction)).toBe("ltr");
      }
      const before = await page.evaluate(() => {
        const l = window.Core.getLesson("a1-u01-l1").lesson;
        return { title: l.titleIt, italian: l.dialogue.lines.map(x => x.it), exercises: l.exercises, gloss: l.vocab[0].tr };
      });
      await language(page, "en");
      const english = await page.evaluate(() => {
        const l = window.Core.getLesson("a1-u01-l1").lesson;
        return { title: l.titleIt, italian: l.dialogue.lines.map(x => x.it), exercises: l.exercises, gloss: l.vocab[0].tr };
      });
      expect(before).toEqual(english);
      await language(page, "ar");
      // Real lesson choice and validation, using its original answer index.
      const correct = await page.evaluate(() => window.Core.getLesson("a1-u01-l1").lesson.exercises[0].a);
      await page.locator('.exq:not([hidden]) [data-orig="' + correct + '"]').click();
      await page.locator(".exq:not([hidden]) .js-check").click();
      await expect(page.locator(".exq:not([hidden])")).toHaveClass(/exq--ok/);
      await expect(page.locator(".exq:not([hidden]) .fb")).toContainText("أحسنت");
      await page.locator(".js-ex-next").click();
      // Every field, including hidden exercises, retains LTR typing.
      const directions = await page.locator('#exWrap input[type="text"]').evaluateAll(xs => xs.map(x => getComputedStyle(x).direction));
      expect(directions.length).toBeGreaterThan(0);
      expect(directions.every(d => d === "ltr")).toBe(true);
      const audio = page.locator(".vocab-card [data-say]").first();
      const italian = await audio.getAttribute("data-say");
      const recording = page.waitForResponse(r => /\/audio\/.*\.mp3$/.test(r.url()));
      await audio.click(); expect((await recording).status()).toBe(200);
      expect(italian).toBeTruthy();
      await overflow(page); await a11y(page);
      await shot(page, testInfo, "lesson-" + width + ".png");
      expect(errors).toEqual([]);
    });

    test("all language switches and reload preserve actual learner progress", async ({ page }) => {
      await page.goto("/index.html#/percorso"); await ready(page);
      const before = await page.evaluate(() => {
        window.Core.recordLesson("a1-u01-l1", 8, 10, 120);
        window.Core.addCard("ciao", "hello", "a1-u01-l1");
        const s = JSON.parse(JSON.stringify(window.Core.state)); delete s.settings.lang; return s;
      });
      for (const lang of ["pl", "es", "ar", "fr", "de", "en", "ar"]) {
        await language(page, lang);
        const state = await page.evaluate(() => { const s = JSON.parse(JSON.stringify(window.Core.state)); delete s.settings.lang; return s; });
        expect(state).toEqual(before);
      }
      await page.waitForFunction(k => JSON.parse(localStorage.getItem(k)).settings.lang === "ar", KEY);
      await page.reload(); await ready(page);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      expect(await page.evaluate(() => window.Core.state.lessons["a1-u01-l1"].best)).toBe(0.8);
      expect(await page.evaluate(() => window.Core.state.stats.lessonsDone)).toBe(1);
      expect(await page.evaluate(() => window.Core.state.srs.ciao.it)).toBe("ciao");
      await overflow(page);
    });

    test("Spanish to Arabic lazy-loaded advanced content uses English without missing files", async ({ page }) => {
      const failed = []; page.on("response", r => { if (r.status() >= 400) failed.push(r.url()); });
      await page.goto("/index.html#/percorso"); await ready(page);
      await language(page, "es");
      await page.evaluate(() => new Promise(resolve => window.Core.loadLevelData("B2", resolve)));
      const spanish = await page.evaluate(() => window.Core.registry.byCode.B2.units[0].lessons[0].title);
      await language(page, "ar");
      const arabic = await page.evaluate(() => window.Core.registry.byCode.B2.units[0].lessons[0].title);
      await language(page, "en");
      expect(arabic).toBe(await page.evaluate(() => window.Core.registry.byCode.B2.units[0].lessons[0].title));
      expect(arabic).not.toBe(spanish);
      expect(failed).toEqual([]);
    });

    test("Arabic supporting routes render without overflow and Italian reading stays LTR", async ({ page }) => {
      const errors = []; page.on("pageerror", e => errors.push(e.message));
      await page.goto("/index.html#/percorso"); await ready(page);
      for (const route of ["oggi", "ripasso", "cinque", "allenamento", "conversazione", "grammatica", "coniugatore", "lessico", "shadowing", "velocita", "esame", "falsi", "copertura", "progressi", "impostazioni", "piazzamento", "cerca", "lettura", "scrittura", "suoni", "privacy"]) {
        await page.evaluate(r => window.App.go(r, {}), route);
        await expect(page.locator("#main > *").first()).toBeVisible();
        await overflow(page);
      }
      await page.evaluate(() => window.App.go("lettura", { id: "r-a1-mattina" }));
      await expect(page.locator(".lk-text")).toBeVisible();
      expect(await page.locator(".lk-text").evaluate(el => getComputedStyle(el).direction)).toBe("ltr");
      expect(await page.locator(".lk-text").innerText()).toMatch(/\b(sono|mi|la|il)\b/i);
      await overflow(page);
      expect(errors).toEqual([]);
    });
  });
}
