/* ============================================================
   The lesson screen: what the student reads before the exercises.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

async function lezione(page, id) {
  await page.goto("/index.html#/lezione?id=" + id);
  await page.waitForFunction(lid => window.Core && window.Core.getLesson(lid), id);
  await page.waitForSelector(".step");
}

async function chooseExercise(page, index) {
  const menu = page.locator(".js-ex-menu");
  if (await menu.isVisible() && await menu.getAttribute("aria-expanded") !== "true") await menu.click();
  await page.locator('.ex-chip[data-go="' + index + '"]').click();
}

/* A theory block may carry a heading AND a list ({h, list}). The renderer
   used to leave at the heading branch, so the list was never drawn and the
   rule it held (il -> i, lo -> gli) vanished, with the heading still there
   to make the section look complete. */
test("a theory block with a heading keeps its list", async ({ page }) => {
  await lezione(page, "a1-u01-l3");
  const blok = await page.evaluate(() => {
    const L = window.Core.getLesson("a1-u01-l3").lesson;
    return L.theory.find(b => b && b.h && b.list);
  });
  expect(blok, "the lesson has a {h, list} block").toBeTruthy();

  const naglowek = page.locator(".prose h4", { hasText: blok.h });
  await expect(naglowek).toHaveCount(1);
  const lista = naglowek.locator("xpath=following-sibling::*[1]");
  await expect(lista).toHaveJSProperty("tagName", "UL");
  await expect(lista.locator("li")).toHaveCount(blok.list.length);
});

/* The star alone did not say what it does: the label names the effect, and
   follows the state when the word goes in and out of the reviews. */
test("the vocabulary star says it adds the word to the reviews", async ({ page }) => {
  await lezione(page, "a1-u01-l3");
  const gwiazda = page.locator(".js-star").first();
  const przed = (await gwiazda.innerText()).trim();
  expect(przed.length, "a label next to the star").toBeGreaterThan(1);
  await gwiazda.click();
  await expect(gwiazda).toHaveAttribute("aria-pressed", "true");
  const po = (await gwiazda.innerText()).trim();
  expect(po, "the label changes with the state").not.toBe(przed);
  await gwiazda.click();
  await expect(gwiazda).toHaveAttribute("aria-pressed", "false");
  await expect(gwiazda).toHaveText(przed);
});

/* Answers every exercise of the open lesson with a deliberately wrong text
   where there is a field, so that the run reaches its end with mistakes in
   it. Speech recognition is removed before the page loads: a "speak"
   exercise then finishes on a click, the case the course already handles. */
async function bezMowy(page) {
  await page.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
}

async function odpowiedzNaWszystko(page) {
  await page.evaluate(async () => {
    for (const root of document.querySelectorAll(".exq")) {
      const btn = root.querySelector(".js-check");
      if (!btn || btn.disabled) continue;
      root.querySelectorAll(".js-in, .js-gap").forEach(i => { i.value = "zzz sbagliato"; });
      const radio = root.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      const box = root.querySelector('input[type="checkbox"]');
      if (box) box.checked = true;
      root.querySelectorAll(".js-bank .tok").forEach(t => t.click());
      btn.click();
      if (!btn.disabled && btn.isConnected) btn.click();   // "almost" asks for a second try
    }
    await new Promise(r => setTimeout(r, 300));
  });
}

const PROSTA = "a1-u07-l1";

test("the exercises come one at a time, with Next", async ({ page }) => {
  await lezione(page, PROSTA);
  const widoczne = page.locator(".exq:visible");
  await expect(widoczne).toHaveCount(1);
  const pierwsze = await widoczne.getAttribute("data-idx");
  await page.locator(".js-ex-next").click();
  await expect(page.locator(".exq:visible")).toHaveCount(1);
  expect(await page.locator(".exq:visible").getAttribute("data-idx")).not.toBe(pierwsze);
  await expect(page.locator(".js-ex-pos")).toContainText("2");
});

test("numbered chips show what is still open and lead to it", async ({ page }) => {
  await lezione(page, PROSTA);
  const ile = await page.locator(".exq").count();
  const chipy = page.locator(".ex-chip");
  await expect(chipy).toHaveCount(ile);
  await chipy.nth(2).click();
  await expect(chipy.nth(2)).toHaveAttribute("aria-current", "step");
  expect(await page.locator(".exq:visible").getAttribute("data-idx")).toBe("2");
  await expect(page.locator(".js-ex-open")).toContainText(String(ile));
});

test("mobile exercises keep progress in flow and the Next control clear of the menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 920 });
  await lezione(page, "a1-u04-l4");
  await page.evaluate(() => new Promise(resolve => window.Core.setLanguage("ar", resolve)));
  await page.evaluate(() => window.LearningJourney.saveResume("a1-u04-l4", 5,
    [false, true, true, true, true, true, null, null, null, null]));
  await page.reload();
  await lezione(page, "a1-u04-l4");
  for (let index = 0; index < 6; index++) {
    await chooseExercise(page, index);
    await expect(page.locator(".exq:visible .journey-answer")).toBeVisible();
  }
  await chooseExercise(page, 6);
  const active = page.locator(".exq:visible");
  await expect(active).toHaveAttribute("data-idx", "6");
  await active.locator(".js-gap").nth(0).fill("i");
  await active.locator(".js-gap").nth(1).fill("o");
  await active.locator(".js-check").click();
  await expect(active).toHaveClass(/exq--ok/);
  await page.waitForFunction(() => new Promise(resolve => {
    let last = window.scrollY, stableFrames = 0;
    function sample() {
      const current = window.scrollY;
      stableFrames = Math.abs(current - last) < 1 ? stableFrames + 1 : 0;
      last = current;
      if (stableFrames >= 3) resolve(true);
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));

  const nextButton = page.locator(".js-ex-next");
  await expect(nextButton).toBeVisible();
  await nextButton.scrollIntoViewIfNeeded();
  const hitTest = await nextButton.evaluate(button => {
    const rect = button.getBoundingClientRect();
    const toggle = document.getElementById("railToggle");
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const target = document.elementFromPoint(x, y);
    return { x, y, menuBottom: toggle.getBoundingClientRect().bottom,
      menuPosition: getComputedStyle(toggle).position, blocked: target !== button && !button.contains(target) };
  });
  expect(hitTest.menuPosition, "the top menu shortcut scrolls away instead of covering lesson content").toBe("absolute");
  expect(hitTest.menuBottom, "the top menu shortcut is no longer over the exercise area").toBeLessThanOrEqual(0);
  expect(hitTest.blocked, "the Next control receives pointer events when the learner moves through a task").toBe(false);
  await nextButton.click();
  await expect(page.locator(".exq:visible")).toHaveAttribute("data-idx", "7");
});

test("the sections of a lesson can be jumped to", async ({ page }) => {
  await lezione(page, PROSTA);
  const kroki = page.locator(".lesson-steps [data-step]");
  expect(await kroki.count()).toBeGreaterThanOrEqual(3);
  await page.locator('.lesson-steps [data-step="ex"]').click();
  await expect(page.locator("#step-ex")).toBeInViewport();
});

test("exercise guidance matches the task, and progress counts answers rather than visits", async ({ page }) => {
  await lezione(page, "a1-u01-l1");
  const active = page.locator(".exq:visible");
  const type = await page.evaluate(() => window.Core.getLesson("a1-u01-l1").lesson.exercises[0].t);
  const expectedHint = await page.evaluate(taskType => {
    const key = window.LearningJourney.exerciseGuidance({ t: taskType }, window.LearningJourney.profile().meaningfulSessions);
    return key && window.I18n.t(key);
  }, type);
  if (expectedHint) {
    await expect(page.locator(".journey-ex-guidance")).toBeVisible();
    await expect(page.locator(".journey-ex-guidance__text")).toHaveText(expectedHint);
  } else {
    await expect(page.locator(".journey-ex-guidance")).toBeHidden();
  }
  await expect(page.locator(".js-ex-answered")).toContainText(await page.evaluate(() =>
    window.I18n.t("journey.answeredProgress", { done: 0, total: 9, remaining: 9 })));

  await active.locator(".opt").first().click();
  await active.locator(".js-check").click();
  await expect(active.locator(".fb")).toBeVisible();
  await expect(page.locator(".lesson-top__bar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".js-ex-answered")).toContainText(await page.evaluate(() =>
    window.I18n.t("journey.answeredProgress", { done: 1, total: 9, remaining: 8 })));
  await expect(page.locator('.ex-chip[aria-current="step"]')).toHaveAttribute("data-go", "0");
});

test("lesson navigation stays readable and touchable across phone, tablet, and desktop widths", async ({ page }) => {
  await lezione(page, "a1-u01-l1");
  for (const width of [320, 360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "lesson has no horizontal page overflow at " + width).toBe(true);
    const targets = await page.locator(".lesson-steps__btn, .ex-chip, .ex-foot .btn").evaluateAll(nodes =>
      nodes.map(node => {
        const rect = node.getBoundingClientRect();
        return { name: node.className, width: rect.width, height: rect.height };
      }));
    expect(targets.length, "lesson navigation controls exist at " + width).toBeGreaterThan(0);
    for (const target of targets) {
      expect(target.width, target.name + " width at " + width).toBeGreaterThanOrEqual(44);
      expect(target.height, target.name + " height at " + width).toBeGreaterThanOrEqual(44);
    }
  }
});

/** An A1 lesson whose exercises all answer through a field or a choice. */
async function lekcjaZPolami(page) {
  await page.goto("/index.html#/percorso");
  await page.waitForFunction(() => window.Core && window.Core.getLesson("a1-u02-l1"));
  return page.evaluate(() => {
    const PROSTE = ["mcq", "fill", "trans", "listen", "speak", "conj", "cloze", "order", "multi"];
    for (const u of window.Core.registry.byCode.A1.units) {
      for (const l of u.lessons) {
        const L = window.Core.getLesson(l.id);
        if (L && L.lesson.exercises.every(e => PROSTE.indexOf(e.t) >= 0)) return l.id;
      }
    }
    return null;
  });
}

test("the end lists what went wrong, and a failed run adds no words", async ({ page }) => {
  await bezMowy(page);
  const id = await lekcjaZPolami(page);
  expect(id, "an A1 lesson answerable through fields").toBeTruthy();
  await lezione(page, id);
  await odpowiedzNaWszystko(page);
  await expect(page.locator(".summary")).toBeVisible();

  const zle = await page.locator(".ex-chip.is-ko").count();
  expect(zle, "wrong text in the fields makes mistakes").toBeGreaterThan(0);
  await expect(page.locator(".lesson-recap [data-go]")).toHaveCount(zle);
  await page.locator(".lesson-recap [data-go]").first().click();
  await expect(page.locator(".exq:visible")).toHaveCount(1);

  await expect(page.locator(".lesson-vocab-in")).toHaveCount(0);
});

test("finishing a level names its existing outcomes and opens the first lesson of the next level", async ({ page }) => {
  await bezMowy(page);
  await page.goto("/index.html#/percorso?level=A1");
  await page.waitForFunction(() => window.Core.registry.loaded.A1 === true && window.Core.registry.byCode.A1.units.length > 0);
  const lastLesson = await page.evaluate(() => {
    const level = window.Core.registry.byCode.A1, lessons = [];
    level.units.forEach(unit => { lessons.push(...unit.lessons); if (unit.test) lessons.push(unit.test); });
    const last = lessons[lessons.length - 1];
    lessons.slice(0, -1).forEach(item => {
      const total = (item.exercises || []).length;
      if (total) window.Core.recordLesson(item.id, total, total, 1);
    });
    const original = window.Core.recordLesson;
    window.Core.recordLesson = (id, score, total, seconds) => original(id, total, total, seconds);
    return last.id;
  });
  await page.evaluate(id => window.App.go("lezione", { id }), lastLesson);
  await expect(page.locator(".step").first()).toBeVisible();
  await odpowiedzNaWszystko(page);
  const milestone = page.locator(".summary .journey-level-complete");
  await expect(milestone).toBeVisible();
  await expect(milestone).toContainText("A1");
  await expect(milestone.locator("p").last()).toContainText(await page.evaluate(() => window.Core.registry.byCode.A1.desc));
  const next = await page.evaluate(() => window.Core.nextLesson(window.Core.registry.byCode.A2).lesson);
  await expect(page.locator(".summary .js-next")).toContainText(next.titleIt);
  await page.locator(".summary .js-next").click();
  await expect(page).toHaveURL(new RegExp("#/lezione\\?id=" + next.id));
});

/* A lesson passed for the first time puts its words in the reviews. Only
   then: adding them at every run brought back the words a student had
   deleted from the vocabulary, and a failed run will be taken again. The
   score is forced through the facade so the test does not depend on
   answering every exercise type right. */
test("a lesson passed for the first time puts its words in the reviews, a retake does not", async ({ page }) => {
  await bezMowy(page);
  const id = await lekcjaZPolami(page);
  await lezione(page, id);
  await page.evaluate(() => {
    const zapisz = window.Core.recordLesson;
    window.Core.recordLesson = (lid, s, total, sec) => zapisz(lid, total, total, sec);
  });
  await odpowiedzNaWszystko(page);
  await expect(page.locator(".lesson-vocab-in")).toBeVisible();
  const brak = await page.evaluate(lid => {
    const L = window.Core.getLesson(lid).lesson;
    return L.vocab.filter(v => !window.Core.state.srs[window.Core.cardKey(v.it)]).map(v => v.it);
  }, id);
  expect(brak, "words missing from the reviews").toEqual([]);

  const usuniete = await page.evaluate(lid => {
    /* The last word, not the first: a mistake still adds the lesson's first
       four words (views-lesson.js, onAnswer), a separate older rule. */
    const v = window.Core.getLesson(lid).lesson.vocab;
    const it = v[v.length - 1].it;
    delete window.Core.state.srs[window.Core.cardKey(it)];
    return it;
  }, id);
  await page.evaluate(lid => window.App.go("lezione", { id: lid }), id);
  await page.waitForSelector(".exq");
  await page.evaluate(() => {
    const zapisz = window.Core.recordLesson;
    window.Core.recordLesson = (lid, s, total, sec) => zapisz(lid, total, total, sec);
  });
  await odpowiedzNaWszystko(page);
  await expect(page.locator(".summary")).toBeVisible();
  expect(await page.evaluate(it => !!window.Core.state.srs[window.Core.cardKey(it)], usuniete),
    "a deleted word stays deleted after a retake").toBe(false);
});

/* On a phone the grammar table scrolls sideways; a scrolling region that
   the keyboard cannot reach hides half the table from it (axe:
   scrollable-region-focusable). */
test("the grammar table's scrolling box can be reached from the keyboard", async ({ page }) => {
  await lezione(page, "a1-u01-l3");
  const box = page.locator(".step--gram .table-wrap").first();
  await expect(box).toHaveAttribute("tabindex", "0");
  await expect(box).toHaveAttribute("role", "region");
  await expect(box).toHaveAttribute("aria-label", /.+/);
});

/* An answer can report late (the model judge answers over the network). If
   it lands after the student moved to another lesson, it must count for
   nothing there: the run and the score are per lesson. */
test("a late answer from a lesson already left changes nothing in the new one", async ({ page }) => {
  const bledy = [];
  page.on("pageerror", e => bledy.push(String(e)));
  await lezione(page, "a1-u01-l3");
  await page.evaluate(() => { window.__stary = document.querySelector('.exq input[type="radio"]').closest(".exq"); });
  await page.evaluate(() => window.App.go("lezione", { id: "a1-u01-l2" }));
  await page.waitForFunction(() => document.querySelector(".exq") && !document.contains(window.__stary));
  const przed = await page.locator(".ex-chip.is-ok, .ex-chip.is-ko").count();
  await page.evaluate(() => {
    const r = window.__stary;
    r.querySelector('input[type="radio"]').checked = true;
    r.querySelector(".js-check").click();
  });
  await page.waitForTimeout(200);
  expect(bledy, "no error from the late answer").toEqual([]);
  await expect(page.locator(".ex-chip.is-ok, .ex-chip.is-ko")).toHaveCount(przed);
  await expect(page.locator("#lessonScore")).toHaveText(/^0\//);
});
