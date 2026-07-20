import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/pages/HomePage.js';
import { ProductPage } from '../../src/pages/ProductPage.js';
import { CheckoutPage } from '../../src/pages/CheckoutPage.js';

test.describe('Catálogo', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.abrir();
  });

  test('TC-01 la home lista productos con nombre y precio @smoke', async () => {
    const cantidad = await home.tarjetas.count();
    expect(cantidad).toBeGreaterThan(0);

    const nombres = await home.obtenerNombres();
    const precios = await home.obtenerPrecios();

    expect(nombres.length).toBe(cantidad);
    expect(nombres.every((n) => n.length > 0), 'ningún nombre vacío').toBe(true);
    expect(precios.every((p) => p > 0), 'todos los precios son positivos').toBe(true);
  });

  test('TC-02 la búsqueda filtra por nombre @smoke', async () => {
    await home.buscar('pliers');

    const nombres = await home.obtenerNombres();

    expect(nombres.length).toBeGreaterThan(0);
    for (const nombre of nombres) {
      expect(nombre.toLowerCase()).toContain('pliers');
    }
  });

  test('TC-03 una búsqueda sin resultados no rompe la página @regression', async ({ page }) => {
    await home.buscar('zzzz-producto-inexistente-9999');

    // El criterio es que la app no explote y comunique el estado vacío,
    // no que muestre un texto puntual: eso lo cambia cualquier traducción.
    await expect(page.locator('body')).toBeVisible();
    expect(await home.nombres.count()).toBe(0);
  });

  test('TC-04 limpiar la búsqueda restaura el catálogo completo @regression', async () => {
    const totalInicial = await home.tarjetas.count();

    await home.buscar('pliers');
    // expect.poll reintenta: la grilla se re-renderiza del lado del cliente
    // y una lectura puntual con .count() llega antes de tiempo.
    await expect.poll(() => home.tarjetas.count()).toBeLessThan(totalInicial);

    await home.limpiarBusqueda();
    await expect(home.tarjetas).toHaveCount(totalInicial);
  });

  test('TC-05 ordenar por precio ascendente @regression', async () => {
    await home.ordenarPor('price,asc');

    const precios = await home.obtenerPrecios();
    expect(precios).toEqual([...precios].sort((a, b) => a - b));
  });

  test('TC-06 ordenar por precio descendente @regression', async () => {
    await home.ordenarPor('price,desc');

    const precios = await home.obtenerPrecios();
    expect(precios).toEqual([...precios].sort((a, b) => b - a));
  });

  test('TC-07 ordenar por nombre A-Z @regression', async () => {
    await home.ordenarPor('name,asc');

    const nombres = await home.obtenerNombres();
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b)));
  });
});

test.describe('Detalle de producto', () => {
  test('TC-10 el detalle muestra nombre, precio y descripción @smoke', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);

    await expect(producto.nombre).toBeVisible();
    await expect(producto.precioUnitario).toBeVisible();
    await expect(producto.descripcion).toBeVisible();
    expect(await producto.obtenerPrecioUnitario()).toBeGreaterThan(0);
  });

  test('TC-11 el selector de cantidad incrementa el valor @regression', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);
    await expect(producto.cantidad).toHaveValue('1');

    await producto.aumentarCantidad.click();

    await expect(producto.cantidad).toHaveValue('2');
  });
});

test.describe('Carrito', () => {
  test('TC-20 agregar un producto lo refleja en el carrito @smoke', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);
    const nombreEsperado = await producto.obtenerNombre();
    await producto.agregar();
    await producto.irAlCarrito();

    const checkout = new CheckoutPage(page);
    await checkout.esperarCargado();
    const titulos = await checkout.obtenerTitulos();

    expect(titulos).toContain(nombreEsperado);
  });

  test('TC-21 el precio de línea es cantidad × precio unitario @regression', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);
    const precioUnitario = await producto.obtenerPrecioUnitario();
    await producto.fijarCantidad(3);
    await producto.agregar();
    await producto.irAlCarrito();

    const checkout = new CheckoutPage(page);
    await checkout.esperarCargado();
    const cantidad = await checkout.obtenerCantidad(0);
    const [precioLinea] = await checkout.obtenerPreciosLinea();

    expect(cantidad).toBe(3);
    expect(precioLinea).toBeCloseTo(precioUnitario * 3, 2);
  });

  test('TC-22 el total del carrito es la suma de las líneas @regression', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);
    await producto.agregar();
    await producto.irAlCarrito();

    const checkout = new CheckoutPage(page);
    await checkout.esperarCargado();
    const lineas = await checkout.obtenerPreciosLinea();
    const total = await checkout.obtenerTotal();

    const suma = lineas.reduce((acc, p) => acc + p, 0);
    expect(total).toBeCloseTo(suma, 2);
  });

  test('TC-23 el checkout como invitado pide identificarse @regression', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir();
    await home.abrirProducto(0);

    const producto = new ProductPage(page);
    await producto.agregar();
    await producto.irAlCarrito();

    const checkout = new CheckoutPage(page);
    await checkout.continuarAlSiguientePaso();

    // Sin sesión iniciada, el flujo exige login o datos de invitado.
    await expect(page.locator('[data-test="email"], [data-test="guest-email"]').first()).toBeVisible();
  });
});
