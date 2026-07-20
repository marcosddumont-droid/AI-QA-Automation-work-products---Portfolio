import { test, expect } from '../../src/fixtures/test-fixtures.js';
import { users, invalidCredentials } from '../../src/data/users.js';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('TC-01 login exitoso redirige al inventario @smoke', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('TC-02 usuario bloqueado no puede ingresar @regression', async ({ loginPage, page }) => {
    await loginPage.login(users.locked.username, users.locked.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  // Data-driven: un test por combinación inválida, con reporte independiente.
  for (const { username, password, error } of invalidCredentials) {
    test(`TC-03 credenciales inválidas → "${error}" @regression`, async ({ loginPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.errorMessage).toBeVisible();
      expect(await loginPage.getErrorText()).toContain(error);
    });
  }

  test('TC-04 logout vuelve a la pantalla de login @regression', async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(inventoryPage.title).toHaveText('Products');

    await inventoryPage.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });

  test('TC-05 el password se enmascara en pantalla @regression', async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
