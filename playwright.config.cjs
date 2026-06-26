// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright Configuration (CJS)
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  timeout: 90 * 1000,
  expect: {
    timeout: 15 * 1000,
  },
  testDir: "./tests",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry: 1 on CI, 0 locally */
  retries: process.env.CI ? 1 : 0,

  /* Workers: 3 on CI (one per browser project), auto locally */
  workers: process.env.CI ? 3 : undefined,

  /* Reporter: fast 'list' on CI, rich 'html' locally */
  reporter: process.env.CI ? "list" : "html",

  /* Shared settings for all the projects below. */
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
