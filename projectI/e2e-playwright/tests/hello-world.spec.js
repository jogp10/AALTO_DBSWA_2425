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
    await page.goto("/assignments");

    // Select the assignment and submit incorrect code
    await page.click("text=Start Assignment");
    await page.fill("#codeEditor", "incorrect code"); // replace with specific failing code
    await page.click("#submitButton");

    // Wait for the processing to complete and check feedback
    await page.waitForSelector("#feedback", { state: "visible" });
    const feedback = await page.locator("#feedback").textContent();
    expect(feedback).toContain("Incorrect submission");
  });

  // Test 2: Creating a submission that passes and checking success notification
  test("Should create a successful submission and check success notification", async ({
    page,
  }) => {
    await page.goto("/assignments");

    // Select the assignment and submit correct code
    await page.click("text=Start Assignment");
    await page.fill("#codeEditor", "correct code"); // replace with specific correct code
    await page.click("#submitButton");

    // Wait for the processing to complete and check success notification
    await page.waitForSelector("#successNotification", { state: "visible" });
    const successNotification = await page
      .locator("#successNotification")
      .textContent();
    expect(successNotification).toContain("Correct submission");
  });

  // Test 3: Create a successful submission, verify, and move to the next assignment
  test("Should submit a correct submission, verify it, and proceed to next assignment", async ({
    page,
  }) => {
    await page.goto("/assignments");

    // Submit correct code for the current assignment
    await page.click("text=Start Assignment");
    await page.fill("#codeEditor", "correct code"); // replace with specific correct code
    await page.click("#submitButton");

    // Check the success notification
    await page.waitForSelector("#successNotification", { state: "visible" });
    const successNotification = await page
      .locator("#successNotification")
      .textContent();
    expect(successNotification).toContain("Correct submission");

    // Move to the next assignment
    await page.click("#nextAssignmentButton");

    // Verify that the new assignment loaded is different
    const assignmentId = await page.locator("#assignmentId").textContent();
    expect(assignmentId).not.toBe("previous assignment id"); // Replace with previous assignment id logic if applicable
  });
});

test.describe("Points Update Tests on Assignment Completion", () => {
  // Test: Check points increase after solving an assignment correctly
  test("Should update points after solving an assignment", async ({ page }) => {
    await page.goto("/assignments");

    // Capture the initial points shown to the user
    const initialPointsText = await page
      .locator("#pointsDisplay")
      .textContent();
    const initialPoints = parseInt(initialPointsText, 10);

    // Start the assignment and submit correct code
    await page.click("text=Start Assignment");
    await page.fill("#codeEditor", "correct code"); // replace with the code that passes the test
    await page.click("#submitButton");

    // Wait for success notification
    await page.waitForSelector("#successNotification", { state: "visible" });
    const successNotification = await page
      .locator("#successNotification")
      .textContent();
    expect(successNotification).toContain("Correct submission");

    // Capture the points after successful submission
    const updatedPointsText = await page
      .locator("#pointsDisplay")
      .textContent();
    const updatedPoints = parseInt(updatedPointsText, 10);

    // Check that points have increased
    expect(updatedPoints).toBeGreaterThan(initialPoints);
  });

  // Test: Points should not change after a failed submission
  test("Should not update points after a failed submission", async ({
    page,
  }) => {
    await page.goto("/assignments");

    // Capture the initial points shown to the user
    const initialPointsText = await page
      .locator("#pointsDisplay")
      .textContent();
    const initialPoints = parseInt(initialPointsText, 10);

    // Start the assignment and submit incorrect code
    await page.click("text=Start Assignment");
    await page.fill("#codeEditor", "incorrect code"); // replace with code that fails the test
    await page.click("#submitButton");

    // Wait for feedback indicating failure
    await page.waitForSelector("#feedback", { state: "visible" });
    const feedback = await page.locator("#feedback").textContent();
    expect(feedback).toContain("Incorrect submission");

    // Capture points after the failed submission
    const pointsAfterFailureText = await page
      .locator("#pointsDisplay")
      .textContent();
    const pointsAfterFailure = parseInt(pointsAfterFailureText, 10);

    // Ensure points have not increased after failure
    expect(pointsAfterFailure).toBe(initialPoints);
  });
});
