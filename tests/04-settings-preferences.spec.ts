import { test, expect } from "@playwright/test";

test.describe("Settings & Preferences Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("header");
    await expect(page.locator("text=กำลังโหลดข้อมูล...")).toBeHidden({
      timeout: 15000,
    });
    // Navigate to Settings
    await page.locator("text=⚙️").locator("..").click();
  });

  test("should toggle dark mode and persist in localStorage", async ({ page }) => {
    const darkModeBtn = page.locator('h4:has-text("โหมดกลางคืน")').locator("..").locator("..").locator("button");
    if (await darkModeBtn.count() > 0) {
      await darkModeBtn.click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      const isDark = await page.evaluate(() => window.localStorage.getItem("isDarkMode"));
      expect(isDark).toBe("true");
    }
  });

  test("should change language and persist", async ({ page }) => {
    const languageContainer = page.locator('h4:has-text("ภาษา"), h4:has-text("Language")').locator("..").locator("..");
    const specificLangSelect = languageContainer.locator("select");

    if (await specificLangSelect.count() > 0) {
      await specificLangSelect.selectOption("en");
      const lang = await page.evaluate(() => window.localStorage.getItem("language"));
      expect(lang).toBe("en");
    }
  });

  test("should change SLA target and persist", async ({ page }) => {
    const slaInput = page.locator('input[type="number"]');
    if (await slaInput.isVisible()) {
      await slaInput.fill("90");
      
      // Wait a bit to ensure React state updates and saves to localStorage
      await page.waitForTimeout(500);

      const slaTarget = await page.evaluate(() => window.localStorage.getItem("slaTarget"));
      expect(slaTarget).toBe("90");
    }
  });

  test("should show custom date range inputs when selected", async ({ page }) => {
    const dateSelect = page.locator('h4:has-text("ช่วงเวลาเริ่มต้น"), h4:has-text("Default Date Range")').locator("..").locator("..").locator("select");
    if (await dateSelect.count() > 0) {
      await dateSelect.selectOption("custom");
      const dateInput = page.locator('input[type="date"]').first();
      await expect(dateInput).toBeVisible();
    }
  });

  test("should open Danger Zone modal and allow cancellation", async ({ page }) => {
    const deleteBtn = page.locator('button:has-text("ลบข้อมูล")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const cancelBtn = page.locator('button:has-text("ยกเลิก")').first();
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();
      await expect(cancelBtn).toBeHidden();
    }
  });
});
