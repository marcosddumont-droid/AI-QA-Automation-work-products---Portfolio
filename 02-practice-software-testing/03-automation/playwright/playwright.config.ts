import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  forbidOnly: isCI,
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  /**
   * Concurrencia deliberadamente baja: la aplicación es un demo público y
   * compartido. Con 4 workers el sitio empieza a throttlear y aparecen
   * timeouts que no son defectos de la app ni de los tests.
   * Ser buen vecino con infraestructura ajena también es criterio de QA.
   */
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['html', { open: 'never', outputFolder: '../../05-reports/playwright' }],
    ['list'],
    ['junit', { outputFile: '../../05-reports/junit.xml' }],
  ],

  outputDir: '../../05-reports/test-results',

  use: {
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
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
        baseURL: process.env.UI_BASE_URL ?? 'https://practicesoftwaretesting.com',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
