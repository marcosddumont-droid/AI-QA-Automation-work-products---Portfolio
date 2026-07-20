import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  forbidOnly: isCI,
  /**
   * Sin paralelismo dentro de cada archivo: los flujos de banca mutan saldos
   * y el orden importa (transferir y después verificar el saldo resultante).
   * Los archivos entre sí sí corren en paralelo, con un usuario propio cada uno.
   */
  fullyParallel: false,
  retries: isCI ? 2 : 1,
  // Demo público compartido: concurrencia baja a propósito.
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
    /**
     * La barra final es obligatoria y las rutas de los Page Objects van SIN
     * barra inicial. Con `goto('/index.htm')` el navegador resuelve contra el
     * origen y descarta el path `/parabank`, que es justo el que hace falta.
     */
    baseURL: process.env.UI_BASE_URL ?? 'https://parabank.parasoft.com/parabank/',
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium-ui', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'api',
      testDir: './tests/api',
      use: { extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
