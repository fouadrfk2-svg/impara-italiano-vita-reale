/* Account-backed onboarding, lesson resume, and contextual learning guidance.
   Persist only profile choices and answer correctness; never typed responses. */
(function (global) {
  "use strict";
  var GOALS = ["everyday", "work", "a2-exam", "b1-exam", "general"];
  var STARTS = ["zero", "known", "placement"];
  var MINUTES = [10, 20, 30];
  var LESSON_ID = /^[a-c][12]-u\d{2}-(?:l\d{1,2}|test)$/i;
  var GOAL_TAGS = {
    everyday: ["g-preposizioni", "g-articolo-det", "g-frase", "g-presente"],
    work: ["g-prep-verbi", "g-frase", "g-presente", "g-passato-prossimo"],
    "a2-exam": ["g-presente", "g-passato-prossimo", "g-imperfetto", "g-futuro", "g-preposizioni"],
    "b1-exam": ["g-congiuntivo-pres", "g-condizionale", "g-connettivi", "g-relativi", "g-passato-prossimo"],
    general: []
  };
  function freshProfile() {
    return { goal: "general", startMode: null, startingLevel: null, dailyMinutes: 20,
      onboardingStep: 1, meaningfulSessions: 0, lastMeaningfulInteractionAt: 0,
      lastCompletedLessonId: null, lastCompletedLevel: null, activitySession: null };
  }
  function plain(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
  function cleanLevel(value) { return typeof value === "string" && /^(?:A[12]|B[12]|C[12])$/.test(value) ? value : null; }
  function profile() {
    var state = global.Core.state;
    if (!plain(state.learningProfile)) state.learningProfile = freshProfile();
    var p = state.learningProfile, defaults = freshProfile();
    Object.keys(defaults).forEach(function (key) { if (p[key] === undefined) p[key] = defaults[key]; });
    if (GOALS.indexOf(p.goal) < 0) p.goal = "general";
    if (STARTS.indexOf(p.startMode) < 0) p.startMode = null;
    p.startingLevel = cleanLevel(p.startingLevel);
    if (MINUTES.indexOf(p.dailyMinutes) < 0) p.dailyMinutes = 20;
    if (!Number.isInteger(p.onboardingStep) || p.onboardingStep < 1 || p.onboardingStep > 5) p.onboardingStep = 1;
    if (!Number.isSafeInteger(p.meaningfulSessions) || p.meaningfulSessions < 0) p.meaningfulSessions = 0;
    if (!Number.isFinite(p.lastMeaningfulInteractionAt) || p.lastMeaningfulInteractionAt < 0) p.lastMeaningfulInteractionAt = 0;
    if (p.lastCompletedLessonId !== null && (typeof p.lastCompletedLessonId !== "string" || !LESSON_ID.test(p.lastCompletedLessonId))) p.lastCompletedLessonId = null;
    if (p.lastCompletedLevel !== null && !cleanLevel(p.lastCompletedLevel)) p.lastCompletedLevel = null;
    var activity = p.activitySession;
    if (!plain(activity) || !Number.isFinite(activity.lastAt) || !Number.isFinite(activity.startedAt) ||
      !Number.isSafeInteger(activity.interactions) || activity.interactions < 0 || typeof activity.counted !== "boolean") p.activitySession = null;
    return p;
  }
  function hasPriorActivity(state) {
    if (!plain(state)) return false;
    var stats = state.stats || {};
    return Object.keys(state.lessons || {}).length > 0 || Object.keys(state.srs || {}).length > 0 ||
      Object.keys(state.saved || {}).length > 0 || Object.keys(state.writing || {}).length > 0 ||
      Object.keys(state.errors || {}).length > 0 || Object.keys(state.drills || {}).length > 0 ||
      Object.keys(state.library || {}).length > 0 || (Array.isArray(state.reviews) && state.reviews.length > 0) ||
      !!state.placement || !!(state.cils && Array.isArray(state.cils.runs) && state.cils.runs.length) ||
      Number(stats.lessonsDone || 0) > 0 || Number(stats.correct || 0) > 0 || Number(stats.wrong || 0) > 0 ||
      Number(state.xp || 0) > 0 || Number(state.minutes || 0) > 0 ||
      !!(state.resume && state.resume.lessons && Object.keys(state.resume.lessons).length);
  }
  function shouldOnboard(state) { return !!state && state.onboarded !== true && !hasPriorActivity(state); }
  function updateProfile(patch) {
    var p = profile();
    Object.keys(patch || {}).forEach(function (key) {
      if (key === "goal" && GOALS.indexOf(patch[key]) >= 0) p.goal = patch[key];
      else if (key === "startMode" && STARTS.indexOf(patch[key]) >= 0) p.startMode = patch[key];
      else if (key === "startingLevel" && (patch[key] === null || cleanLevel(patch[key]))) p.startingLevel = cleanLevel(patch[key]);
      else if (key === "dailyMinutes" && MINUTES.indexOf(patch[key]) >= 0) p.dailyMinutes = patch[key];
      else if (key === "onboardingStep" && Number.isInteger(patch[key]) && patch[key] >= 1 && patch[key] <= 5) p.onboardingStep = patch[key];
    });
    global.Core.state.learningProfile = p;
    global.Core.save();
    return p;
  }
  function markOnboarded() {
    global.Core.state.onboarded = true;
    updateProfile({ onboardingStep: 5 });
  }
  function emptyResume() { return { activeLessonId: null, lessons: {} }; }
  function resumeStore() {
    var state = global.Core.state;
    if (!plain(state.resume) || !plain(state.resume.lessons)) state.resume = emptyResume();
    var id = state.resume.activeLessonId;
    if (id !== null && (typeof id !== "string" || !LESSON_ID.test(id) || !state.resume.lessons[id])) state.resume.activeLessonId = null;
    return state.resume;
  }
  function validAnswers(answers, total) {
    return Array.isArray(answers) && answers.length === total && total > 0 && total <= 1000 &&
      answers.every(function (value) { return value === null || typeof value === "boolean"; });
  }
  function resumeFor(id, total) {
    if (typeof id !== "string" || !LESSON_ID.test(id)) return null;
    var entry = resumeStore().lessons[id];
    if (!plain(entry) || !validAnswers(entry.answers, total) || !Number.isInteger(entry.exerciseIndex) ||
      entry.exerciseIndex < 0 || entry.exerciseIndex >= total || !Number.isFinite(entry.startedAt) ||
      entry.startedAt < 0 || !Number.isFinite(entry.updatedAt) || entry.updatedAt < 0) return null;
    return { lessonId: id, exerciseIndex: entry.exerciseIndex, answers: entry.answers.slice(),
      startedAt: entry.startedAt, updatedAt: entry.updatedAt };
  }
  function validResumeEntry(id, entry) {
    return typeof id === "string" && LESSON_ID.test(id) && plain(entry) && Array.isArray(entry.answers) &&
      entry.answers.length > 0 && entry.answers.every(function (v) { return v === null || typeof v === "boolean"; }) &&
      Number.isInteger(entry.exerciseIndex) && entry.exerciseIndex >= 0 && entry.exerciseIndex < entry.answers.length &&
      Number.isFinite(entry.startedAt) && Number.isFinite(entry.updatedAt);
  }
  function activeResume() {
    var state = resumeStore(), id = state.activeLessonId, entry = id && state.lessons[id];
    if (validResumeEntry(id, entry)) return { lessonId: id, exerciseIndex: entry.exerciseIndex,
      answers: entry.answers.slice(), startedAt: entry.startedAt, updatedAt: entry.updatedAt };
    var ids = Object.keys(state.lessons).filter(function (key) { return validResumeEntry(key, state.lessons[key]); });
    ids.sort(function (a, b) { return state.lessons[b].updatedAt - state.lessons[a].updatedAt; });
    if (!ids.length) return null;
    id = ids[0]; entry = state.lessons[id];
    return { lessonId: id, exerciseIndex: entry.exerciseIndex, answers: entry.answers.slice(),
      startedAt: entry.startedAt, updatedAt: entry.updatedAt };
  }
  function saveResume(id, index, answers) {
    if (typeof id !== "string" || !LESSON_ID.test(id) || !Array.isArray(answers) ||
      answers.length < 1 || answers.length > 1000 || !Number.isInteger(index) || index < 0 || index >= answers.length) return false;
    var clean = answers.map(function (value) { return value === true ? true : value === false ? false : null; });
    var state = resumeStore(), old = state.lessons[id], now = Date.now();
    state.lessons[id] = { exerciseIndex: index, answers: clean,
      startedAt: old && Number.isFinite(old.startedAt) ? old.startedAt : now, updatedAt: now };
    state.activeLessonId = id;
    global.Core.save();
    return true;
  }
  function clearResume(id) {
    var state = resumeStore();
    if (id) delete state.lessons[id]; else state.lessons = {};
    if (state.activeLessonId === id || !state.lessons[state.activeLessonId]) {
      state.activeLessonId = null;
      var next = activeResume();
      if (next) state.activeLessonId = next.lessonId;
    }
    global.Core.save();
  }
  function goalTags(goal) { return (GOAL_TAGS[GOALS.indexOf(goal) >= 0 ? goal : "general"] || []).slice(); }
  function completedCount(state) {
    state = state || global.Core.state;
    return Object.keys(state.lessons || {}).filter(function (id) { return !!(state.lessons[id] && state.lessons[id].done); }).length;
  }
  function recordInteraction(completed) {
    var p = profile(), now = Date.now(), activity = p.activitySession;
    if (!activity || now < activity.lastAt || now - activity.lastAt > 3600000) {
      activity = { startedAt: now, lastAt: now, interactions: 0, counted: false };
    }
    activity.lastAt = now;
    activity.interactions++;
    if (!activity.counted && (activity.interactions >= 3 || completed === true)) {
      p.meaningfulSessions = Math.min(100000, p.meaningfulSessions + 1);
      activity.counted = true;
    }
    p.activitySession = activity;
    p.lastMeaningfulInteractionAt = now;
    global.Core.state.learningProfile = p;
    global.Core.save();
    return p.meaningfulSessions;
  }
  function recordLessonCompletion(id, level) {
    recordInteraction(true);
    var p = profile();
    if (typeof id === "string" && LESSON_ID.test(id)) p.lastCompletedLessonId = id;
    p.lastCompletedLevel = cleanLevel(level);
    p.lastMeaningfulInteractionAt = Date.now();
    global.Core.state.learningProfile = p;
    global.Core.save();
  }
  function lastInteractionAt(state) {
    state = state || global.Core.state;
    var p = state.learningProfile;
    var latest = p && Number.isFinite(p.lastMeaningfulInteractionAt) ? p.lastMeaningfulInteractionAt : 0;
    Object.keys(state.lessons || {}).forEach(function (id) {
      var record = state.lessons[id];
      if (record && Number.isFinite(record.ts)) latest = Math.max(latest, record.ts);
    });
    Object.keys(state.errors || {}).forEach(function (id) {
      var record = state.errors[id];
      if (record && Number.isFinite(record.ts)) latest = Math.max(latest, record.ts);
    });
    (state.reviews || []).forEach(function (record) {
      if (record && Number.isFinite(record.t)) latest = Math.max(latest, record.t);
    });
    return latest || null;
  }
  function daysSinceInteraction(now, state) {
    var latest = lastInteractionAt(state);
    return latest ? Math.max(0, Math.floor(((now || Date.now()) - latest) / 86400000)) : null;
  }
  global.LearningJourney = {
    GOALS: GOALS.slice(), STARTS: STARTS.slice(), MINUTES: MINUTES.slice(),
    profile: profile, hasPriorActivity: hasPriorActivity, shouldOnboard: shouldOnboard,
    updateProfile: updateProfile, markOnboarded: markOnboarded, resumeFor: resumeFor,
    activeResume: activeResume, saveResume: saveResume, clearResume: clearResume,
    goalTags: goalTags, completedCount: completedCount, recordInteraction: recordInteraction,
    recordLessonCompletion: recordLessonCompletion, lastInteractionAt: lastInteractionAt,
    daysSinceInteraction: daysSinceInteraction,
    validLessonId: function (id) { return typeof id === "string" && LESSON_ID.test(id); }
  };
})(window);
