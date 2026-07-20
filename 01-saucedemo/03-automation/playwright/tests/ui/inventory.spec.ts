import { test, expect } from '../../src/fixtures/test-fixtures.js';

const PRODUCT = 'Sauce Labs Backpack';

test.describe('Catálogo de productos', () => {
  test('TC-10 el inventario lista los 6 productos con precio @smoke', async ({
    loggedInInventory,
  }) => {
    await expect(loggedInInventory.items).toHaveCount(6);

    const prices = await loggedInInventory.getAllPrices();
    expect(prices).toHaveLength(6);
    expect(prices.every((p) => p > 0)).toBe(true);
  });

  test('TC-11 ordenar por precio ascendente @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('lohi');

    const prices = await loggedInInventory.getAllPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC-12 ordenar por precio descendente @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('hilo');

    const prices = await loggedInInventory.getAllPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('TC-13 ordenar por nombre Z-A @regression', async ({ loggedInInventory }) => {
    await loggedInInventory.sortBy('za');

    const names = await loggedInInventory.getAllNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('TC-14 agregar y quitar un producto actualiza el badge @smoke', async ({
    loggedInInventory,
  }) => {
    expect(await loggedInInventory.getCartCount()).toBe(0);

    await loggedInInventory.addToCart(PRODUCT);
    expect(await loggedInInventory.getCartCount()).toBe(1);

    await loggedInInventory.removeFromCart(PRODUCT);
    expect(await loggedInInventory.getCartCount()).toBe(0);
  });

  test('TC-15 el carrito conserva los ítems al navegar @regression', async ({
    loggedInInventory,
    cartPage,
  }) => {
    await loggedInInventory.addToCart(PRODUCT);
    await loggedInInventory.addToCart('Sauce Labs Bike Light');

    await cartPage.open();

    expect(await cartPage.getItemNames()).toEqual(
      expect.arrayContaining([PRODUCT, 'Sauce Labs Bike Light']),
    );
  });
});
