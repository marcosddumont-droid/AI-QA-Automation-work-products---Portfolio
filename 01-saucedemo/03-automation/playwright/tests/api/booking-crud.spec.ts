import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/BookingClient.js';
import { buildBooking } from '../../src/utils/booking-builder.js';
import type { BookingResponse } from '../../src/api/booking.types.js';

test.describe('API Restful-Booker · CRUD de reservas', () => {
  let client: BookingClient;

  test.beforeEach(async ({ request }) => {
    client = new BookingClient(request);
  });

  test('API-01 health check responde 201 @smoke', async () => {
    const response = await client.healthCheck();
    expect(response.status()).toBe(201);
  });

  test('API-02 autenticación devuelve un token válido @smoke', async () => {
    const token = await client.authenticate();
    expect(token).toMatch(/^[a-z0-9]+$/i);
  });

  test('API-03 crear una reserva devuelve los datos enviados @smoke', async () => {
    const booking = buildBooking();

    const response = await client.create(booking);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as BookingResponse;
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking).toMatchObject({
      firstname: booking.firstname,
      lastname: booking.lastname,
      totalprice: booking.totalprice,
      depositpaid: booking.depositpaid,
    });
  });

  test('API-04 recuperar una reserva por id @regression', async () => {
    const booking = buildBooking({ totalprice: 999 });
    const created = (await (await client.create(booking)).json()) as BookingResponse;

    const response = await client.getById(created.bookingid);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ totalprice: 999 });
  });

  test('API-05 actualizar una reserva completa (PUT) @regression', async () => {
    const created = (await (await client.create(buildBooking())).json()) as BookingResponse;
    await client.authenticate();

    const actualizada = buildBooking({ firstname: 'Actualizado', totalprice: 500 });
    const response = await client.update(created.bookingid, actualizada);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      firstname: 'Actualizado',
      totalprice: 500,
    });
  });

  test('API-06 actualización parcial (PATCH) solo cambia el campo enviado @regression', async () => {
    const original = buildBooking();
    const created = (await (await client.create(original)).json()) as BookingResponse;
    await client.authenticate();

    const response = await client.partialUpdate(created.bookingid, { firstname: 'Parcial' });

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      firstname: 'Parcial',
      lastname: original.lastname,
    });
  });

  test('API-07 eliminar una reserva la deja inaccesible @regression', async () => {
    const created = (await (await client.create(buildBooking())).json()) as BookingResponse;
    await client.authenticate();

    const deleteResponse = await client.delete(created.bookingid);
    expect(deleteResponse.status()).toBe(201);

    const getResponse = await client.getById(created.bookingid);
    expect(getResponse.status()).toBe(404);
  });
});

test.describe('API Restful-Booker · casos negativos', () => {
  test('API-08 reserva inexistente devuelve 404 @regression', async ({ request }) => {
    const client = new BookingClient(request);

    const response = await client.getById(99_999_999);

    expect(response.status()).toBe(404);
  });

  test('API-09 credenciales incorrectas no devuelven token @regression', async ({ request }) => {
    const response = await request.post('/auth', {
      data: { username: 'admin', password: 'clave_incorrecta' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { token?: string; reason?: string };
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });

  test('API-10 PUT sin token es rechazado con 403 @regression', async ({ request }) => {
    const client = new BookingClient(request);
    const created = (await (await client.create(buildBooking())).json()) as BookingResponse;

    const response = await request.put(`/booking/${created.bookingid}`, {
      data: buildBooking(),
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(403);
  });

  test('API-11 crear reserva con payload inválido no devuelve 200 @regression', async ({
    request,
  }) => {
    const response = await request.post('/booking', {
      data: { firstname: 'SoloNombre' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).not.toBe(200);
  });
});
