import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  /* Falla el build si alguien deja un test.only olvidado en un PR. */
  forbidOnly: isCI,
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: [
    ['html', { open: 'never', outputFolder: '../../05-reports/playwright' }],
    ['list'],
    ['junit', { outputFile: '../../05-reports/junit.xml' }],
  ],

  outputDir: '../../05-reports/test-results',

  use: {
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
      },
    },
    {
      name: 'firefox-ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
      },
    },
    {
      name: 'mobile-ui',
      testDir: './tests/ui',
      use: {
        ...devices['Pixel 7'],
        baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      name: 'a11y',
      testDir: './tests/a11y',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
      },
    },
  ],
});
