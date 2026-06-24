import { test, expect } from "@playwright/test";

test.describe("Workshops & Technicians Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("header");
    await expect(page.locator("text=กำลังโหลดข้อมูล...")).toBeHidden({
      timeout: 15000,
    });
  });

  test("should navigate to Workshops, allow opening a workshop detail and changing pages", async ({ page }) => {
    // Navigate to Workshops (2nd item in submenu)
    await page.locator(".flex.flex-col.gap-1.pl-4 div").nth(1).click();

    // Check if Workshops table/grid exists
    const workshopTitle = page.locator("h3").first();
    await expect(workshopTitle).toBeVisible();

    // Click on the first workshop row if available
    const firstWorkshopRow = page.locator("tbody tr").first();
    if (await firstWorkshopRow.isVisible()) {
      await firstWorkshopRow.click();

      // Wait for the detail view to appear
      const backBtn = page.locator('button:has-text("กลับไปตารางทีมช่างทั้งหมด"), button:has-text("Back")').first();
      await expect(backBtn).toBeVisible();

      // Test pagination inside workshop detail
      const nextBtn = page.locator('button:has-text("หน้าถัดไป"), button:has-text("Next")').first();
      if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
      }

      // Open a log from workshop detail
      const logRow = page.locator("tbody tr").first();
      if (await logRow.isVisible()) {
        await logRow.click();
        const modal = page.locator(".fixed.inset-0.z-50").first();
        await expect(modal).toBeVisible();
        await page.locator('button:has-text("ปิด"), button:has-text("Close")').first().click();
      }

      // Click back
      await backBtn.click();
      await expect(workshopTitle).toBeVisible();
    }
  });

  test("should navigate to Technicians, sort, and view technician details", async ({ page }) => {
    // Navigate to Technicians (3rd item in submenu)
    await page.locator(".flex.flex-col.gap-1.pl-4 div").nth(2).click();

    const techTitle = page.locator("h3").first();
    await expect(techTitle).toBeVisible();

    // Sort by efficiency (SLA column is at index 6)
    const sortableTh = page.locator("th").nth(6);
    if (await sortableTh.isVisible()) {
      await sortableTh.click();
      await expect(sortableTh).toContainText(/▲|▼/);
    }

    // View technician detail
    const firstTechRow = page.locator("tbody tr").first();
    if (await firstTechRow.isVisible()) {
      await firstTechRow.click();
      
      const backBtn = page.locator('button:has-text("กลับไปตารางช่างทั้งหมด"), button:has-text("Back")').first();
      await expect(backBtn).toBeVisible();

      // Open a log from technician detail
      const logRow = page.locator("tbody tr").first();
      if (await logRow.isVisible()) {
        await logRow.click();
        const modal = page.locator(".fixed.inset-0.z-50").first();
        await expect(modal).toBeVisible();
        await page.locator('button:has-text("ปิด"), button:has-text("Close")').first().click();
      }

      await backBtn.click();
    }
  });
});
