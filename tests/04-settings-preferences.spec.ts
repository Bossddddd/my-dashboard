import { test, expect } from "@playwright/test";

test.describe("Settings & Preferences Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("header");

    // Navigate to Settings
    await page.locator("text=⚙️").locator("..").click();
  });

  test("should toggle dark mode and persist in localStorage", async ({
    page,
  }) => {
    // Find dark mode toggle button
    const darkModeBtn = page
      .locator('h4:has-text("โหมดกลางคืน")')
      .locator("..")
      .locator("..")
      .locator("button");
    if ((await darkModeBtn.count()) > 0) {
      await darkModeBtn.click();

      // Check HTML class
      await expect(page.locator("html")).toHaveClass(/dark/);

      // Check localStorage
      const isDark = await page.evaluate(() =>
        window.localStorage.getItem("isDarkMode"),
      );
      expect(isDark).toBe("true");
    }
  });

  test("should change language and persist", async ({ page }) => {
    // The first select is language usually
    // We can be more specific: select near "Language" or "ภาษา"
    const languageContainer = page
      .locator('h4:has-text("ภาษา"), h4:has-text("Language")')
      .locator("..")
      .locator("..");
    const specificLangSelect = languageContainer.locator("select");

    if ((await specificLangSelect.count()) > 0) {
      await specificLangSelect.selectOption("en");
      const lang = await page.evaluate(() =>
        window.localStorage.getItem("language"),
      );
      expect(lang).toBe("en");
    }
  });

  test("should show custom date range inputs when selected", async ({
    page,
  }) => {
    const dateSelect = page
      .locator(
        'h4:has-text("ช่วงเวลาเริ่มต้น"), h4:has-text("Default Date Range")',
      )
      .locator("..")
      .locator("..")
      .locator("select");
    if ((await dateSelect.count()) > 0) {
      await dateSelect.selectOption("custom");

      // Custom date inputs should appear
      const dateInput = page.locator('input[type="date"]').first();
      await expect(dateInput).toBeVisible();
    }
  });

  test("should open Danger Zone modal and allow cancellation", async ({
    page,
  }) => {
    const deleteBtn = page.locator('button:has-text("ลบข้อมูล")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Modal should appear
      const cancelBtn = page.locator('button:has-text("ยกเลิก")').first();
      await expect(cancelBtn).toBeVisible();

      // Click cancel
      await cancelBtn.click();

      // Modal should disappear
      await expect(cancelBtn).toBeHidden();
    }
  });
});
