import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  forbidOnly: isCI,
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  // Demo público compartido: concurrencia baja a propósito.
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['html', { open: 'never', outputFolder: '../../05-reports/playwright' }],
    ['list'],
    ['junit', { outputFile: '../../05-reports/junit.xml' }],
  ],

  outputDir: '../../05-reports/test-results',

  use: {
    baseURL: process.env.UI_BASE_URL ?? 'https://the-internet.herokuapp.com',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium-ui', use: { ...devices['Desktop Chrome'] } },
  ],
});
