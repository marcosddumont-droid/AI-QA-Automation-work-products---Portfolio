import type { Page, Locator } from '@playwright/test';
import type { Cliente } from '../data/cliente.js';

export class RegisterPage {
  readonly page: Page;
  readonly titulo: Locator;
  readonly botonRegistrar: Locator;
  readonly mensajeBienvenida: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titulo = page.locator('#rightPanel h1').first();
    this.botonRegistrar = page.locator('input[value="Register"]');
    this.mensajeBienvenida = page.locator('#rightPanel p').first();
  }

  async abrir(): Promise<void> {
    await this.page.goto('register.htm');
  }

  async completarYEnviar(cliente: Cliente): Promise<void> {
    await this.page.fill('input[id="customer.firstName"]', cliente.nombre);
    await this.page.fill('input[id="customer.lastName"]', cliente.apellido);
    await this.page.fill('input[id="customer.address.street"]', cliente.calle);
    await this.page.fill('input[id="customer.address.city"]', cliente.ciudad);
    await this.page.fill('input[id="customer.address.state"]', cliente.provincia);
    await this.page.fill('input[id="customer.address.zipCode"]', cliente.codigoPostal);
    await this.page.fill('input[id="customer.phoneNumber"]', cliente.telefono);
    await this.page.fill('input[id="customer.ssn"]', cliente.ssn);
    await this.page.fill('input[id="customer.username"]', cliente.usuario);
    await this.page.fill('input[id="customer.password"]', cliente.password);
    await this.page.fill('input[id="repeatedPassword"]', cliente.password);
    await this.botonRegistrar.click();
  }

  /** Errores de validación por campo que muestra el formulario. */
  erroresDeValidacion(): Locator {
    return this.page.locator('#rightPanel .error');
  }
}
