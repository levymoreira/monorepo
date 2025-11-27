import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/performance-results.json' }],
    ['junit', { outputFile: 'test-results/performance-results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Mobile Chrome Performance',
      use: { 
        ...devices['Pixel 5'],
        // Override viewport to ensure consistent 412px width
        viewport: { width: 412, height: 823 },
        // Enable devtools for performance measurement
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-extensions'
          ]
        }
      },
    },

    {
      name: 'Mobile Safari Performance',
      use: { 
        ...devices['iPhone 12'],
        // Safari-specific optimizations for performance testing
        launchOptions: {
          args: ['--disable-web-security']
        }
      },
    },

    {
      name: 'Desktop Chrome Performance',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-extensions'
          ]
        }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.NODE_ENV === 'production' || process.env.TEST_PRODUCTION ? 'yarn build && yarn start' : 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.TEST_PRODUCTION ? 180 * 1000 : 120 * 1000, // 3 minutes for production build
  },

  /* Global test timeout */
  timeout: 60 * 1000, // 60 seconds

  /* Expect timeout for assertions */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
});