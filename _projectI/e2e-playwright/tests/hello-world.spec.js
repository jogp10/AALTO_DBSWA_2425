const { test, expect } = require("@playwright/test");

test("Server responds with a page with the title 'Programming assignments'", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.title()).toBe("Programming assignments");
});

test.describe("End-to-End Tests for Assignment Submissions", () => {
  // Test 1: Creating a submission that fails and checking feedback on incorrect submission
  test("Should create a failed submission and check feedback", async ({
    page,
  }) => {
    await page.goto("/");

    // Select the assignment and submit incorrect code
    await page.fill("#codeEditor", "def hello(): return -1");
    await page.click("#submitButton");

    // Wait for the processing to complete and check feedback
    await page.waitForSelector("#submission_feedback", { state: "visible" });
    const submissionFeedback = await page.locator("#submission_feedback").textContent();
    expect(submissionFeedback).toContain("FAIL");
  });

  // Test 2: Creating a submission that passes and checking success notification
  test("Should create a successful submission and check success notification", async ({
    page,
  }) => {
    await page.goto("/");

    // Select the assignment and submit correct code
    await page.fill("#codeEditor", "def hello(): return \"Hello\"");
    await page.click("#submitButton");

    // Wait for the success message and check success notification
    await page.waitForSelector("#successMessage", { state: "visible" });
    const successMessage = await page.locator("#successMessage").textContent();
    expect(successMessage).toContain(
      "You have successfully completed this assignment"
    );
  });

  // Test 3: Create a successful submission, verify, and move to the next assignment
  test("Should submit a correct submission, verify it, and proceed to next assignment", async ({
    page,
  }) => {
    await page.goto("/");

    const oldTitle = await page.locator("#assignmentTitle").textContent();

    // Submit correct code for the current assignment
    await page.fill("#codeEditor", "def hello(): return \"Hello\"");
    await page.click("#submitButton");

    // Check the success message
    await page.waitForSelector("#successMessage", { state: "visible" });
    const successMessage = await page.locator("#successMessage").textContent();
    expect(successMessage).toContain(
      "You have successfully completed this assignment"
    );

    await page.click("#nextAssignmentButton");

    // Verify that a new assignment loaded
    const newAssignmentTitle = await page
      .locator("#assignmentTitle")
      .textContent();
    expect(newAssignmentTitle).not.toBe(null);
    
    expect(newAssignmentTitle).not.toBe(oldTitle);
  });
});


test.describe("Points Update Tests on Assignment Completion", () => {
  
  // Test: Check points increase after solving an assignment correctly
  test("Should update points after solving an assignment", async ({ page }) => {
    await page.goto("/");

    // Capture the initial points shown to the user
    const initialPointsText = await page.locator("#pointsDisplay").textContent();
    const initialPoints = parseInt(initialPointsText);

    // Start the assignment, submit correct code
    await page.fill("#codeEditor", 'def hello(): return "Hello"');
    await page.click("#submitButton");

    // Wait for success notification
    await page.waitForSelector("#successMessage", { state: "visible" });
    const successMessage = await page.locator("#successMessage").textContent();
    expect(successMessage).toContain("You have successfully completed this assignment");

    await page.click("#nextAssignmentButton");

    await page.waitForSelector("#codeEditor", { state: "visible" });

    const updatedPointsText = await page.locator("#pointsDisplay").textContent();
    const updatedPoints = parseInt(updatedPointsText);

    // Check that points have increased
    expect(updatedPoints).toBeGreaterThan(initialPoints);
  });

  // Test: Points should not change after a failed submission
  test("Should not update points after a failed submission", async ({ page }) => {
    await page.goto("/");

    // Capture the initial points shown to the user
    const initialPointsText = await page.locator("#pointsDisplay").textContent();
    const initialPoints = parseInt(initialPointsText);

    // Start the assignment and submit incorrect code
    await page.fill("#codeEditor", "def hello(): return -1");
    await page.click("#submitButton");

    await page.waitForSelector("#submission_feedback", { state: "visible" });
    const submissionFeedback = await page.locator("#submission_feedback").textContent();
    expect(submissionFeedback).toContain("FAIL");

    const pointsAfterFailureText = await page.locator("#pointsDisplay").textContent();
    const pointsAfterFailure = parseInt(pointsAfterFailureText);

    expect(pointsAfterFailure).toBe(initialPoints);
  });
});
