import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { AccountsPage } from '../pages/AccountsPage.js';
import { TransferPage } from '../pages/TransferPage.js';
import { construirCliente, type Cliente } from '../data/cliente.js';

interface Fixtures {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountsPage: AccountsPage;
  transferPage: TransferPage;
  /** Cliente recién registrado y con sesión iniciada. */
  clienteRegistrado: { cliente: Cliente; accountsPage: AccountsPage };
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  accountsPage: async ({ page }, use) => {
    await use(new AccountsPage(page));
  },
  transferPage: async ({ page }, use) => {
    await use(new TransferPage(page));
  },

  /**
   * Registra un cliente nuevo para cada test que lo pida.
   *
   * ParaBank es una base compartida y de escritura: usar un usuario fijo haría
   * que los saldos dependieran de lo que hizo la corrida anterior (o cualquier
   * otra persona usando la demo). Cada test arranca de un estado propio.
   */
  clienteRegistrado: async ({ page }, use) => {
    const cliente = construirCliente();

    const registerPage = new RegisterPage(page);
    await registerPage.abrir();
    await registerPage.completarYEnviar(cliente);

    // Tras registrarse, ParaBank NO redirige al resumen: se queda en
    // register.htm mostrando "Welcome <usuario>" y deja la sesión iniciada.
    await expect(registerPage.titulo).toContainText(`Welcome ${cliente.usuario}`, {
      timeout: 30_000,
    });

    const accountsPage = new AccountsPage(page);
    await accountsPage.abrir();
    await accountsPage.esperarCargado();

    await use({ cliente, accountsPage });
  },
});

export { expect };
