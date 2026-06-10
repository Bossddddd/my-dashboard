import { test, expect } from '@playwright/test';

test.describe('Navigation & Sidebar Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the main page layout to render
    await page.waitForSelector('header');
  });

  test('should toggle sidebar visibility on desktop', async ({ page }) => {
    // Check initial state: Sidebar is visible
    // In ClientPage: className={`... ${isSidebarOpen ? "w-64 opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-full"}`}
    const sidebarContainer = page.locator('.transition-all.duration-300.ease-in-out').filter({ has: page.locator('aside') }).first();
    await expect(sidebarContainer).toHaveClass(/w-64/);
    
    // Toggle sidebar
    const toggleButton = page.locator('header button').first();
    await toggleButton.click();
    
    // Verify it hides
    await expect(sidebarContainer).toHaveClass(/w-0/);
    await expect(sidebarContainer).toHaveClass(/-translate-x-full/);
    
    // Toggle back
    await toggleButton.click();
    await expect(sidebarContainer).toHaveClass(/w-64/);
  });

  test('should change active tab state on click', async ({ page }) => {
    // Open Maintenance dropdown if closed. We know there's a button with text including 🛠️ or maintenance
    // Just click 'Workshops' tab. We can use getByText but there might be multiple or icons.
    // In Sidebar.tsx: we have 'อู่ซ่อม' or 'Workshops' depending on lang. The default is 'th'.
    // Let's click the 4th item in the maintenance list, or use role.
    // Click Workshops (2nd child of maintenance submenu)
    await page.locator('.flex.flex-col.gap-1.pl-4 div').nth(1).click();

    // Verify Active Class (bg-emerald-50)
    const activeTab = page.locator('.flex.flex-col.gap-1.pl-4 div').nth(1);
    await expect(activeTab).toHaveClass(/bg-emerald-50/);
    
    // Click Settings (Find by icon)
    await page.locator('text=⚙️').locator('..').click();
    await expect(page.locator('header h1')).toContainText(/ตั้งค่า|Setting/i);
  });

  test('should hide sidebar automatically on mobile and show overlay', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check initial state on mobile: Sidebar should be hidden
    const sidebarContainer = page.locator('.transition-all.duration-300.ease-in-out').filter({ has: page.locator('aside') }).first();
    await expect(sidebarContainer).toHaveClass(/w-0/);
    
    // Toggle sidebar open
    const toggleButton = page.locator('header button').first();
    await toggleButton.click();
    
    // Overlay should be visible
    const overlay = page.locator('.bg-black\\/50.z-20.sm\\:hidden');
    await expect(overlay).toBeVisible();
    
    // Click overlay to close
    await overlay.click({ position: { x: 350, y: 100 } }); // click outside sidebar
    await expect(overlay).toBeHidden();
    await expect(sidebarContainer).toHaveClass(/w-0/);
  });
});
