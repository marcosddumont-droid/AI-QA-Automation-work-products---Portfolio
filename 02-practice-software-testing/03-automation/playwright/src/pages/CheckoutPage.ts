import type { Page, Locator } from '@playwright/test';
import { parsearPrecio } from './HomePage.js';

/**
 * Carrito y checkout. En esta aplicación ambos viven en /checkout:
 * el carrito es el primer paso de un asistente por etapas.
 */
export class CheckoutPage {
  readonly page: Page;
  readonly titulosProducto: Locator;
  readonly cantidades: Locator;
  readonly preciosUnitarios: Locator;
  readonly preciosLinea: Locator;
  readonly total: Locator;
  readonly continuarComprando: Locator;
  readonly proceder: Locator;
  readonly emailInvitado: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulosProducto = page.locator('[data-test="product-title"]');
    this.cantidades = page.locator('[data-test="product-quantity"]');
    this.preciosUnitarios = page.locator('[data-test="product-price"]');
    this.preciosLinea = page.locator('[data-test="line-price"]');
    this.total = page.locator('[data-test="cart-total"]');
    this.continuarComprando = page.locator('[data-test="continue-shopping"]');
    this.proceder = page.locator('[data-test="proceed-1"]');
    this.emailInvitado = page.locator('[data-test="guest-email"]');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/checkout');
  }

  /**
   * Las filas del carrito se renderizan del lado del cliente y tardan ~3 s.
   * Sin esta espera, leer títulos o precios devuelve listas vacías.
   */
  async esperarCargado(): Promise<void> {
    await this.titulosProducto.first().waitFor({ state: 'visible' });
    await this.preciosLinea.first().waitFor({ state: 'visible' });
  }

  async obtenerTitulos(): Promise<string[]> {
    return (await this.titulosProducto.allInnerTexts()).map((t) => t.trim());
  }

  async obtenerTotal(): Promise<number> {
    return parsearPrecio(await this.total.innerText());
  }

  async obtenerPreciosLinea(): Promise<number[]> {
    return (await this.preciosLinea.allInnerTexts()).map(parsearPrecio);
  }

  async obtenerCantidad(indice = 0): Promise<number> {
    return Number(await this.cantidades.nth(indice).inputValue());
  }

  async continuarAlSiguientePaso(): Promise<void> {
    await this.proceder.click();
  }
}
