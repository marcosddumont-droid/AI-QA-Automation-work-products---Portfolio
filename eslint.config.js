import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** Globals de Node disponibles en los scripts del proyecto. */
const globalsNode = {
  process: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
};

/** Globals que k6 inyecta en tiempo de ejecución. */
const globalsK6 = {
  __ENV: 'readonly',
  __VU: 'readonly',
  __ITER: 'readonly',
  console: 'readonly',
};

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      // Reportes generados: traen assets de vendor (jquery, bootstrap) que no
      // son código nuestro y no tiene ningún sentido lintear.
      '**/05-reports/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/cypress/videos/**',
      '**/cypress/screenshots/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['tools/**/*.js', 'tools/**/*.mjs'],
    languageOptions: { globals: globalsNode },
  },
  {
    // Suite de Cypress: corre dentro del navegador con sus propios globals.
    files: ['**/cypress/**/*.js', '**/cypress.config.js'],
    languageOptions: {
      globals: {
        ...globalsNode,
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
        expect: 'readonly',
      },
    },
  },
  {
    // Los scripts de k6 corren en su propio runtime, no en Node.
    files: ['**/03-automation/k6/**/*.js'],
    languageOptions: { globals: globalsK6 },
  },
);
