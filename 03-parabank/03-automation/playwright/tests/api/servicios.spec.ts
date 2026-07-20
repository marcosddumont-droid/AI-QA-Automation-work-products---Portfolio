import { test, expect } from '@playwright/test';

/**
 * ParaBank expone servicios REST bajo /services/bank y /services_proxy/bank.
 * Solo se ejercitan operaciones de lectura y consultas: no se generan
 * movimientos de dinero por API sobre la base compartida de la demo.
 */

const BASE = 'https://parabank.parasoft.com/parabank/services/bank';

test.describe('API · Servicios de ParaBank', () => {
  test('API-01 consultar una cuenta existente devuelve su detalle @smoke', async ({ request }) => {
    const response = await request.get(`${BASE}/accounts/13344`);

    expect(response.status()).toBe(200);
    const cuenta = await response.json();

    expect(cuenta.id).toBe(13344);
    expect(cuenta.customerId).toBeDefined();
    expect(typeof cuenta.balance).toBe('number');
    expect(cuenta.type).toBeTruthy();
  });

  test('API-02 el listado de transacciones de una cuenta responde 200 @regression', async ({
    request,
  }) => {
    const response = await request.get(`${BASE}/accounts/13344/transactions`);

    expect(response.status()).toBe(200);
    const transacciones = await response.json();

    expect(Array.isArray(transacciones)).toBe(true);
  });

  test('API-03 cada transacción cumple el contrato esperado @regression', async ({ request }) => {
    const transacciones = await (await request.get(`${BASE}/accounts/13344/transactions`)).json();

    for (const t of transacciones.slice(0, 10)) {
      expect(t.id, 'toda transacción tiene id').toBeDefined();
      expect(t.accountId, 'toda transacción pertenece a una cuenta').toBeDefined();
      expect(typeof t.amount, 'el monto es numérico').toBe('number');
      expect(t.type, 'toda transacción tiene tipo').toBeTruthy();
    }
  });

  test('API-04 una cuenta inexistente no devuelve datos @regression', async ({ request }) => {
    const response = await request.get(`${BASE}/accounts/99999999`);

    // Comportamiento real verificado: responde 400, no 404.
    // Discutible desde el diseño de la API (el recurso no existe, la petición
    // está bien formada), pero el test documenta lo que hace, no lo que
    // debería hacer. La observación queda en el reporte de bugs como BUG-201.
    expect(response.status()).toBe(400);
  });

  test('API-05 buscar transacciones por monto @regression', async ({ request }) => {
    const response = await request.get(`${BASE}/accounts/13344/transactions/amount/100`);

    expect([200, 204]).toContain(response.status());
  });

  test('API-06 los clientes se consultan por id @regression', async ({ request }) => {
    const response = await request.get(`${BASE}/customers/12212`);

    expect(response.status()).toBe(200);
    const cliente = await response.json();

    expect(cliente.id).toBe(12212);
    expect(cliente.firstName).toBeTruthy();
    expect(cliente.lastName).toBeTruthy();
  });
});
