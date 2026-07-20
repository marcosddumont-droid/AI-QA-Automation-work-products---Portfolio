import { test, expect } from '../../src/fixtures/test-fixtures.js';
import { validCustomer, incompleteCustomers } from '../../src/data/checkout.js';
import { round2 } from '../../src/pages/CartPage.js';

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];
const TAX_RATE = 0.08;

test.describe('Flujo de compra', () => {
  test('TC-20 compra end-to-end completa @smoke', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    for (const product of PRODUCTS) {
      await loggedInInventory.addToCart(product);
    }

    await cartPage.open();
    await expect(cartPage.items).toHaveCount(PRODUCTS.length);

    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToSummary();
    await checkoutPage.finish();

    expect(await checkoutPage.getConfirmationText()).toBe('Thank you for your order!');
    expect(await checkoutPage.getCartCount()).toBe(0);
  });

  test('TC-21 el total incluye el impuesto del 8% @regression', async ({
    loggedInInventory,
    cartPage,
    checkoutPage,
  }) => {
    for (const product of PRODUCTS) {
      await loggedInInventory.addToCart(product);
    }

    await cartPage.open();
    const subtotalFromCart = await cartPage.getSubtotal();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo(validCustomer);
    await checkoutPage.continueToSummary();

    const { subtotal, tax, total } = await checkoutPage.getSummaryTotals();

    expect(subtotal).toBe(subtotalFromCart);
    expect(tax).toBe(round2(subtotal * TAX_RATE));
    expect(total).toBe(round2(subtotal + tax));
  });

  // Data-driven sobre las validaciones del formulario.
  for (const { data, error } of incompleteCustomers) {
    const missingField = Object.entries(data).find(([, v]) => v === '')?.[0];

    test(`TC-22 checkout sin ${missingField} muestra error @regression`, async ({
      loggedInInventory,
      cartPage,
      checkoutPage,
    }) => {
      await loggedInInventory.addToCart(PRODUCTS[0]!);
      await cartPage.open();
      await cartPage.proceedToCheckout();

      await checkoutPage.fillCustomerInfo(data);
      await checkoutPage.continueToSummary();

      await expect(checkoutPage.errorMessage).toBeVisible();
      expect(await checkoutPage.getErrorText()).toBe(error);
    });
  }

  test('TC-23 quitar un ítem del carrito baja el subtotal @regression', async ({
    loggedInInventory,
    cartPage,
  }) => {
    for (const product of PRODUCTS) {
      await loggedInInventory.addToCart(product);
    }
    await cartPage.open();
    const subtotalAntes = await cartPage.getSubtotal();

    await cartPage.removeItem(PRODUCTS[0]!);

    await expect(cartPage.items).toHaveCount(1);
    expect(await cartPage.getSubtotal()).toBeLessThan(subtotalAntes);
  });
});
