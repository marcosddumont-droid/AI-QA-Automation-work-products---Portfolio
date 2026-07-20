import type { Page, Locator } from '@playwright/test';

export type OrdenCatalogo =
  | 'name,asc'
  | 'name,desc'
  | 'price,asc'
  | 'price,desc';

/**
 * Catálogo de la tienda (home).
 *
 * Las tarjetas de producto usan `data-test="product-<ULID>"`, y dentro llevan
 * `product-name` y `product-price`, que también empiezan con "product-".
 * Por eso el selector filtra por la etiqueta `a`: si no, contaría de más.
 */
export class HomePage {
  readonly page: Page;
  readonly tarjetas: Locator;
  readonly nombres: Locator;
  readonly precios: Locator;
  readonly buscador: Locator;
  readonly botonBuscar: Locator;
  readonly botonLimpiarBusqueda: Locator;
  readonly ordenamiento: Locator;
  readonly navCarrito: Locator;
  readonly cantidadCarrito: Locator;
  readonly filtros: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tarjetas = page.locator('a[data-test^="product-"]');
    this.nombres = page.locator('[data-test="product-name"]');
    this.precios = page.locator('[data-test="product-price"]');
    this.buscador = page.locator('[data-test="search-query"]');
    this.botonBuscar = page.locator('[data-test="search-submit"]');
    this.botonLimpiarBusqueda = page.locator('[data-test="search-reset"]');
    this.ordenamiento = page.locator('[data-test="sort"]');
    this.navCarrito = page.locator('[data-test="nav-cart"]');
    this.cantidadCarrito = page.locator('[data-test="cart-quantity"]');
    this.filtros = page.locator('[data-test="filters"]');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/');
    await this.tarjetas.first().waitFor({ state: 'visible' });
  }

  async buscar(termino: string): Promise<void> {
    await this.buscador.fill(termino);
    await this.botonBuscar.click();
    // La grilla se re-renderiza: esperar a que la petición termine.
    await this.page.waitForLoadState('networkidle');
  }

  async limpiarBusqueda(): Promise<void> {
    await this.botonLimpiarBusqueda.click();
    await this.page.waitForLoadState('networkidle');
  }

  async ordenarPor(orden: OrdenCatalogo): Promise<void> {
    await this.ordenamiento.selectOption(orden);
    await this.page.waitForLoadState('networkidle');
  }

  async obtenerNombres(): Promise<string[]> {
    return (await this.nombres.allInnerTexts()).map((t) => t.trim());
  }

  async obtenerPrecios(): Promise<number[]> {
    return (await this.precios.allInnerTexts()).map(parsearPrecio);
  }

  async abrirProducto(indice = 0): Promise<void> {
    await this.tarjetas.nth(indice).click();
  }

  async abrirCarrito(): Promise<void> {
    await this.navCarrito.click();
  }
}

/** "$14.15" o "14,15 €" -> 14.15 */
export function parsearPrecio(bruto: string): number {
  return Number(bruto.replace(/[^0-9.,]/g, '').replace(',', '.'));
}
