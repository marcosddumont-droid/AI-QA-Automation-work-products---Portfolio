import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usuario: Locator;
  readonly password: Locator;
  readonly botonLogin: Locator;
  readonly mensajeError: Locator;
  readonly enlaceRegistro: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usuario = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.botonLogin = page.locator('input[value="Log In"]');
    // El panel de error solo tiene contenido cuando hay un fallo real:
    // el div existe siempre en el DOM, por eso se filtra por texto visible.
    this.mensajeError = page.locator('#rightPanel .error');
    this.enlaceRegistro = page.locator('a[href*="register.htm"]');
  }

  async abrir(): Promise<void> {
    await this.page.goto('index.htm');
  }

  async ingresar(usuario: string, password: string): Promise<void> {
    await this.usuario.fill(usuario);
    await this.password.fill(password);
    await this.botonLogin.click();
  }

  async irARegistro(): Promise<void> {
    await this.enlaceRegistro.first().click();
  }
}
