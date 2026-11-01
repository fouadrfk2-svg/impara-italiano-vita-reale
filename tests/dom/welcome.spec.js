/* ============================================================
   The welcome screen: who sees it and when it stops.

   A mistake in either direction is silent. Too narrow: a new student lands
   straight in fifteen tabs and starts at A1 despite knowing the language —
   that is exactly the state the screen was created for. Too wide: somebody
   with forty lessons behind them is asked at startup "where do I start", as
   if the course did not remember them.

   The third case, the easiest to break: the marker is set by the CHOICE, not
   by the screen being shown. Set too early, it means an accidental refresh
   takes that one answer away from the student for good.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

const KLUCZ = "linguai.italiano.v2";

/** Puts a profile INTO localStorage before the engine gets to read it. */
async function zProfilem(page, profil) {
  await page.addInitScript(([k, p]) => {
    window.localStorage.setItem(k, JSON.stringify(p));
  }, [KLUCZ, profil]);
}

async function nowyUczen(page) {
  await zProfilem(page, { schema: 2, onboarded: false, settings: { lang: "ar" }, lessons: {}, srs: {}, saved: {}, writing: {},
    errors: {}, drills: {}, reviews: [], stats: { lessonsDone: 0, correct: 0, wrong: 0, days: {} } });
}

async function gotowe(page) {
  await page.waitForFunction(() => window.App && window.Router);
  await page.waitForFunction(() => window.Router.current.route !== null);
}

async function finishBeginnerSoundRound(page) {
  for (let i = 0; i < 10; i++) {
    const current = page.locator("#soundBox .exq");
    await expect(current).toBeVisible();
    await current.locator(".js-play").click();
    await current.locator(".opt").first().click();
    await current.locator(".js-check").click();
    await expect(page.locator("#soundBox .js-next")).toBeVisible();
    await page.locator("#soundBox .js-next").click();
  }
  await expect(page.locator("#soundBox .summary")).toBeVisible();
}

test("an authenticated learner can open the original onboarding screen", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await expect(page.locator(".journey-wizard")).toBeVisible();
  await expect(page.locator(".js-step-next")).toBeVisible();
  await expect(page.locator(".journey-track")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".journey-track")).toHaveAttribute("aria-valuemax", "5");
  await expect(page).toHaveURL(/#\/benvenuto/);
});

test("a fresh authenticated profile is routed to Arabic onboarding automatically", async ({ page }) => {
  await zProfilem(page, { schema: 2, onboarded: false, settings: { lang: "ar" }, lessons: {}, srs: {}, saved: {}, writing: {},
    errors: {}, drills: {}, reviews: [], stats: { lessonsDone: 0, correct: 0, wrong: 0, days: {} } });
  await page.goto("/index.html");
  await gotowe(page);
  await expect(page).toHaveURL(/#\/benvenuto/);
  await expect(page.locator(".journey-wizard")).toBeVisible();
  expect(await page.evaluate(() => [window.I18n.lang, document.documentElement.lang, document.documentElement.dir])).toEqual(["ar", "ar", "rtl"]);
});

test("a student halfway through the course gets no welcome", async ({ page }) => {
  await zProfilem(page, { schema: 2, stats: { lessonsDone: 40, correct: 0, wrong: 0, days: {} } });
  await page.goto("/index.html");
  await gotowe(page);
  await expect(page.locator(".journey-wizard")).toHaveCount(0);
  /* Not the path any more: a student with lessons behind them opens on Today. */
  expect(await page.evaluate(() => window.Router.current.route)).toBe("oggi");
});

test("adres z linku wygrywa nad powitaniem", async ({ page }) => {
  await page.goto("/index.html#/grammatica");
  await gotowe(page);
  await expect(page.locator(".journey-wizard")).toHaveCount(0);
  expect(await page.evaluate(() => window.Router.current.route)).toBe("grammatica");
});

test("the five-step welcome saves choices, teaches existing sounds, then starts the first A1 lesson", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="zero"]').check();
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-goal"][value="everyday"]').check();
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-minutes"][value="20"]').check();
  await page.locator(".js-step-next").click();
  await expect(page.locator(".js-start-journey")).toBeVisible();
  await page.locator(".js-start-journey").click();
  await expect(page).toHaveURL(/#\/suoni\?set=ph-doppie&onboarding=1/);
  await expect(page.locator("#soundBox .exq")).toBeVisible();
  expect(await page.evaluate(() => window.Core.state.onboarded)).toBe(false);
  await finishBeginnerSoundRound(page);
  await expect(page.locator(".js-start-first")).toBeVisible();
  await page.locator(".js-start-first").click();
  await expect(page).toHaveURL(/#\/lezione\?id=a1-u01-l1/);
  await page.waitForFunction(() => window.Core.state.onboarded && window.Core.state.learningProfile.goal === "everyday");
  expect(await page.evaluate(() => window.Core.state.onboarded)).toBe(true);

  /* We wait for the SAVE, not for time to pass: save() is debounced by
     180 ms, so a reload right after the click would overtake the save and
     the test would measure its own haste instead of the course's
     behaviour. */
  await page.waitForFunction(k => {
    const zapis = window.localStorage.getItem(k);
    return zapis && JSON.parse(zapis).onboarded === true;
  }, KLUCZ);

  await page.goto("/index.html");
  await gotowe(page);
  await expect(page.locator(".journey-wizard")).toHaveCount(0);
  expect(await page.evaluate(() => window.Router.current.route)).toBe("oggi");
});

test("the personalized placement choice launches the existing placement test", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="placement"]').check();
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-goal"][value="general"]').check();
  await page.locator(".js-step-next").click();
  await page.locator(".js-step-next").click();
  await page.locator(".js-start-journey").click();
  await expect(page).toHaveURL(/#\/piazzamento\?go=1&onboarding=1/);
  await expect(page.locator(".exq").first()).toBeVisible({ timeout: 20000 });
  expect(await page.evaluate(() => window.Core.state.onboarded)).toBe(false);
});

test("a learner who knows some Italian can choose a starting level", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="known"]').check();
  await expect(page.locator(".journey-level")).toBeVisible();
  await page.locator("#journeyLevel").selectOption("B1");
  await page.locator(".js-step-next").click();
  await expect(page.locator('[name="journey-goal"]')).toHaveCount(5);
  expect(await page.evaluate(() => window.Core.state.learningProfile.startingLevel)).toBe("B1");
});

test("onboarding back navigation preserves choices and all five steps fit mobile and desktop", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await expect(page.locator(".journey-step-markers .journey-step-marker")).toHaveCount(5);
  await expect(page.locator(".journey-route")).toBeVisible();
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "horizontal overflow at welcome step 1, " + width).toBe(true);
  }

  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="known"]').check();
  await page.locator("#journeyLevel").selectOption("B1");
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "horizontal overflow at welcome step 2, " + width).toBe(true);
  }
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-goal"][value="work"]').check();
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "horizontal overflow at welcome step 3, " + width).toBe(true);
  }
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-minutes"][value="10"]').check();
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "horizontal overflow at welcome step 4, " + width).toBe(true);
  }
  await page.locator(".js-step-next").click();
  await expect(page.locator(".journey-wizard")).toHaveAttribute("data-step", "5");
  await expect(page.locator(".journey-head")).toContainText(await page.evaluate(() =>
    window.I18n.t("welcome.recommendKnown", { level: "B1" })));
  await expect(page.locator(".journey-card--summary")).toContainText(await page.evaluate(() => window.I18n.t("welcome.goal.work")));
  await expect(page.locator(".journey-card--summary")).toContainText("10");
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "horizontal overflow at welcome step 5, " + width).toBe(true);
  }
  await page.locator(".js-step-back").click();
  await expect(page.locator('[name="journey-minutes"][value="10"]')).toBeChecked();
  await page.locator(".js-step-back").click();
  await expect(page.locator('[name="journey-goal"][value="work"]')).toBeChecked();
  await page.locator(".js-step-back").click();
  await expect(page.locator('[name="journey-start"][value="known"]')).toBeChecked();
  await expect(page.locator("#journeyLevel")).toHaveValue("B1");
  expect(await page.evaluate(() => ({ step: window.Core.state.learningProfile.onboardingStep,
    mode: window.Core.state.learningProfile.startMode, level: window.Core.state.learningProfile.startingLevel,
    goal: window.Core.state.learningProfile.goal, minutes: window.Core.state.learningProfile.dailyMinutes })))
    .toEqual({ step: 2, mode: "known", level: "B1", goal: "work", minutes: 10 });
});

/* The same dependency on loading, but sharper: "from scratch" has to KNOW
   the id of the first lesson at the moment of the click, otherwise it
   quietly falls back to the list of levels — that is, it does the very thing
   this button must not do. */
test("the zero-level primary path starts with the existing A1 recorded sound foundation", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="zero"]').check();
  await page.locator(".js-step-next").click();
  await page.locator(".js-step-next").click();
  await page.locator(".js-step-next").click();
  await page.locator(".js-start-journey").click();
  await expect(page).toHaveURL(/#\/suoni\?set=ph-doppie&onboarding=1/);
  await expect(page.locator("#soundBox .exq")).toBeVisible();
  expect(await page.evaluate(() => window.Core.state.onboarded)).toBe(false);
});

test("a true beginner may skip the existing sound practice and start the actual first lesson", async ({ page }) => {
  await nowyUczen(page);
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await page.locator(".js-step-next").click();
  await page.locator('[name="journey-start"][value="zero"]').check();
  await page.locator(".js-step-next").click();
  await page.locator(".js-step-next").click();
  await page.locator(".js-step-next").click();
  await page.locator(".js-start-direct").click();
  await expect(page).toHaveURL(/#\/lezione\?id=a1-u01-l1/);
  expect(await page.evaluate(() => window.Core.state.onboarded)).toBe(true);
  await expect(page.locator("#main h1")).toHaveText(await page.evaluate(() => window.Core.getLesson("a1-u01-l1").lesson.titleIt));
});

test("the welcome renders Arabic UI strings without a language selector", async ({ page }) => {
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  await expect(page.locator(".journey-head")).toContainText("مرحباً بك");
  await expect(page.locator(".welcome-lang, #langToggle, #langList")).toHaveCount(0);
  expect(await page.evaluate(() => window.I18n.LANGS.map(l => l.code))).toEqual(["ar"]);
});

test.describe("a first visit from a French browser", () => {
  test.use({ locale: "fr-FR" });

  /* Fresh visitors start Arabic independently of browser locale. */
  test("the welcome is Arabic regardless of the browser language", async ({ page }) => {
    await nowyUczen(page);
    await page.goto("/index.html");
    await gotowe(page);
    await expect(page.locator(".journey-wizard")).toBeVisible();
    expect(await page.evaluate(() => window.I18n.lang)).toBe("ar");
  });
});

test("a retired saved language is normalized to Arabic without losing the profile", async ({ page }) => {
  await zProfilem(page, { schema: 2, settings: { lang: "de" }, stats: { lessonsDone: 0, correct: 0, wrong: 0, days: {} } });
  await page.goto("/index.html#/benvenuto");
  await gotowe(page);
  expect(await page.evaluate(() => window.I18n.lang)).toBe("ar");
  expect(await page.evaluate(() => window.Core.state.settings.lang)).toBe("ar");
});

test.describe("a profile saved before the current format", () => {
  test.use({ locale: "fr-FR" });

  /* A legacy language preference migrates to Arabic without changing work. */
  test("normalizes its retired language to Arabic while retaining the profile", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded")) return;
      localStorage.setItem("linguai.italiano.pl.v1", JSON.stringify({ lessons: {}, srs: {}, stats: { lessonsDone: 0, correct: 0, wrong: 0, days: {} }, settings: {} }));
      sessionStorage.setItem("seeded", "1");
    });
    await page.goto("/index.html#/benvenuto");
    await gotowe(page);
    expect(await page.evaluate(() => window.I18n.lang)).toBe("ar");
    expect(await page.evaluate(() => window.Core.state.settings.lang)).toBe("ar");
  });
});
