import { defineConfig } from 'cypress';

/**
 * Ejecutar siempre con `npm run test:04`.
 *
 * Electron necesita flags de GPU que solo se pueden pasar por la variable de
 * entorno ELECTRON_EXTRA_LAUNCH_ARGS, y tiene que estar puesta ANTES de que
 * arranque el binario de Cypress: fijarla desde este archivo llega tarde.
 * De eso se encarga tools/run-cypress.mjs, que es lo que invoca el script npm.
 */

export default defineConfig({
  e2e: {
    baseUrl: process.env.UI_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',

    // Los artefactos van a la carpeta de reportes del sitio, como en el resto
    // del portfolio, en vez de quedar sueltos junto al código.
    videosFolder: '../../05-reports/cypress/videos',
    screenshotsFolder: '../../05-reports/cypress/screenshots',
    downloadsFolder: '../../05-reports/cypress/downloads',

    video: false,
    screenshotOnRunFailure: true,

    // Demo público y compartido: tiempos holgados y sin reintentos agresivos.
    defaultCommandTimeout: 15_000,
    pageLoadTimeout: 60_000,
    requestTimeout: 20_000,
    responseTimeout: 30_000,
    retries: { runMode: 1, openMode: 0 },

    viewportWidth: 1440,
    viewportHeight: 900,

    setupNodeEvents(on) {
      /**
       * En entornos sin aceleración por hardware (CI, VMs, equipos con
       * políticas restrictivas) el proceso GPU de Chromium muere con
       * ACCESS_DENIED y arrastra toda la corrida. Estos flags lo desactivan:
       * no cambian lo que se prueba, solo cómo se dibuja.
       */
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        if (browser.name === 'electron') {
          launchOptions.preferences.webPreferences ??= {};
          launchOptions.preferences.webPreferences.offscreen = false;
        }
        return launchOptions;
      });
    },
  },
});
