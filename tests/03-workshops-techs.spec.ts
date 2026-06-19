import { test, expect } from '@playwright/test';

test.describe('Workshops & Technicians Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header');
    await expect(page.locator('text=กำลังโหลดข้อมูล...')).toBeHidden({ timeout: 10000 });
  });

  test('should navigate to Workshops and allow opening a workshop detail', async ({ page }) => {
    // Navigate to Workshops (2nd item in submenu)
    await page.locator('.flex.flex-col.gap-1.pl-4 div').nth(1).click();

    // Check if Workshops table/grid exists
    const workshopTitle = page.locator('h3').first();
    await expect(workshopTitle).toBeVisible();

    // Click on the first workshop row if available
    const firstWorkshopRow = page.locator('tbody tr').first();
    if (await firstWorkshopRow.isVisible()) {
        await firstWorkshopRow.click();
        
        // Wait for the detail view to appear (it should have a "กลับหน้าหลักอู่ซ่อม" back button)
        const backBtn = page.locator('button').first(); // back button is usually first
        await expect(backBtn).toBeVisible();
    }
  });

  test('should sort technicians by efficiency in Technicians tab', async ({ page }) => {
    // Navigate to Technicians (3rd item in submenu)
    await page.locator('.flex.flex-col.gap-1.pl-4 div').nth(2).click();

    const techTitle = page.locator('h3').first();
    await expect(techTitle).toBeVisible();

    // Sort by efficiency (SLA column is at index 6)
    const sortableTh = page.locator('th').nth(6);
    if (await sortableTh.isVisible()) {
        await sortableTh.click();
        await expect(sortableTh).toContainText(/▲|▼/);
    }
  });
});
