import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.title = page.locator('.title');
  }

  async open(): Promise<void> {
    await this.goto('/inventory.html');
  }

  async getItemCount(): Promise<number> {
    return this.items.count();
  }

  /** Agrega un producto por su nombre visible, no por índice: sobrevive a reordenamientos. */
  async addToCart(productName: string): Promise<void> {
    await this.itemCard(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.itemCard(productName).getByRole('button', { name: 'Remove' }).click();
  }

  async getPrice(productName: string): Promise<number> {
    const raw = await this.itemCard(productName).locator('.inventory_item_price').innerText();
    return parsePrice(raw);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getAllNames(): Promise<string[]> {
    return (await this.itemNames.allInnerTexts()).map((t) => t.trim());
  }

  async getAllPrices(): Promise<number[]> {
    return (await this.itemPrices.allInnerTexts()).map(parsePrice);
  }

  async openProductDetail(productName: string): Promise<void> {
    await this.itemNames.filter({ hasText: productName }).first().click();
  }

  private itemCard(productName: string): Locator {
    return this.items.filter({ hasText: productName }).first();
  }
}

/** "$29.99" -> 29.99 */
export function parsePrice(raw: string): number {
  return Number(raw.replace(/[^0-9.]/g, ''));
}
