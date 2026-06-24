import { test, expect } from "@playwright/test";

test.describe("Map View Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("header");
    await expect(page.locator("text=กำลังโหลดข้อมูล...")).toBeHidden({
      timeout: 15000,
    });
  });

  test("should render Leaflet map container successfully", async ({ page }) => {
    // Click the Map tab
    await page.locator(".flex.flex-col.gap-1.pl-4 div").nth(3).click();

    // Check if the Leaflet container is visible OR the empty state is visible
    const leafletMap = page.locator(".leaflet-container");
    const emptyState = page.locator("text=ไม่มีข้อมูลพิกัดสถานที่ในระบบ");
    await expect(leafletMap.or(emptyState)).toBeVisible({ timeout: 10000 });

    // Check if map pane exists, OR empty state is shown
    const mapPane = page.locator(".leaflet-map-pane");
    await expect(mapPane.or(emptyState)).toBeVisible();
  });
});
