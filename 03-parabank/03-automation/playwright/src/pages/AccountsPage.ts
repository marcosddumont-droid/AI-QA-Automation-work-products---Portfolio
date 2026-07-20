import type { Page, Locator } from '@playwright/test';

/** "$1,234.56" -> 1234.56 · "-$50.00" -> -50 */
export function parsearMonto(bruto: string): number {
  const negativo = bruto.trim().startsWith('-');
  const numero = Number(bruto.replace(/[^0-9.]/g, ''));
  return negativo ? -numero : numero;
}

export class AccountsPage {
  readonly page: Page;
  readonly titulo: Locator;
  readonly tablaCuentas: Locator;
  readonly filasCuentas: Locator;
  readonly enlacesCuenta: Locator;
  readonly menuLateral: Locator;
  readonly cerrarSesion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulo = page.locator('#rightPanel h1').first();
    this.tablaCuentas = page.locator('#accountTable');
    // La última fila es el total, no una cuenta: se excluye.
    this.filasCuentas = page.locator('#accountTable tbody tr').filter({ has: page.locator('a') });
    this.enlacesCuenta = page.locator('#accountTable a');
    this.menuLateral = page.locator('#leftPanel');
    this.cerrarSesion = page.locator('a[href*="logout.htm"]');
  }

  async abrir(): Promise<void> {
    await this.page.goto('overview.htm');
  }

  async esperarCargado(): Promise<void> {
    await this.tablaCuentas.waitFor({ state: 'visible' });
    await this.enlacesCuenta.first().waitFor({ state: 'visible' });
  }

  async obtenerIdsDeCuenta(): Promise<string[]> {
    return (await this.enlacesCuenta.allInnerTexts()).map((t) => t.trim());
  }

  /** Saldo de una cuenta por su id, leído de la fila correspondiente. */
  async obtenerSaldo(idCuenta: string): Promise<number> {
    const fila = this.filasCuentas.filter({ hasText: idCuenta }).first();
    const celdas = await fila.locator('td').allInnerTexts();
    // Columnas: id | balance | available amount
    return parsearMonto(celdas[1] ?? '0');
  }

  async abrirCuenta(idCuenta: string): Promise<void> {
    await this.enlacesCuenta.filter({ hasText: idCuenta }).first().click();
  }

  async navegarA(opcion: string): Promise<void> {
    await this.menuLateral.getByRole('link', { name: opcion }).click();
  }

  async salir(): Promise<void> {
    await this.cerrarSesion.click();
  }
}
