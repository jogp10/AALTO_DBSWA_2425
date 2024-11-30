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

  await page.reload();

  // Check that the question was posted
  const questionPosted = await page.innerText(".question-item a");
  expect(questionPosted).toBe("How do I use Playwright?");
});

test("Upvoting Questions", async ({ page }) => {
  await page.goto("/course/1");

  // Get votes before upvoting
  const buttonBefore = await page.innerText("#questions-list button");
  // Upvote the first question
  await page.click(".upvote-button");

  await page.waitForSelector("#question-form");

  // Get votes after upvoting
  const buttonAfter = await page.innerText("#questions-list button");
  expect(buttonBefore).not.toBe(buttonAfter);
});

test("Viewing and Answering a Question", async ({ page }) => {
  await page.goto("/course/1");

  // Click on the first question
  await page.click(".question-link");

  // Wait for the answer form to appear
  await page.waitForSelector("#answer-form");

  // Fill out the answer form
  await page.fill("#answer-content-textarea", "You can use Playwright like this:");

  // Submit the answer
  await page.click("#submit-answer-button");

  await page.reload();

  // Check that the answer was posted
  const answerPosted = await page.innerText(".answer-content");
  expect(answerPosted).toBe("You can use Playwright like this:");
});

test("Sorting by Recency", async ({ page }) => {
  await page.goto("/course/1");


  // Get the title of the second question (you can use any selector you need)
  const secondQuestionTitle = await page.innerText("ul li:nth-child(2) a");

  // Upvote the second question
  await page.click("ul li:nth-child(2) button");

  await page.waitForTimeout(1000);

  // Get the first question (after the page reload, the upvoted question should be first)
  const firstQuestionTitle = await page.innerText("ul li:nth-child(1) a");

  expect(firstQuestionTitle).toBe(secondQuestionTitle);
});

test("Large Language Model Integration", async ({ page }) => {
  await page.goto("/course/1");

  // Post a question
  await page.fill("#question-title-input", "How do I use LLMs?");
  await page.fill("#question-content-textarea", "I'm having trouble using LLMs.");
  await page.click("#submit-question-button");

  await page.reload();

  // Check that the question was posted
  const questionPosted = await page.innerText(".question-item a");
  expect(questionPosted).toBe("How do I use LLMs?");

  // Click the question
  await page.click(".question-link");
  await page.waitForSelector("#answer-form");

  // Wait for answers saying AI generated
  const aiGeneratedText = await page.waitForSelector(".ai-generated");
  expect(aiGeneratedText).toBeTruthy();
});
