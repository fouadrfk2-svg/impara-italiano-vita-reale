const { test: browserTest } = require("@playwright/test");
const { test, expect } = require("../helpers/learner-fixture.cjs");

browserTest("public landing keeps learner engines and protected datasets unloaded before authentication", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = [];
  const pageErrors = [];
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  page.on("pageerror", error => pageErrors.push(error.message));
  try {
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".guest-page")).toBeVisible();
    await expect(page.locator(".guest-page h1")).toBeVisible();
    await expect.poll(() => requests.includes("/api/auth/session")).toBe(true);
    expect(pageErrors).toEqual([]);
    expect(await page.evaluate(() => typeof window.Ex)).toBe("undefined");
    expect(await page.evaluate(() => typeof window.Audio2)).toBe("undefined");
    expect(requests.filter(path => /\/data\/core\/|\/audio\/|data\/audio-index|vita-course-/.test(path))).toEqual([]);
    await expect(page.locator("#pilot-code")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("authenticated route loads its own feature modules and supporting dataset on demand", async ({ page }) => {
  const requests = [];
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("console", message => { if (message.type() === "error") pageErrors.push(message.text()); });
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  await page.goto("/index.html#/progressi");
  await expect(page.locator("#main h1")).toBeVisible({ timeout: 20000 });
  await expect(page.locator("html")).toHaveAttribute("data-access", "learner");

  const initial = await page.evaluate(() => Object.keys(Core.registry.loaded).filter(code => Core.registry.loaded[code] === true));
  expect(initial).toEqual([]);
  expect(requests).toContain("/data/core/curriculum-index.js");
  expect(requests).not.toContain("/data/core/a1-01.js");
  expect(requests).not.toContain("/data/audio-index.js");
  expect(requests).not.toContain("/assets/js/cils.js");
  expect(requests).not.toContain("/assets/js/llm.js");
  expect(requests).not.toContain("/assets/js/views-grammar.js");
  expect(await page.evaluate(() => typeof window.Audio2)).toBe("undefined");

  await page.evaluate(() => App.go("grammatica"));
  await expect(page.locator("#main h1")).toBeVisible();
  await expect.poll(() => requests.includes("/data/core/grammar-reference.js")).toBe(true);
  expect(requests).not.toContain("/data/core/conversations.js");
  expect(requests).not.toContain("/data/core/cils.js");

  await page.evaluate(() => App.go("lezione", { id: "a1-u01-l1" }));
  await expect(page.locator(".exq").first()).toBeVisible({ timeout: 20000 });
  await expect.poll(() => requests.includes("/data/core/a1-01.js")).toBe(true);
  await expect.poll(() => requests.some(path => /vita-course-lesson-/.test(path))).toBe(true);
  await expect.poll(() => requests.includes("/assets/js/exercises-choice.js") || requests.some(path => /vita-course-exercise-types/.test(path))).toBe(true);
  expect(requests).not.toContain("/assets/js/cils.js");
  expect(requests).not.toContain("/data/core/cils.js");
  expect(await page.evaluate(() => Core.registry.loaded.A1)).toBe(true);
  expect(await page.evaluate(() => typeof window.Verbs)).toBe("object");
  expect(pageErrors).toEqual([]);
});


test("error review lazy-loads the exercise renderer before showing an authored gap task", async ({ page }) => {
  await page.goto("/index.html#/lezione?id=a1-u01-l2");
  await expect(page.locator(".exq").first()).toBeVisible({ timeout: 20000 });
  const key = await page.evaluate(() => {
    const lesson = Core.getLesson("a1-u01-l2").lesson;
    const card = Errors.record(lesson, 1, false);
    Core.state.errors[card.key].due = Date.now() - 1000;
    return card.key;
  });
  expect(key).toContain("a1-u01-l2");
  await page.evaluate(() => App.go("ripasso", { tab: "errori" }));
  await page.locator(".js-start").click();
  await expect(page.locator(".exq .js-in")).toBeVisible();
  await expect(page.locator(".exq .js-check")).toBeVisible();
});
