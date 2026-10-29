/* ============================================================
   The learning path: one next step, the current unit open.

   Every unit used to highlight its own first unpassed lesson, so ten lessons
   looked like "your turn" and only one was; and all ten units stood open, a
   page of about 6500 px with the current one lost among them.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

const DWIE = {
  schema: 2, onboarded: true, settings: { lang: "en" },
  lessons: {
    "a1-u01-l1": { attempts: 1, score: 9, total: 10, best: 0.9, done: true, ts: 1 },
    "a1-u01-l2": { attempts: 1, score: 8, total: 10, best: 0.8, done: true, ts: 2 }
  },
  stats: { correct: 17, wrong: 3, lessonsDone: 2, days: {} }
};

async function sciezka(page) {
  await page.addInitScript(p => {
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("linguai.italiano.v2", JSON.stringify(p));
    sessionStorage.setItem("seeded", "1");
  }, DWIE);
  await page.goto("/index.html#/percorso");
  await page.waitForFunction(() => window.Core && window.Core.getLesson("a1-u02-l1"));
  await page.waitForSelector(".unit .node");
}

test("only the next lesson of the level is marked as the current one", async ({ page }) => {
  await sciezka(page);
  const biezace = page.locator(".node--current");
  await expect(biezace).toHaveCount(1);
  await expect(biezace.locator("[data-lesson]")).toHaveAttribute("data-lesson", "a1-u01-l3");
});

test("the current unit is open and the others are folded until asked", async ({ page }) => {
  await sciezka(page);
  const biezaca = page.locator(".unit", { has: page.locator('[data-lesson="a1-u01-l3"]') });
  await expect(biezaca.locator(".path")).toBeVisible();

  const inna = page.locator(".unit", { has: page.locator('[data-lesson="a1-u02-l1"]') });
  await expect(inna.locator(".path")).toBeHidden();
  const przelacznik = inna.locator(".js-unit-toggle");
  await expect(przelacznik).toHaveAttribute("aria-expanded", "false");
  await przelacznik.click();
  await expect(inna.locator(".path")).toBeVisible();
  await expect(przelacznik).toHaveAttribute("aria-expanded", "true");
});

test("the level button says how many lessons of it are passed", async ({ page }) => {
  await sciezka(page);
  const total = await page.evaluate(() => window.Core.levelProgress(window.Core.registry.byCode.A1).total);
  await expect(page.locator('.level-pill[data-level="A1"]')).toContainText("2/" + total);
});

/* Ten buttons all reading "Show the lessons" are one name repeated for a
   screen reader: each names its unit. */
test("each unit toggle names its unit", async ({ page }) => {
  await sciezka(page);
  const nazwy = await page.locator(".js-unit-toggle").evaluateAll(bs => bs.map(b => b.textContent.trim()));
  expect(new Set(nazwy).size).toBe(nazwy.length);
});

test("path states use consistent local icons while retaining the lesson number and completion state", async ({ page }) => {
  await sciezka(page);
  await expect(page.locator('.node--done .node__symbol')).toHaveCount(2);
  await expect(page.locator('.node--done .node__symbol').first()).toHaveClass(/vr-icon--check-circle/);
  await expect(page.locator('.node--current .node__number').first()).toHaveText("3");
  await expect(page.locator(".unit__badge .vr-icon--book-open-text").first()).toBeVisible();
  const locked = page.locator('.node--locked');
  if (await locked.count()) await expect(locked.locator('.node__symbol')).toHaveCount(await locked.count());
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "horizontal overflow at " + width).toBe(true);
  }
});
