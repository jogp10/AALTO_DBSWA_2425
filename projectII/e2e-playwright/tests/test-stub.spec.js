const { test, expect } = require("@playwright/test");

test("Test stub", async ({ page }) => {
  await page.goto("/");
});

test("Course Selection and Question Posting", async ({ page }) => {
  await page.goto("/");

  // Select a course
  await page.click(".course-link");

  // Fill out the question form
  await page.fill("#question-title-input", "How do I use Playwright?");
  await page.fill("#question-content-textarea", "I'm having trouble using Playwright.");

  // Submit the form
  await page.click("#submit-question-button");

  // Check that the question was posted
  const questionPosted = await page.waitForSelector(".question-item a >> text=How do I use Playwright?");
  expect(questionPosted).toBeTruthy();
});

test("Upvoting Questions", async ({ page }) => {
  await page.goto("/course/1");

  // Get votes before upvoting
  const votesBefore = await page.innerText(".question-votes");
  // Upvote the first question
  await page.click(".upvote-button");

  // Get votes after upvoting
  const votesAfter = await page.innerText(".question-votes");
  expect(votesBefore).not.toBe(votesAfter);
});

test("Viewing and Answering a Question", async ({ page }) => {
  await page.goto("/course/1");

  // Click on the first question
  await page.click("text=How do I use Playwright?");

  // Wait for the answer form to appear
  await page.waitForSelector("#answer-form");

  // Fill out the answer form
  await page.fill("#answer-content-textarea", "You can use Playwright like this:");

  // Submit the answer
  await page.click("#submit-answer-button");

  // Check that the answer was posted
  const answerPosted = await page.waitForSelector("text=You can use Playwright like this:");
  expect(answerPosted).toBeTruthy();
});

test("Sorting by Recency", async ({ page }) => {
  await page.goto("/course/1");

  // Get the second question by selecting the second list item
  const secondQuestion = await page.locator("ul li:nth-child(2)");

  // Get the title of the second question (you can use any selector you need)
  const secondQuestionTitle = await secondQuestion.locator("a").innerText();

  // Upvote the second question
  await secondQuestion.locator('button:has-text("Upvote")').click();

  // Reload the page
  await page.reload();

  // Get the first question (after the page reload, the upvoted question should be first)
  const firstQuestion = await page.locator("ul li:nth-child(1)");

  // Verify that the title of the first question after reload is the same as the title of the second question before reload
  const firstQuestionTitle = await firstQuestion.locator("a").innerText();
  expect(firstQuestionTitle).toBe(secondQuestionTitle);
});

test("Large Language Model Integration", async ({ page }) => {
  await page.goto("/course/1");

  // Post a question
  await page.fill("#question-title-input", "How do I use Playwright?");
  await page.fill("#question-content-textarea", "I'm having trouble using Playwright.");
  await page.click("#submit-question-button");

  // Check that the question was posted
  const questionPosted = await page.waitForSelector("#question-title-How-do-I-use-Playwright?");
  expect(questionPosted).toBeTruthy();

  // Click the question
  await page.click("#question-title-How-do-I-use-Playwright?");
  await page.waitForSelector("#answer-form");

  // Wait for answers saying AI generated
  const aiGeneratedText = await page.waitForSelector("text=AI Generated answer");
  expect(aiGeneratedText).toBeTruthy();
});
