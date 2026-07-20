import type { Page, Locator } from '@playwright/test';

/**
 * Base de todos los Page Objects.
 * Concentra la navegación y los elementos que se repiten en el header,
 * para que las páginas hijas solo declaren lo que es propio de ellas.
 */
export abstract class BasePage {
  protected readonly page: Page;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Cantidad de ítems en el carrito. El badge no existe cuando está vacío. */
  async getCartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number(await this.cartBadge.innerText());
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
