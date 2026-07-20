import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { Booking } from './booking.types.js';

/**
 * Cliente de la API pública Restful-Booker.
 * Encapsula endpoints y auth para que los tests afirmen sobre respuestas,
 * no sobre detalles de transporte.
 */
export class BookingClient {
  private token: string | null = null;

  constructor(private readonly request: APIRequestContext) {}

  /** Restful-Booker usa un token de sesión en cookie para PUT/DELETE. */
  async authenticate(
    username = 'admin',
    password = 'password123',
  ): Promise<string> {
    const response = await this.request.post('/auth', {
      data: { username, password },
    });
    const body = (await response.json()) as { token?: string; reason?: string };
    if (!body.token) {
      throw new Error(`Auth falló: ${body.reason ?? response.status()}`);
    }
    this.token = body.token;
    return this.token;
  }

  async getIds(): Promise<APIResponse> {
    return this.request.get('/booking');
  }

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  async create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', {
      data: booking,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async update(id: number, booking: Booking): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: this.authHeaders(),
    });
  }

  async partialUpdate(id: number, patch: Partial<Booking>): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: patch,
      headers: this.authHeaders(),
    });
  }

  async delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: this.authHeaders(),
    });
  }

  async healthCheck(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  private authHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('No hay token. Llamá a authenticate() antes de esta operación.');
    }
    return {
      'Content-Type': 'application/json',
      Cookie: `token=${this.token}`,
    };
  }
}
