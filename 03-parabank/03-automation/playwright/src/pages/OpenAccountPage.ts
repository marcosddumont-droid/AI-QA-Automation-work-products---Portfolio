import type { Page, Locator } from '@playwright/test';

export type TipoCuenta = 'CHECKING' | 'SAVINGS';

export class OpenAccountPage {
  readonly page: Page;
  readonly tipoCuenta: Locator;
  readonly cuentaOrigen: Locator;
  readonly botonAbrir: Locator;
  readonly nuevaCuentaId: Locator;
  readonly titulo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tipoCuenta = page.locator('#type');
    this.cuentaOrigen = page.locator('#fromAccountId');
    this.botonAbrir = page.locator('input[value="Open New Account"]');
    this.nuevaCuentaId = page.locator('#newAccountId');
    this.titulo = page.locator('#rightPanel h1').first();
  }

  async abrir(): Promise<void> {
    await this.page.goto('openaccount.htm');
    await this.esperarFormularioListo();
  }

  /**
   * El desplegable de cuenta origen se puebla por AJAX después de que la
   * página termina de cargar. Si se envía el formulario antes, se manda sin
   * cuenta origen y la operación falla en silencio: la página se queda igual
   * y el id de la cuenta nueva nunca aparece.
   */
  async esperarFormularioListo(): Promise<void> {
    await this.tipoCuenta.waitFor({ state: 'visible' });
    await this.cuentaOrigen.waitFor({ state: 'visible' });
    await this.page
      .locator('#fromAccountId option')
      .first()
      .waitFor({ state: 'attached', timeout: 30_000 });
  }

  async abrirCuenta(tipo: TipoCuenta): Promise<string> {
    await this.tipoCuenta.selectOption({ label: tipo });
    await this.botonAbrir.click();

    await this.nuevaCuentaId.waitFor({ state: 'visible', timeout: 30_000 });
    return (await this.nuevaCuentaId.innerText()).trim();
  }
}
