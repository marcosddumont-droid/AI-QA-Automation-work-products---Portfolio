import type { Page, Locator } from '@playwright/test';

/**
 * Transferencia de fondos.
 *
 * La página mantiene tres paneles en el DOM al mismo tiempo —formulario,
 * resultado y error— y alterna cuál se muestra. Por eso hay tres `h1` a la vez
 * ("Transfer Funds", "Transfer Complete!", "Error!") y afirmar sobre el
 * primero devuelve siempre el del formulario, aunque la operación haya salido
 * bien. Cada locator apunta al panel que le corresponde.
 */
export class TransferPage {
  readonly page: Page;
  readonly panelFormulario: Locator;
  readonly panelResultado: Locator;
  readonly panelError: Locator;

  readonly monto: Locator;
  readonly cuentaOrigen: Locator;
  readonly cuentaDestino: Locator;
  readonly botonTransferir: Locator;

  readonly tituloResultado: Locator;
  readonly montoConfirmado: Locator;
  readonly origenConfirmado: Locator;
  readonly destinoConfirmado: Locator;

  constructor(page: Page) {
    this.page = page;
    this.panelFormulario = page.locator('#showForm');
    this.panelResultado = page.locator('#showResult');
    this.panelError = page.locator('#showError');

    this.monto = page.locator('#amount');
    this.cuentaOrigen = page.locator('#fromAccountId');
    this.cuentaDestino = page.locator('#toAccountId');
    this.botonTransferir = page.locator('input[value="Transfer"]');

    this.tituloResultado = this.panelResultado.locator('h1');
    this.montoConfirmado = page.locator('#amountResult');
    this.origenConfirmado = page.locator('#fromAccountIdResult');
    this.destinoConfirmado = page.locator('#toAccountIdResult');
  }

  async abrir(): Promise<void> {
    await this.page.goto('transfer.htm');
    await this.esperarFormularioListo();
  }

  /**
   * Los desplegables se pueblan por AJAX. Enviar antes de que tengan opciones
   * manda el formulario sin cuentas y la operación no se concreta.
   */
  async esperarFormularioListo(): Promise<void> {
    await this.cuentaOrigen.waitFor({ state: 'visible' });
    await this.cuentaOrigen
      .locator('option')
      .first()
      .waitFor({ state: 'attached', timeout: 30_000 });
  }

  async obtenerCuentasDisponibles(): Promise<string[]> {
    return (await this.cuentaOrigen.locator('option').allTextContents()).map((t) => t.trim());
  }

  async transferir(monto: number, origen: string, destino: string): Promise<void> {
    await this.monto.fill(String(monto));
    await this.cuentaOrigen.selectOption(origen);
    await this.cuentaDestino.selectOption(destino);
    await this.botonTransferir.click();
  }
}
