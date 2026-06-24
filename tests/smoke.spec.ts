import { test, expect } from "@playwright/test";

test.describe("Production Smoke Test / Health Check", () => {
  test("System should load the main dashboard and connect to the database successfully", async ({
    page,
  }) => {
    // 1. Visit the home page
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy(); // Expect a 2xx or 3xx HTTP response

    // 2. Wait for the main layout to render
    await page.waitForSelector("header", { timeout: 10000 });

    // 3. Verify that the loading state goes away (meaning data was fetched)
    await expect(page.locator("text=กำลังโหลดข้อมูล...")).toBeHidden({
      timeout: 15000,
    });

    // 4. Check for critical UI elements like KPI stats (read-only verification)
    const statCards = page.locator(".text-2xl.sm\\:text-3xl.font-black");
    // Ensure that at least some stat cards are rendered, implying the DB read was successful
    await expect(statCards).not.toHaveCount(0);

    // 5. Ensure the Settings/Navigation is accessible without making changes
    const settingsLink = page.locator('a[href="/settings"]');
    if (await settingsLink.isVisible()) {
      await expect(settingsLink).toHaveAttribute("href", "/settings");
    }

    // 6. Ensure no server errors are visible on the UI
    await expect(page.locator("text=500 Internal Server Error")).toBeHidden();
    await expect(page.locator("text=Application error")).toBeHidden();
  });
});
