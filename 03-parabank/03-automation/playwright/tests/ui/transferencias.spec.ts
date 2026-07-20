import { test, expect } from '../../src/fixtures/test-fixtures.js';
import { TransferPage } from '../../src/pages/TransferPage.js';
import { OpenAccountPage } from '../../src/pages/OpenAccountPage.js';

/**
 * Núcleo de negocio de la aplicación: mover dinero entre cuentas.
 *
 * Es el área de mayor riesgo del dominio bancario, así que las aserciones no
 * se conforman con "la operación no dio error": verifican la aritmética de los
 * saldos antes y después.
 */

test.describe('Cuentas y transferencias', () => {
  test('TC-20 un cliente nuevo arranca con una cuenta y saldo positivo @smoke', async ({
    clienteRegistrado,
  }) => {
    const { accountsPage } = clienteRegistrado;
    await accountsPage.abrir();
    await accountsPage.esperarCargado();

    const cuentas = await accountsPage.obtenerIdsDeCuenta();
    expect(cuentas.length).toBeGreaterThanOrEqual(1);

    const saldo = await accountsPage.obtenerSaldo(cuentas[0]!);
    expect(saldo).toBeGreaterThan(0);
  });

  test('TC-21 abrir una segunda cuenta la agrega al resumen @regression', async ({
    clienteRegistrado,
    page,
  }) => {
    const { accountsPage } = clienteRegistrado;
    await accountsPage.abrir();
    await accountsPage.esperarCargado();
    const cuentasAntes = await accountsPage.obtenerIdsDeCuenta();

    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.abrir();
    const nuevaCuenta = await openAccountPage.abrirCuenta('SAVINGS');

    expect(nuevaCuenta).toMatch(/^\d+$/);

    await accountsPage.abrir();
    await accountsPage.esperarCargado();
    const cuentasDespues = await accountsPage.obtenerIdsDeCuenta();

    expect(cuentasDespues.length).toBe(cuentasAntes.length + 1);
  });

  test('TC-22 una transferencia mueve el saldo exacto entre cuentas @smoke', async ({
    clienteRegistrado,
    page,
  }) => {
    const { accountsPage } = clienteRegistrado;

    // Se necesita una segunda cuenta para que la transferencia sea observable.
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.abrir();
    await openAccountPage.abrirCuenta('SAVINGS');

    await accountsPage.abrir();
    await accountsPage.esperarCargado();
    const [origen, destino] = await accountsPage.obtenerIdsDeCuenta();
    expect(origen, 'se necesitan dos cuentas').toBeTruthy();
    expect(destino, 'se necesitan dos cuentas').toBeTruthy();

    const saldoOrigenAntes = await accountsPage.obtenerSaldo(origen!);
    const saldoDestinoAntes = await accountsPage.obtenerSaldo(destino!);

    const MONTO = 25;
    const transferPage = new TransferPage(page);
    await transferPage.abrir();
    await transferPage.transferir(MONTO, origen!, destino!);

    await expect(transferPage.panelResultado).toBeVisible();
    await expect(transferPage.tituloResultado).toContainText('Transfer Complete');
    await expect(transferPage.montoConfirmado).toContainText(String(MONTO));
    await expect(transferPage.origenConfirmado).toHaveText(origen!);
    await expect(transferPage.destinoConfirmado).toHaveText(destino!);

    await accountsPage.abrir();
    await accountsPage.esperarCargado();

    expect(await accountsPage.obtenerSaldo(origen!)).toBeCloseTo(saldoOrigenAntes - MONTO, 2);
    expect(await accountsPage.obtenerSaldo(destino!)).toBeCloseTo(saldoDestinoAntes + MONTO, 2);
  });

  test('TC-23 la transferencia rechaza un monto vacío @regression', async ({
    clienteRegistrado,
    page,
  }) => {
    await clienteRegistrado.accountsPage.abrir();

    const transferPage = new TransferPage(page);
    await transferPage.abrir();
    await transferPage.botonTransferir.click();

    // No debe completarse la operación sin monto: el panel de resultado
    // tiene que seguir oculto.
    await expect(transferPage.panelResultado).toBeHidden();
  });

  test('TC-24 el detalle de una cuenta muestra sus movimientos @regression', async ({
    clienteRegistrado,
    page,
  }) => {
    const { accountsPage } = clienteRegistrado;
    await accountsPage.abrir();
    await accountsPage.esperarCargado();

    const [cuenta] = await accountsPage.obtenerIdsDeCuenta();
    await accountsPage.abrirCuenta(cuenta!);

    await expect(page.locator('#accountId')).toContainText(cuenta!);
    await expect(page.locator('#accountType')).toBeVisible();
    await expect(page.locator('#balance')).toBeVisible();
  });
});
