import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadEngine } from "./_harness.mjs";

function journey(now) {
  const box = loadEngine({ files: [], now });
  let saves = 0;
  box.sandbox.Core = {
    state: { schema: 2, onboarded: false, learningProfile: {
      goal: "general", startMode: null, startingLevel: null, dailyMinutes: 20,
      onboardingStep: 1, meaningfulSessions: 0, lastMeaningfulInteractionAt: 0,
      lastCompletedLessonId: null, lastCompletedLevel: null, activitySession: null
    }, resume: { activeLessonId: null, lessons: {} } },
    save() { saves++; }
  };
  const sessionItems = new Map();
  box.sandbox.sessionStorage = {
    getItem(key) { return sessionItems.has(key) ? sessionItems.get(key) : null; },
    setItem(key, value) { sessionItems.set(key, String(value)); }
  };
  box.run("assets/js/learning-journey.js");
  return { api: box.sandbox.LearningJourney, core: box.sandbox.Core, saves: () => saves };
}

describe("personalized learning state", () => {
  test("fresh profiles see onboarding, but legacy progress and a lesson resume never get reclassified", () => {
    const { api } = journey();
    const fresh = { schema: 2, onboarded: false, stats: { days: {}, correct: 0, wrong: 0, lessonsDone: 0 },
      streak: { count: 1 }, learningProfile: {}, resume: { lessons: {} } };
    assert.equal(api.shouldOnboard(fresh), true);
    assert.equal(api.shouldOnboard({ ...fresh, streak: { count: 40 } }), true, "a touched calendar day is not a learning signal");
    assert.equal(api.shouldOnboard({ ...fresh, lessons: { "a1-u01-l1": { done: false, attempts: 1 } } }), false);
    assert.equal(api.shouldOnboard({ ...fresh, writing: { "w-a1": { text: "saved" } } }), false);
    assert.equal(api.shouldOnboard({ ...fresh, resume: { lessons: { "a1-u01-l1": {} } } }), false);
    assert.equal(api.shouldOnboard({ ...fresh, onboarded: true }), false);
  });

  test("onboarding preferences are allowlisted and persist on the authenticated core state", () => {
    const { api, core, saves } = journey();
    api.updateProfile({ goal: "work", startMode: "known", startingLevel: "B1", dailyMinutes: 30, onboardingStep: 4 });
    assert.deepEqual(JSON.parse(JSON.stringify(core.state.learningProfile)), {
      goal: "work", startMode: "known", startingLevel: "B1", dailyMinutes: 30,
      onboardingStep: 4, meaningfulSessions: 0, lastMeaningfulInteractionAt: 0,
      lastCompletedLessonId: null, lastCompletedLevel: null, activitySession: null
    });
    api.updateProfile({ goal: "untrusted", startMode: "admin", startingLevel: "Z9", dailyMinutes: 999, onboardingStep: 99 });
    assert.equal(api.profile().goal, "work");
    assert.equal(api.profile().startingLevel, "B1");
    assert.equal(api.profile().dailyMinutes, 30);
    api.markOnboarded();
    assert.equal(core.state.onboarded, true);
    assert.equal(saves(), 3);
  });

  test("a resume stores only correctness and the exact exercise index, preserving independent lessons", () => {
    const { api, core } = journey();
    const answers = [true, false, null, null];
    assert.equal(api.saveResume("a1-u01-l1", 2, answers), true);
    assert.equal(api.saveResume("a1-u01-l2", 0, [null, null]), true);
    assert.deepEqual(JSON.parse(JSON.stringify(core.state.resume.lessons["a1-u01-l1"].answers)), answers);
    assert.equal(api.resumeFor("a1-u01-l1", 4).exerciseIndex, 2);
    assert.equal(api.activeResume().lessonId, "a1-u01-l2");
    assert.equal(api.saveResume("admin-secret", 0, [null]), false);
    assert.equal(api.resumeFor("a1-u01-l1", 3), null, "changed lesson exercise totals invalidate a stale resume");
    api.clearResume("a1-u01-l2");
    assert.equal(api.activeResume().lessonId, "a1-u01-l1");
    api.clearResume("a1-u01-l1");
    assert.equal(api.activeResume(), null);
  });

  test("a meaningful session counts after three answers or one completed lesson, never twice", () => {
    const { api, core } = journey();
    api.recordInteraction(false);
    api.recordInteraction(false);
    assert.equal(api.profile().meaningfulSessions, 0);
    api.recordInteraction(false);
    assert.equal(api.profile().meaningfulSessions, 1);
    api.recordLessonCompletion("a1-u01-l1", "A1");
    assert.equal(api.profile().meaningfulSessions, 1);
    assert.equal(api.profile().lastCompletedLessonId, "a1-u01-l1");
    assert.equal(api.profile().lastCompletedLevel, "A1");
    const next = journey();
    next.api.recordLessonCompletion("a1-u01-l2", "A1");
    assert.equal(next.api.profile().meaningfulSessions, 1);
    assert.equal(core.state.learningProfile.meaningfulSessions, 1);
  });

  test("resume metrics distinguish current, answered and remaining exercises without inferring correctness", () => {
    const { api } = journey();
    const entry = { exerciseIndex: 4, answers: [true, false, null, null, null, null, null, null, null] };
    assert.deepEqual(JSON.parse(JSON.stringify(api.resumeMetrics(entry, 9))), { current: 5, total: 9, answered: 2, remaining: 7, pct: 22 });
    assert.equal(api.resumeMetrics({ ...entry, exerciseIndex: 9 }, 9), null);
    assert.equal(api.resumeMetrics({ ...entry, answers: ["written answer"] }, 9), null);
    assert.equal(api.resumeMetrics(entry, 8), null);
  });

  test("exercise guidance follows interaction type and fades across the first seven meaningful sessions", () => {
    const { api } = journey();
    assert.equal(api.exerciseGuidance({ t: "mcq" }, 0), "journey.hintChoice");
    assert.equal(api.exerciseGuidance({ t: "mcq" }, 3), null);
    assert.equal(api.exerciseGuidance({ t: "listen" }, 3), "journey.hintListenBrief");
    assert.equal(api.exerciseGuidance({ t: "dialogue" }, 3), "journey.hintDialogueBrief");
    assert.equal(api.exerciseGuidance({ t: "minpair" }, 0), "journey.hintListen");
    assert.equal(api.exerciseGuidance({ t: "cloze" }, 0), "journey.hintWrite");
    assert.equal(api.exerciseGuidance({ t: "trans", dir: "toIt" }, 4), "journey.hintToItalianBrief");
    assert.equal(api.exerciseGuidance({ t: "trans", dir: "toAr" }, 5), null);
    assert.equal(api.exerciseGuidance({ t: "trans", dir: "toIt" }, 5), "journey.hintToItalianLight");
    assert.equal(api.exerciseGuidance({ t: "speak" }, 6), "journey.hintSpeakLight");
    assert.equal(api.exerciseGuidance({ t: "speak" }, 7), null);
  });

  test("dismissing guidance is session-only and does not mutate learner progress", () => {
    const { api, core, saves } = journey();
    assert.equal(api.guidanceDismissed("lesson-a1-u01-l1"), false);
    assert.equal(api.dismissGuidance("lesson-a1-u01-l1"), true);
    assert.equal(api.guidanceDismissed("lesson-a1-u01-l1"), true);
    assert.equal(api.dismissGuidance("bad id"), false);
    assert.equal(saves(), 0);
    assert.equal(core.state.resume.lessons["a1-u01-l1"], undefined);
  });

  test("goal focus copies its tags and absence is based on learning activity, not a streak", () => {
    const { api, core } = journey(10_000_000);
    const tags = api.goalTags("work");
    tags.push("changed");
    assert.equal(api.goalTags("work").includes("changed"), false);
    assert.equal(api.daysSinceInteraction(10_000_000), null);
    api.recordInteraction(false);
    assert.equal(api.daysSinceInteraction(10_000_000 + 3 * 86400000), 3);
    assert.equal(api.completedCount({ lessons: { x: { done: true }, y: { done: false } } }), 1);
    assert.equal(core.state.onboarded, false);
  });
});
