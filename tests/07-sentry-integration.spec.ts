import { test, expect } from "@playwright/test";

test.describe("Sentry Integration Tests", () => {
  test("should load Sentry example page and throw error successfully", async ({ page }) => {
    // Navigate to the Sentry example page
    await page.goto("/sentry-example-page");

    // Check if the page loaded successfully by looking for the Sentry logo/title
    const heading = page.locator('h1', { hasText: "sentry-example-page" });
    await expect(heading).toBeVisible();

    // Find the Throw Error button
    const throwErrorBtn = page.locator('button:has-text("Throw Sample Error")');
    await expect(throwErrorBtn).toBeVisible();

    // Verify it is not disabled (which means Sentry SDK is connected)
    await expect(throwErrorBtn).toBeEnabled();

    // Click the button
    await throwErrorBtn.click();

    // Wait for the success message that indicates the error was processed
    const successMsg = page.locator('.success', { hasText: "Error sent to Sentry." });
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });
});
