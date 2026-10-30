const { test, expect } = require("../helpers/learner-fixture.cjs");

async function open(page) {
  await page.goto("/index.html#/falsi");
  await expect(page.locator(".empty")).toBeVisible();
}

async function openEnglishFallback(page) {
  await open(page);
  /* False-friend explanations are authored for a learner's first language.
     Arabic has no matching source entries, so this test loads the existing
     English overlay only to keep exercising the shared card/quiz rendering. */
  await page.addScriptTag({ url: "/data/i18n/en/interference.js" });
  await page.evaluate(() => {
    window.LINGUAI.applyStrings("en");
    window.App.go("falsi", {});
  });
  await page.waitForSelector(".fa-card");
}

test.describe("false friends", () => {
  test("Arabic shows its localized empty state instead of unrelated language traps", async ({ page }) => {
    await open(page);
    await expect(page.locator(".empty h3")).toHaveText("لا توجد مدخلات لهذه اللغة بعد.");
    await expect(page.locator(".empty p")).toContainText("لكل لغة على حدة");
    await expect(page.locator(".fa-card,.js-quiz")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("the existing English fallback renders the Italian entries and explanations", async ({ page }) => {
    await openEnglishFallback(page);
    const cards = page.locator(".fa-card");
    expect(await cards.count()).toBeGreaterThan(10);
    await expect(cards.first().locator(".fa-it")).toContainText(/.+/);
    await expect(cards.first().locator(".js-why")).toContainText(/.+/);
    await expect(cards.first().locator(".js-why")).toHaveAttribute("lang", "en");
    expect(await cards.first().locator(".js-why").evaluate(element => getComputedStyle(element).direction)).toBe("ltr");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("the exercise records one answer only", async ({ page }) => {
    await openEnglishFallback(page);
    await page.click(".js-quiz");
    await page.waitForSelector(".exq");
    await page.evaluate(() => {
      window.__n = 0;
      const original = Core.recordAnswer;
      Core.recordAnswer = function () { window.__n++; return original.apply(this, arguments); };
    });
    await page.click(".opt");
    await page.click(".js-check");
    await expect(page.locator(".exq .js-check")).toBeDisabled();
    expect(await page.evaluate(() => window.__n)).toBe(1);
  });

  test("fallback explanation is rendered as text, not markup", async ({ page }) => {
    await openEnglishFallback(page);
    await expect(page.locator(".fa-card .js-why img")).toHaveCount(0);
    await expect(page.locator(".fa-card").first().locator(".js-why")).toContainText(/.+/);
  });
});
