import type { Booking } from '../api/booking.types.js';

function isoDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]!;
}

/**
 * Builder de reservas. Genera datos únicos por defecto para que los tests
 * puedan correr en paralelo contra una API compartida sin pisarse entre sí.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = Date.now().toString().slice(-6);
  return {
    firstname: `Test${unique}`,
    lastname: `Apellido${unique}`,
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: isoDate(1),
      checkout: isoDate(5),
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
