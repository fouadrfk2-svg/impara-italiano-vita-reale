/* global window */
const { expect } = require('@playwright/test');

async function waitForSavedWrongAnswer(page, lessonId, exerciseIndex) {
  await page.waitForFunction(({ id, index }) => {
    const raw = localStorage.getItem('linguai.italiano.v2');
    if (!raw) return false;
    const state = JSON.parse(raw), lesson = state.resume && state.resume.lessons && state.resume.lessons[id];
    return !!lesson && lesson.answers[index] === false;
  }, { id: lessonId, index: exerciseIndex });
}

/** A saved incorrect response stays visible for review and cannot be re-graded. */
async function assertSavedWrongIsReadOnly(page, lessonId, exerciseIndex, activeSelector) {
  await page.locator('.ex-chip[data-go="' + exerciseIndex + '"]').click();
  const current = page.locator(activeSelector);
  await expect(current.locator('.journey-answer')).toBeVisible();
  await expect(current.locator('.journey-answer')).toContainText('للمراجعة');
  const savedAnswer = await page.evaluate(({ id, index }) =>
    window.Core.state.resume.lessons[id].answers[index], { id: lessonId, index: exerciseIndex });
  expect(savedAnswer).toBe(false);
  await expect(current.locator('.js-check,.js-in,.js-cell,.js-gap,.js-sel,[data-orig]')).toHaveCount(0);
}

module.exports = { assertSavedWrongIsReadOnly, waitForSavedWrongAnswer };
