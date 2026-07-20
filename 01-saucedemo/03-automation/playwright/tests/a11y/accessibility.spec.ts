import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { users } from '../../src/data/users.js';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Escaneos automáticos con axe-core. Cubren ~30-40% de los criterios WCAG:
 * el resto requiere revisión manual. Los hallazgos se documentan en docs/bug-reports.md.
 */
test.describe('Accesibilidad WCAG 2.1 AA', () => {
  test('A11Y-01 la pantalla de login no tiene violaciones críticas @a11y', async ({ page }) => {
    await new LoginPage(page).open();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const criticas = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

    expect(
      criticas,
      `Violaciones encontradas:\n${criticas.map((v) => `- ${v.id}: ${v.help}`).join('\n')}`,
    ).toEqual([]);
  });

  test('A11Y-02 el inventario no tiene violaciones críticas @a11y', async ({ page }) => {
    // Fallo esperado: el <select> de ordenamiento no tiene nombre accesible.
    // Defecto real de la app, documentado en docs/bug-reports.md → BUG-006.
    // Cuando el equipo lo corrija, este marcador se quita y el test queda en verde.
    test.fail(true, 'BUG-006: el select de ordenamiento no tiene nombre accesible');

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await page.waitForURL(/inventory\.html/);

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const criticas = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

    expect(
      criticas,
      `Violaciones encontradas:\n${criticas.map((v) => `- ${v.id}: ${v.help}`).join('\n')}`,
    ).toEqual([]);
  });

  test('A11Y-03 el login es operable solo con teclado @a11y', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    await loginPage.usernameInput.focus();
    await page.keyboard.type(users.standard.username);
    await page.keyboard.press('Tab');
    await page.keyboard.type(users.standard.password);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/inventory\.html/);
  });
});
