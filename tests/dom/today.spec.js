/* ============================================================
   Sesja dnia: jeden przycisk zamiast trzech decyzji.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

async function oggi(page) {
  await page.goto("/index.html#/oggi");
  await page.waitForFunction(() => window.Views && window.Views.oggi &&
    (window.Core.getLesson("a1-u01-l2") || window.Core.registry.loaded[window.Core.state.learningProfile.startingLevel] === true));
  await page.waitForSelector(".journey-today");
}

test("the primary journey action opens the real next lesson and fits narrow screens", async ({ page }) => {
  await oggi(page);
  const expected = await page.evaluate(() => {
    const next = Core.nextOpenLesson(), progress = Core.levelProgress(next.level);
    return { id: next.lesson.id, title: next.lesson.titleIt, done: progress.done, total: progress.total };
  });
  await expect(page.locator(".journey-today")).toContainText(expected.title);
  await expect(page.locator(".journey-progress")).toContainText("0");
  await expect(page.locator(".journey-level-progress")).toContainText(expected.done + "/" + expected.total);
  await expect(page.locator(".journey-level-progress progress")).toHaveAttribute("max", String(expected.total));
  await expect(page.locator(".journey-level-progress progress")).toHaveAttribute("value", String(expected.done));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "horizontal overflow at " + width).toBe(true);
    await expect(page.locator(".js-next-lesson")).toBeVisible();
  }
  await page.locator(".js-next-lesson").click();
  await expect(page).toHaveURL(new RegExp("#/lezione\\?id=" + expected.id));
});

test("a returning learner keeps their selected starting level as the next-step floor", async ({ page }) => {
  await profil(page, zdane([], { learningProfile: { startMode: "known", startingLevel: "B1", dailyMinutes: 20,
    goal: "general", onboardingStep: 5, meaningfulSessions: 0, lastMeaningfulInteractionAt: 0,
    lastCompletedLessonId: null, lastCompletedLevel: null, activitySession: null } }));
  await oggi(page);
  const result = await page.evaluate(() => ({
    id: window.Core.nextLesson(window.Core.registry.byCode.B1).lesson.id,
    displayedLevel: document.querySelector(".journey-progress .journey-level").textContent
  }));
  expect(result.displayedLevel).toBe("B1");
  await expect(page.locator(".journey-location .journey-lesson-title")).toContainText(
    await page.evaluate(id => window.Core.getLesson(id).lesson.titleIt, result.id));
  await page.locator(".journey-today .js-next-lesson").click();
  await expect(page).toHaveURL(new RegExp("#/lezione\\?id=" + result.id));
});

/** Creates n mistake cards with a due date in the past. */
async function zalegleBledy(page, n) {
  return page.evaluate(ile => {
    const L = window.Core.getLesson("a1-u01-l2").lesson;
    const klucze = [];
    for (let i = 0; i < ile && i < L.exercises.length; i++) {
      const k = window.Errors.record(L, i, false).key;
      window.Core.state.errors[k].due = Date.now() - 1000;
      klucze.push(k);
    }
    return klucze;
  }, n);
}

/* The session is never empty and that is its point: generated tasks are
   always available, so there is always something to fill ten minutes with.
   If it showed "nothing today" when nothing was due, it would send the
   student back to the choice it exists to spare them. */
test("the session has something to offer even when nothing is due", async ({ page }) => {
  await oggi(page);
  const zalegle = await page.evaluate(() =>
    window.Errors.dueCount() + window.Core.dueCards().length);
  expect(zalegle, "a start with nothing due").toBe(0);

  await expect(page.locator(".js-start")).toBeVisible();
  await page.locator(".js-start").click();
  await expect(page.locator(".exq")).toBeVisible();
});

/* A part with nothing in it is a sentence, not a row with a zero: two of
   three rows used to say "0". */
test("the optional review plan lists only activities that contain something", async ({ page }) => {
  await oggi(page);
  await page.locator(".journey-plan summary").click();
  await expect(page.locator(".journey-plan .list-row")).toHaveCount(1);

  await zalegleBledy(page, 3);
  await page.reload();
  await page.locator(".journey-plan summary").click();
  await expect(page.locator(".journey-plan .list-row")).toHaveCount(2);

  const etykieta = await page.locator(".js-start").innerText();
  expect(etykieta, "the button carries the number of tasks").toMatch(/\d/);
});

test("session-length preference changes the real review plan and persists", async ({ page }) => {
  await oggi(page);
  await expect(page.locator('.journey-minutes[data-minutes="20"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('.journey-minutes[data-minutes="10"]').click();
  await expect(page.locator('.journey-minutes[data-minutes="10"]')).toHaveAttribute("aria-pressed", "true");
  const ten = await page.locator(".journey-plan summary").innerText();
  await page.locator('.journey-minutes[data-minutes="30"]').click();
  await expect(page.locator('.journey-minutes[data-minutes="30"]')).toHaveAttribute("aria-pressed", "true");
  const thirty = await page.locator(".journey-plan summary").innerText();
  expect(Number((thirty.match(/\d+/g) || []).pop())).toBeGreaterThan(Number((ten.match(/\d+/g) || []).pop()));
  expect(await page.evaluate(() => Core.state.learningProfile.dailyMinutes)).toBe(30);
});

test("a lesson resumes at its exact saved exercise without restoring typed text or awarding completion", async ({ page }) => {
  const privateAnswer = "journey-private-answer-should-not-persist";
  await page.goto("/index.html#/lezione?id=a1-u01-l1");
  await expect(page.locator('.ex-chip[data-go="0"]')).toHaveAttribute("aria-current", "step");
  expect(await page.evaluate(() => ({
    index: Core.state.resume.lessons["a1-u01-l1"].exerciseIndex,
    answers: Core.state.resume.lessons["a1-u01-l1"].answers,
    done: Core.isLessonDone("a1-u01-l1")
  }))).toEqual({ index: 0, answers: Array(9).fill(null), done: false });

  const first = page.locator('#exWrap .exq:not([hidden])');
  await first.locator('.opt[data-orig="0"]').click();
  await first.locator(".js-check").click();
  await expect(first).toHaveClass(/exq--(?:ok|ko)/);

  const textExercise = page.locator('#exWrap .exq[data-idx="3"]');
  await page.locator('.ex-chip[data-go="3"]').click();
  await textExercise.locator(".js-in").fill(privateAnswer);
  await textExercise.locator(".js-check").click();
  await expect(textExercise).toHaveClass(/exq--ko/);
  await page.locator(".js-ex-next").click();
  await expect(page.locator('.ex-chip[data-go="4"]')).toHaveAttribute("aria-current", "step");

  const saved = await page.evaluate(() => {
    const entry = Core.state.resume.lessons["a1-u01-l1"];
    return { entry: JSON.parse(JSON.stringify(entry)), done: Core.isLessonDone("a1-u01-l1"), record: Core.lessonState("a1-u01-l1") };
  });
  expect(saved.entry.exerciseIndex).toBe(4);
  expect(saved.entry.answers[0]).toEqual(expect.any(Boolean));
  expect(saved.entry.answers[3]).toEqual(expect.any(Boolean));
  expect(saved.entry.answers.every(v => v === null || typeof v === "boolean")).toBe(true);
  expect(saved.done).toBe(false);
  expect(saved.record).toBeFalsy();

  await page.evaluate(() => window.App.go("oggi"));
  await expect(page.locator(".js-resume").first()).toBeVisible();
  await expect(page.locator(".journey-today")).toContainText(await page.evaluate(() => I18n.t("journey.exercisePosition", { i: 5, n: 9 })));
  const storage = await page.evaluate(() => Object.keys(localStorage).map(k => localStorage.getItem(k) || "").join("\\n"));
  expect(storage).not.toContain(privateAnswer);

  /* A reload must recover the resume through the account-backed progress path. */
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.locator(".js-resume").first()).toBeVisible();
  await expect(page.locator(".journey-today")).toContainText(await page.evaluate(() => I18n.t("journey.exercisePosition", { i: 5, n: 9 })));

  await page.locator(".js-resume").first().click();
  await expect(page).toHaveURL(/#\/lezione\?id=a1-u01-l1/);
  await expect(page.locator('.ex-chip[data-go="4"]')).toHaveAttribute("aria-current", "step");
  await expect(page.locator('#exWrap .exq:not([hidden])')).toBeInViewport();
  const savedCorrectText = index => page.evaluate(i => I18n.t(Core.state.resume.lessons["a1-u01-l1"].answers[i] ? "journey.savedCorrect" : "journey.savedReview"), index);
  const firstSaved = page.locator('#exWrap .exq[data-idx="0"] .journey-answer');
  await expect(firstSaved).toHaveCount(1);
  await page.locator('.ex-chip[data-go="0"]').click();
  await expect(firstSaved).toBeVisible();
  await expect(firstSaved).toContainText(await savedCorrectText(0));
  await expect(page.locator('#exWrap .exq[data-idx="0"] .js-check')).toHaveCount(0);
  const textSaved = page.locator('#exWrap .exq[data-idx="3"] .journey-answer');
  await page.locator('.ex-chip[data-go="3"]').click();
  await expect(textSaved).toBeVisible();
  await expect(textSaved).toContainText(await savedCorrectText(3));
  await expect(page.locator('#exWrap .exq[data-idx="3"] .js-in')).toHaveCount(0);
  await page.locator('.ex-chip[data-go="4"]').click();
  await expect(page.locator('.ex-chip[data-go="4"]')).toHaveAttribute("aria-current", "step");
  await expect(page.locator("#lessonEnd .summary")).toHaveCount(0);
});

test("the run shows the tasks and ends with a summary", async ({ page }) => {
  await oggi(page);
  await zalegleBledy(page, 2);
  await page.reload();
  await page.waitForSelector(".js-start");
  await page.locator(".js-start").click();

  await expect(page.locator(".exq")).toBeVisible();

  /* We walk through every task: the answer does not matter, what counts is
     that the run reaches the end and loses no step. */
  let poprzednie = null, zablokowane = 0;
  for (let krok = 0; krok < 20; krok++) {
    if (await page.locator(".summary").count()) break;
    const check = page.locator(".exq .js-check").first();
    if (await check.count() && await check.isEnabled()) {
      const inp = page.locator(".exq .js-in, .exq .js-gap").first();
      if (await inp.count()) await inp.fill("cokolwiek");
      const radio = page.locator('.exq input[type="radio"]').first();
      if (await radio.count()) await radio.check();
      /* A checkbox, not a radio: "multi" refuses an empty answer on purpose
         (exercises-choice.js), so without this tick onDone never fires, the
         "next" button stays hidden and the loop spins to its last turn. */
      const box = page.locator('.exq input[type="checkbox"]').first();
      if (await box.count()) await box.check();
      await check.click();
    }
    const next = page.locator(".js-next");
    if (await next.count() && await next.isVisible()) await next.click();
    else await page.waitForTimeout(120);

    /* A task we cannot answer has to say so. Otherwise the run leaves behind
       nothing but ".summary is not visible" after every turn, and the type
       that blocked it has to be dug out by hand — which is what happened
       here: the session's drills are drawn from the current day
       (views-today.js), so the exercise that turns up first changes daily
       and a type the loop cannot handle only shows up on some dates. */
    const exq = page.locator(".exq").first();
    /* The signature is the task's own text. data-idx is NOT usable here: it
       numbers the exercise inside its lesson, so two tasks in a row can carry
       the same one. And it is read only when .exq is still there — after the
       last task the run swaps it for .summary, and waiting for a locator that
       will never appear turns the end of the run into a timeout. */
    const firma = (await exq.count()) ? (await exq.innerText()).slice(0, 120) : null;
    if (firma !== null && firma === poprzednie) zablokowane++;
    else zablokowane = 0;
    poprzednie = firma;
    if (zablokowane >= 8) {
      throw new Error("the run is stuck on a task the loop cannot answer:\n" + firma);
    }
  }

  await expect(page.locator(".summary")).toBeVisible();
});

test("a closed session is recorded under today's date", async ({ page }) => {
  await oggi(page);
  const zapis = await page.evaluate(async () => {
    window.Core.state.session = { date: window.Core.today(), score: 5, total: 8 };
    window.Core.save();
    /* save() is debounced by 180 ms: without waiting, the reload would
       overtake the save and the test would measure a race, not behaviour. */
    await new Promise(r => setTimeout(r, 300));
    return window.Core.state.session.date;
  });
  expect(zapis).toMatch(/^\d{4}-\d{2}-\d{2}$/);

  await page.reload();
  await page.waitForSelector(".journey-today");
  await expect(page.locator(".today-done"), "the notice about a closed session").toBeVisible();
});

test("rail prowadzi do sesji dnia", async ({ page }) => {
  await page.goto("/index.html");
  await page.waitForFunction(() => window.App);
  await page.locator('.rail__item[data-route="oggi"]').click();
  await expect(page).toHaveURL(/#\/oggi/);
  await expect(page.locator('.rail__item[data-route="oggi"]')).toHaveAttribute("aria-current", "page");
});

test("Arabic daily session strings exist", async ({ page }) => {
  await oggi(page);
  await zalegleBledy(page, 2);
  const braki = await page.evaluate(async () => {
    const out = {};
    for (const lang of ["ar"]) {
      await new Promise(r => window.Core.setLanguage(lang, r));
      window.I18n.set(lang);
      window.App.go("oggi");
      const puste = window.I18n.missing().filter(k => /^today\.|^journey\.|^welcome\.|^nav\.today/.test(k));
      if (puste.length) out[lang] = puste;
    }
    return out;
  });
  expect(braki, JSON.stringify(braki)).toEqual({});
});

/** A profile written before the engine reads it. */
async function profil(page, p) {
  await page.addInitScript(x => {
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("linguai.italiano.v2", JSON.stringify(x));
    sessionStorage.setItem("seeded", "1");
  }, p);
}

function zdane(ids, extra) {
  const lessons = {};
  ids.forEach((id, i) => { lessons[id] = { attempts: 1, score: 9, total: 10, best: 0.9, done: true, ts: i + 1 }; });
  return Object.assign({ schema: 2, onboarded: true, settings: { lang: "en" }, lessons,
    stats: { correct: 9, wrong: 1, lessonsDone: ids.length, days: {} } }, extra || {});
}

/* Today used to only revise: the next lesson showed up as a pointer at the
   END of the session, so whoever used only Today stopped learning new things. */
test("the next lesson is the primary guided action and opens directly", async ({ page }) => {
  await profil(page, zdane(["a1-u01-l1", "a1-u01-l2"]));
  await oggi(page);
  const journey = page.locator(".journey-today");
  await expect(journey).toBeVisible();
  const nastepna = await page.evaluate(() => window.Core.nextOpenLesson().lesson);
  await expect(journey).toContainText(nastepna.titleIt);
  await expect(journey.locator(".js-next-lesson")).toBeVisible();
  expect((await journey.boundingBox()).y).toBeLessThan((await page.locator(".journey-plan").boundingBox()).y);
  await journey.locator(".js-next-lesson").click();
  await expect(page).toHaveURL(new RegExp("#/lezione\\?id=" + nastepna.id));
});

/* Without mistakes the drill came from a rotation over every topic, numbers
   included, for a student who had not reached them. */
test("without mistakes the drill comes from a lesson already passed", async ({ page }) => {
  await profil(page, zdane(["a1-u01-l1", "a1-u01-l2", "a1-u01-l3", "a1-u01-l4", "a1-u02-l1", "a1-u02-l2"]));
  await oggi(page);
  await page.locator(".journey-plan summary").click();
  const wiersz = page.locator(".journey-plan .list-row").first();
  const etykiety = await page.evaluate(() => ["numeri", "date"].map(id => window.Train.topicLabel(id)));
  const tekst = await wiersz.innerText();
  expect(etykiety.some(e => tekst.indexOf(e) >= 0), tekst).toBe(true);
});

test("a student who passed nothing yet gets the drill as a declared preview", async ({ page }) => {
  await profil(page, zdane([]));
  await oggi(page);
  await page.locator(".journey-plan summary").click();
  await expect(page.locator(".journey-plan .list-row").first()).toContainText(
    await page.evaluate(() => window.I18n.t("today.drillPreview")));
});

/* Adaptive coaching uses measured repeated errors, never an unmeasured claim. */
test("repeated-error guidance appears only after repeated recorded mistakes", async ({ page }) => {
  await oggi(page);
  await expect(page.locator(".journey-today h2")).not.toHaveText(await page.evaluate(() => window.I18n.t("journey.repeated")));
  await page.evaluate(() => {
    const lesson = window.Core.getLesson("a1-u01-l2").lesson;
    for (let index = 0; index < 3; index++) {
      window.Errors.record(lesson, index, false);
      const card = window.Errors.record(lesson, index, false);
      window.Core.state.errors[card.key].due = Date.now() - 1000;
    }
    window.Core.save();
    return new Promise(resolve => setTimeout(resolve, 300));
  });
  await page.reload();
  await expect(page.locator(".journey-today h2")).toHaveText(await page.evaluate(() => window.I18n.t("journey.repeated")));
  await expect(page.locator(".journey-today h2 + p")).toContainText(await page.evaluate(() => window.I18n.t("journey.repeatedWhy")));
});

test("goal-focused drills choose the most repeated error within the learner's goal", async ({ page }) => {
  await oggi(page);
  const selectedTag = await page.evaluate(() => {
    const lesson = window.Core.getLesson("a1-u01-l2").lesson;
    for (let i = 0; i < 4; i++) {
      const card = window.Errors.record(lesson, i, false);
      window.Core.state.errors[card.key].tag = i === 0 ? "g-preposizioni" : "g-presente";
    }
    window.Core.state.learningProfile.goal = "everyday";
    const pick = window.Drills.pickTopic;
    window.Drills.pickTopic = options => { window.__journeyWeakTag = options.weakTag; return pick(options); };
    window.Views.oggi();
    return window.__journeyWeakTag;
  });
  expect(selectedTag).toBe("g-presente");
});

test("after an absence with due review, the dashboard offers review and keeps the exact resume available", async ({ page }) => {
  const away = Date.now() - 4 * 86400000;
  await profil(page, zdane([], { learningProfile: { lastMeaningfulInteractionAt: away } }));
  await oggi(page);
  await zalegleBledy(page, 1);
  await page.evaluate(timestamp => {
    window.LearningJourney.saveResume("a1-u01-l2", 2, [true, false, null, null, null, null, null, null, null]);
    window.Core.state.learningProfile.lastMeaningfulInteractionAt = timestamp;
    Object.values(window.Core.state.errors).forEach(card => { card.ts = timestamp; card.due = timestamp; });
    window.Core.save();
    return new Promise(resolve => setTimeout(resolve, 300));
  }, away);
  await page.reload();
  await expect(page.locator(".journey-today h2")).toHaveText(await page.evaluate(() => window.I18n.t("journey.returnReview")));
  await expect(page.locator(".journey-today h2 + p")).toContainText(await page.evaluate(() => window.I18n.t("journey.returnWhy")));
  await expect(page.locator(".js-resume")).toContainText(await page.evaluate(() => window.I18n.t("journey.resumeSecondary", { i: 3, n: 9 })));
});

test("legacy streak data does not drive or pressure the learning recommendation", async ({ page }) => {
  await profil(page, zdane(["a1-u01-l1"], { streak: { count: 4, lastDay: "2000-01-01", best: 5 } }));
  await oggi(page);
  const title = await page.locator(".journey-today h2").innerText();
  await expect(page.locator(".journey-today")).not.toContainText(/streak|serie/i);
  await page.evaluate(() => { window.Core.state.streak.count = 0; window.App.go("percorso"); window.App.go("oggi"); });
  await expect(page.locator(".journey-today h2")).toHaveText(title);
});

test("a profile with no streak still shows real completion progress", async ({ page }) => {
  await profil(page, zdane([], { streak: { count: 0, lastDay: null, best: 0 } }));
  await oggi(page);
  await expect(page.locator(".journey-progress")).toContainText("0");
  await expect(page.locator(".journey-level-progress progress")).toHaveAttribute("value", "0");
  await expect(page.locator(".journey-today")).not.toContainText(/streak|serie/i);
});

/* The default route was the learning path, a page of about 6500 px: whoever
   comes back every day had to work out what to do. */
test("a student who has started opens the course on Today", async ({ page }) => {
  await profil(page, zdane(["a1-u01-l1"]));
  await page.goto("/index.html");
  await page.waitForFunction(() => window.App && window.Router);
  await expect(page).toHaveURL(/#\/oggi/);
});

test("a student who has only looked around still opens on the path", async ({ page }) => {
  await profil(page, zdane([]));
  // An explicit path bookmark is preserved; the default returning route is Today.
  await page.goto("/index.html#/percorso");
  await page.waitForFunction(() => window.App && window.Router && window.Router.current);
  await page.waitForTimeout(300);
  await expect(page).not.toHaveURL(/#\/oggi/);
  expect(await page.evaluate(() => window.Router.current.route)).toBe("percorso");
});

/* Levels load lazily: with A1 finished, only A1 was loaded at start and the
   next lesson (in A2) was invisible, so Today showed no card at all. */
test("with a level finished, the next lesson comes from the next level", async ({ page }) => {
  const A1 = ["a1-u04-l1","a1-u04-l2","a1-u04-l3","a1-u04-l4","a1-u04-test","a1-u05-l1","a1-u05-l2","a1-u05-l3","a1-u05-l4","a1-u05-test","a1-u06-l1","a1-u06-l2","a1-u06-l3","a1-u06-l4","a1-u06-test","a1-u07-l1","a1-u07-l2","a1-u07-l3","a1-u07-l4","a1-u07-test","a1-u01-l1","a1-u01-l2","a1-u01-l3","a1-u01-l4","a1-u01-test","a1-u02-l1","a1-u02-l2","a1-u02-l3","a1-u02-l4","a1-u02-test","a1-u03-l1","a1-u03-l2","a1-u03-l3","a1-u03-l4","a1-u03-test","a1-u08-l1","a1-u08-l2","a1-u08-l3","a1-u08-l4","a1-u08-test","a1-u09-l1","a1-u09-l2","a1-u09-l3","a1-u09-l4","a1-u09-test","a1-u10-l1","a1-u10-l2","a1-u10-l3","a1-u10-l4","a1-u10-test"];
  await profil(page, zdane(A1));
  await oggi(page);
  await expect(page.locator(".journey-progress .journey-level")).toHaveText("A2");
  const id = await page.evaluate(() => window.Core.nextOpenLesson().lesson.id);
  expect(id).toMatch(/^a2-/);
  await page.locator(".journey-today .js-next-lesson").click();
  await expect(page).toHaveURL(new RegExp("#/lezione\\?id=" + id));
});
