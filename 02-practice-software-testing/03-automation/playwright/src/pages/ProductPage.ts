import type { Page, Locator } from '@playwright/test';
import { parsearPrecio } from './HomePage.js';

export class ProductPage {
  readonly page: Page;
  readonly nombre: Locator;
  readonly precioUnitario: Locator;
  readonly descripcion: Locator;
  readonly cantidad: Locator;
  readonly aumentarCantidad: Locator;
  readonly disminuirCantidad: Locator;
  readonly agregarAlCarrito: Locator;
  readonly agregarAFavoritos: Locator;
  readonly navCarrito: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nombre = page.locator('[data-test="product-name"]');
    this.precioUnitario = page.locator('[data-test="unit-price"]');
    this.descripcion = page.locator('[data-test="product-description"]');
    this.cantidad = page.locator('[data-test="quantity"]');
    this.aumentarCantidad = page.locator('[data-test="increase-quantity"]');
    this.disminuirCantidad = page.locator('[data-test="decrease-quantity"]');
    this.agregarAlCarrito = page.locator('[data-test="add-to-cart"]');
    this.agregarAFavoritos = page.locator('[data-test="add-to-favorites"]');
    this.navCarrito = page.locator('[data-test="nav-cart"]');
  }

  async obtenerNombre(): Promise<string> {
    return (await this.nombre.innerText()).trim();
  }

  async obtenerPrecioUnitario(): Promise<number> {
    return parsearPrecio(await this.precioUnitario.innerText());
  }

  async fijarCantidad(valor: number): Promise<void> {
    await this.cantidad.fill(String(valor));
  }

  async agregar(): Promise<void> {
    await this.agregarAlCarrito.click();
    // El ícono del carrito aparece recién cuando hay algo dentro.
    await this.navCarrito.waitFor({ state: 'visible' });
  }

  async irAlCarrito(): Promise<void> {
    await this.navCarrito.click();
  }
}
