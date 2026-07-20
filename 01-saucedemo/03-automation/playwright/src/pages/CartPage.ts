import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { parsePrice } from './InventoryPage.js';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async open(): Promise<void> {
    await this.goto('/cart.html');
  }

  async getItemNames(): Promise<string[]> {
    return (await this.itemNames.allInnerTexts()).map((t) => t.trim());
  }

  async getSubtotal(): Promise<number> {
    const prices = await this.items.locator('.inventory_item_price').allInnerTexts();
    return round2(prices.map(parsePrice).reduce((acc, p) => acc + p, 0));
  }

  async removeItem(productName: string): Promise<void> {
    await this.items
      .filter({ hasText: productName })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
