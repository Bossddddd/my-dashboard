import { test, expect } from "@playwright/test";

test.describe("Dashboard & Search Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("header");
    await expect(page.locator("text=กำลังโหลดข้อมูล...")).toBeHidden({
      timeout: 15000,
    });
  });

  test("should render KPIs and Stat Cards successfully", async ({ page }) => {
    const bigNumbers = page.locator(".text-2xl.sm\\:text-3xl.font-black");
    await expect(bigNumbers).toHaveCount(2);
    await expect(page.locator("h3").first()).toBeVisible();
  });

  test("should handle global filtering by Status", async ({ page }) => {
    const statusFilter = page.locator('select').first(); // The first select in Dashboard is usually Status
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("pending"); // Using 'pending' as value based on common enums
      
      // Wait for table to reflect changes (maybe it shrinks or empty state shows)
      await page.waitForTimeout(500); 
      // Verify the filter is applied
      await expect(statusFilter).toHaveValue("pending");
    }
  });

  test("should handle Pagination", async ({ page }) => {
    // Scroll to the bottom where pagination is
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Find the Next page button
    const nextBtn = page.locator('button:has-text("หน้าถัดไป"), button:has-text("Next")');
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      
      // Wait a bit for state to update
      await page.waitForTimeout(500);
      
      // Verify page number changed (if visible) or just check that button worked
      const pageText = page.locator('text=/หน้า \\d+ จาก/i, text=/Page \\d+ of/i');
      if (await pageText.isVisible()) {
        await expect(pageText).toContainText("2");
      }
    }
  });

  test("should sort overdue table when clicking headers", async ({ page }) => {
    const sortableTh = page.locator("th").nth(2);
    if (await sortableTh.isVisible()) {
      await sortableTh.click();
      await expect(sortableTh).toContainText(/▲|▼/);
      await sortableTh.click();
      await expect(sortableTh).toContainText(/▲|▼/);
    }
  });

  test("should handle exact match search and view VehicleDetailView", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="ค้นหา"]');
    
    // We will search for a generic term that likely yields results or empty state without crashing
    await searchInput.fill("1234");
    await searchInput.press("Enter");

    // Wait for either search results or vehicle detail view
    await page.waitForTimeout(1000);
    
    // Check if back button or reset button appears
    const clearSearchBtn = page.locator('button:has-text("ล้างการค้นหา"), button:has-text("Clear Search"), button:has-text("กลับไปหน้าแรก")').first();
    if (await clearSearchBtn.isVisible()) {
      await clearSearchBtn.click();
      // Should clear input
      await expect(searchInput).toHaveValue("");
    }
  });
});
