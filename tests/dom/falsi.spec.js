/* Arabic false-friend view uses English only for entries not yet translated. */
const { test, expect } = require("../helpers/learner-fixture.cjs");

async function open(page) {
  await page.goto("/index.html#/falsi");
  await page.waitForSelector(".fa-card");
}

test.describe("false friends", () => {
  test("the Arabic learner view retains Italian entries and readable English fallback explanations", async ({ page }) => {
    await open(page);
    const cards = page.locator(".fa-card");
    expect(await cards.count()).toBeGreaterThan(10);
    await expect(cards.first().locator(".fa-it")).toContainText(/.+/);
    await expect(cards.first().locator(".js-why")).toContainText(/.+/);
    await expect(cards.first().locator(".js-why")).toHaveAttribute("lang", "en");
    expect(await cards.first().locator(".js-why").evaluate(element => getComputedStyle(element).direction)).toBe("ltr");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("the exercise records one answer only", async ({ page }) => {
    await open(page);
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
    await open(page);
    await expect(page.locator(".fa-card .js-why img")).toHaveCount(0);
    await expect(page.locator(".fa-card").first().locator(".js-why")).toContainText(/.+/);
  });
});
