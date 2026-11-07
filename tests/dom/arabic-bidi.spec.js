const { test, expect } = require("../helpers/learner-fixture.cjs");

async function useArabic(page) {
  await page.goto("/index.html#/lezione?id=a1-u01-l1");
  await page.evaluate(() => new Promise(resolve => window.Core.setLanguage("ar", resolve)));
  await page.waitForFunction(() => window.I18n.lang === "ar" && window.Core.getLesson("a1-u01-l1") && document.querySelector("#step-ex .exq"));
  await page.evaluate(() => document.fonts.ready);
}

test("Arabic lesson text isolates Italian and number runs without moving Arabic punctuation", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  const captureDir = process.env.BIDI_CAPTURE_DIR || "";
  await useArabic(page);

  const italianHeading = page.locator("#step-theory h4").filter({ hasText: "Essere" });
  await expect(italianHeading.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("Essere:");
  const grammarNote = page.locator("#step-gram .nb").filter({ hasText: "un caffè" });
  await expect(grammarNote.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("un caffè");
  const exerciseHint = page.locator("#step-ex .exq__sub").filter({ hasText: "essere" });
  await expect(exerciseHint.locator('bdi[lang="it"][dir="ltr"]').filter({ hasText: "essere" })).toHaveText("essere");

  if (captureDir) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: captureDir + "/after-lesson-390.png", fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: captureDir + "/after-lesson-1440.png", fullPage: true });
  }

  const expected = [
    ["arabic-only", "كيف حالك؟"],
    ["italian-only", "Buongiorno, un caffè per favore."],
    ["arabic-italian", "هل يمكنك قول un caffè من فضلك؟"],
    ["arabic-numbers", "موعدنا الساعة 09:30 في المبنى 2، ثم نلتقي."],
    ["arabic-parentheses", "الفعل (essere) يعني «يكون»."],
    ["arabic-punctuation", "هل العبارة «un caffè» صحيحة؟"],
    ["long-explanation", "في هذا المثال العملي، إذا وصلت إلى الموعد الساعة 09:30 يمكنك أن تقول un caffè، ثم تسأل بأدب عن السعر، وتنتبه إلى ترتيب الكلمات وعلامة الاستفهام العربية في نهاية الجملة؟"]
  ];
  await page.evaluate(rows => {
    const host = document.createElement("section");
    host.id = "bidi-regression-fixtures";
    host.lang = "ar";
    host.dir = "rtl";
    host.dataset.contentLanguage = "ar";
    host.style.cssText = "margin:24px;padding:16px;border:1px solid #aaa";
    for (const [id, text] of rows) { if (id === "italian-only") continue;
      const p = document.createElement("p");
      p.id = "bidi-" + id;
      p.textContent = text;
      host.appendChild(p);
    }
    const italian = document.createElement("p");
    italian.id = "bidi-italian-only";
    italian.lang = "it";
    italian.dir = "ltr";
    italian.dataset.contentLanguage = "it";
    italian.textContent = rows.find(row => row[0] === "italian-only")[1];
    host.appendChild(italian);
    document.querySelector("#main").appendChild(host);
  }, expected);

  for (const width of [320, 360, 390, 430, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const [id, text] of expected) {
      if (id === "italian-only") continue;
      const p = page.locator("#bidi-" + id);
      await expect(p).toHaveText(text);
      await expect(p).toHaveCSS("direction", "rtl");
    }
    const italian = page.locator("#bidi-italian-only");
    await expect(italian).toHaveAttribute("dir", "ltr");
    await expect(italian.locator("bdi")).toHaveCount(0);
  }

  const onlyArabic = page.locator("#bidi-arabic-only");
  await expect(onlyArabic.locator("bdi")).toHaveCount(0);
  const mixed = page.locator("#bidi-arabic-italian");
  await expect(mixed.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("un caffè");
  const time = page.locator("#bidi-arabic-numbers");
  await expect(time.locator('bdi[lang="ar"][dir="ltr"]')).toHaveText(["09:30", "2"]);
  expect(await time.evaluate(p => p.lastChild.textContent.trim())).toBe("، ثم نلتقي.");
  const parentheses = page.locator("#bidi-arabic-parentheses");
  await expect(parentheses.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("(essere)");
  const punctuation = page.locator("#bidi-arabic-italian");
  await expect(punctuation).toHaveText("هل يمكنك قول un caffè من فضلك؟");
  const punctuationNodes = await punctuation.evaluate(p => ({ last: p.lastChild.textContent.trim(), isolated: [...p.querySelectorAll("bdi")].map(node => node.textContent) }));
  expect(punctuationNodes.last).toBe("من فضلك؟");
  expect(punctuationNodes.isolated).toEqual(["un caffè"]);
  await expect(punctuation).toContainText("؟");
  const quoted = page.locator("#bidi-arabic-punctuation");
  await expect(quoted.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("«un caffè»");
  await expect(quoted).toHaveText("هل العبارة «un caffè» صحيحة؟");

  expect(pageErrors).toEqual([]);
});




for (const width of [320, 390]) {
  test.describe("Arabic direction boundaries across levels at " + width + "px", () => {
    test.use({ viewport: { width, height: 900 }, locale: "ar-MA" });

    test("A1-C1 Arabic lessons and C2 English fallback keep text and direction stable", async ({ page }) => {
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const levels = [
        { id: "a1-u01-l1", code: "A1", content: "ar" },
        { id: "a2-u01-l1", code: "A2", content: "ar" },
        { id: "b1-u01-l1", code: "B1", content: "ar" },
        { id: "b2-u01-l1", code: "B2", content: "ar" },
        { id: "c1-u01-l1", code: "C1", content: "ar" },
        { id: "c2-u01-l1", code: "C2", content: "en" }
      ];

      for (const level of levels) {
        await page.goto("/index.html#/lezione?id=" + level.id);
        await page.waitForFunction(({ id, code }) => window.Core && window.Core.registry.loaded[code] && window.Core.getLesson(id), level);
        await page.evaluate(() => new Promise(resolve => window.Core.setLanguage("ar", resolve)));
        await expect(page.locator("html")).toHaveAttribute("lang", "ar");
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("#main")).toHaveAttribute("data-lesson-language", level.content);

        const initial = await page.evaluate(id => ({
          lesson: JSON.stringify(window.Core.getLesson(id).lesson),
          state: JSON.stringify(window.Core.state),
          main: document.querySelector("#main").innerHTML,
          direction: getComputedStyle(document.querySelector("#main .prose")).direction,
          arabicNodes: document.querySelectorAll('#main [data-content-language="ar"]').length
        }), level.id);
        if (level.content === "ar") expect(initial.arabicNodes, level.id).toBeGreaterThan(0);
        expect(initial.direction).toBe(level.content === "ar" ? "rtl" : "ltr");

        const inspection = await page.evaluate(() => {
          const main = document.querySelector("#main"), walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
          const unisolated = [];
          let node;
          while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent || parent.closest('bdi,[dir="ltr"],[lang]:not([lang="ar"])')) continue;
            const scope = parent.closest("[data-content-language],[data-lesson-language]");
            const language = scope && (scope.getAttribute("data-content-language") || scope.getAttribute("data-lesson-language")) || main.getAttribute("data-view-language");
            if (language !== "ar" || getComputedStyle(parent).direction !== "rtl") continue;
            const remaining = node.nodeValue.replace(/[\u2066-\u2068][\s\S]*?\u2069/g, "").replace(/[\u2066-\u2069]/g, "");
            if (/[A-Za-z0-9]/.test(remaining)) unisolated.push(remaining);
          }
          return {
            unisolated,
            nestedBdi: main.querySelectorAll("bdi bdi").length,
            badBdi: [...main.querySelectorAll("bdi")].filter(el => el.dir !== "ltr" || !["it", "ar"].includes(el.lang)).map(el => el.outerHTML)
          };
        });
        if (level.content === "ar") expect(inspection.unisolated, level.id).toEqual([]);
        expect(inspection.nestedBdi, level.id).toBe(0);
        expect(inspection.badBdi, level.id).toEqual([]);

        await page.evaluate(() => window.I18n.isolateContent(document.querySelector("#main")));
        const after = await page.evaluate(id => ({
          lesson: JSON.stringify(window.Core.getLesson(id).lesson),
          state: JSON.stringify(window.Core.state),
          main: document.querySelector("#main").innerHTML
        }), level.id);
        expect(after.lesson).toBe(initial.lesson);
        expect(after.state).toBe(initial.state);
        expect(after.main).toBe(initial.main);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      expect(errors).toEqual([]);
    });

    test("dynamic Arabic content is isolated once and repeat processing is DOM-idempotent", async ({ page }) => {
      await useArabic(page);
      await page.evaluate(() => {
        const node = document.createElement("p");
        node.id = "bidi-observer-fixture";
        node.lang = "ar";
        node.dir = "rtl";
        node.dataset.contentLanguage = "ar";
        node.textContent = "هل يصل موعدنا 09:30 لطلب un caffè؟";
        window.__fixtureMutations = 0;
        window.__fixtureObserver = new MutationObserver(records => { window.__fixtureMutations += records.length; });
        window.__fixtureObserver.observe(node, { childList: true, subtree: true, characterData: true });
        document.querySelector("#main").appendChild(node);
        window.__bidiFixture = node;
      });
      const fixture = page.locator("#bidi-observer-fixture");
      await expect(fixture.locator('bdi[lang="ar"][dir="ltr"]')).toHaveText("09:30");
      await expect(fixture.locator('bdi[lang="it"][dir="ltr"]')).toHaveText("un caffè");
      await page.waitForTimeout(100);
      const beforeRepeat = await fixture.evaluate(node => ({ html: node.innerHTML, text: node.textContent, mutations: window.__fixtureMutations }));
      expect(beforeRepeat.text).toBe("هل يصل موعدنا 09:30 لطلب un caffè؟");
      expect(beforeRepeat.mutations).toBe(1);
      expect((await fixture.evaluate(node => node.lastChild.textContent.trim()))).toBe("؟");

      await page.evaluate(() => window.I18n.isolateContent(window.__bidiFixture));
      await page.waitForTimeout(100);
      const afterRepeat = await fixture.evaluate(node => ({ html: node.innerHTML, text: node.textContent, mutations: window.__fixtureMutations }));
      expect(afterRepeat).toEqual(beforeRepeat);
      await fixture.evaluate(() => window.__fixtureObserver.disconnect());
    });
  });
}
