import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E and visual regression testing
 *
 * Test directories:
 * - ./e2e - End-to-end tests for user workflows
 * - ./visual-tests - Visual regression tests for UI consistency
 *
 * Use npm scripts to run specific test suites:
 * - npm run e2e - Run E2E tests
 * - npm run visual - Run visual regression tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './visual-tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Set viewport for consistent screenshots
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    /* Test against mobile viewports */
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },

    /* Test against tablet viewports */
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Visual regression specific settings */
  expect: {
    toHaveScreenshot: {
      // Maximum number of pixels that can differ
      maxDiffPixels: 100,
      // Threshold for color difference (0-1)
      threshold: 0.2,
      // Animation settings
      animations: 'disabled',
    },
  },
});
