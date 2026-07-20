import { test, expect } from '@playwright/test';

/**
 * API pública de Practice Software Testing (tienda de herramientas).
 * Documentación: https://api.practicesoftwaretesting.com/api/documentation
 *
 * Solo lectura: no se crean ni modifican recursos en un backend compartido
 * con otras personas que lo usan para aprender.
 */

interface Producto {
  id: string;
  name: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock?: boolean;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
}

interface Paginado<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

test.describe('API · Catálogo de productos', () => {
  test('API-01 el listado de productos responde con estructura paginada @smoke', async ({
    request,
  }) => {
    const response = await request.get('/products');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Paginado<Producto>;

    expect(body.data.length).toBeGreaterThan(0);
    expect(body.current_page).toBe(1);
    expect(body.total).toBeGreaterThan(0);
    expect(body.per_page).toBeGreaterThan(0);
  });

  test('API-02 cada producto cumple el contrato esperado @smoke', async ({ request }) => {
    const body = (await (await request.get('/products')).json()) as Paginado<Producto>;

    for (const producto of body.data) {
      expect(producto.id, 'todo producto tiene id').toBeTruthy();
      expect(producto.name, 'todo producto tiene nombre').toBeTruthy();
      expect(typeof producto.price, 'el precio es numérico').toBe('number');
      expect(producto.price, 'el precio es positivo').toBeGreaterThan(0);
    }
  });

  test('API-03 la paginación devuelve páginas distintas @regression', async ({ request }) => {
    const pagina1 = (await (await request.get('/products?page=1')).json()) as Paginado<Producto>;
    const pagina2 = (await (await request.get('/products?page=2')).json()) as Paginado<Producto>;

    expect(pagina2.current_page).toBe(2);

    const ids1 = pagina1.data.map((p) => p.id);
    const ids2 = pagina2.data.map((p) => p.id);
    const solapados = ids1.filter((id) => ids2.includes(id));

    expect(solapados, 'las páginas no deben compartir productos').toEqual([]);
  });

  test('API-04 el filtro por rango de precio respeta los límites @regression', async ({
    request,
  }) => {
    const response = await request.get('/products?between=price,1,20');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Paginado<Producto>;

    for (const producto of body.data) {
      expect(producto.price).toBeGreaterThanOrEqual(1);
      expect(producto.price).toBeLessThanOrEqual(20);
    }
  });

  test('API-05 la búsqueda por nombre devuelve coincidencias @regression', async ({ request }) => {
    const response = await request.get('/products/search?q=pliers');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Paginado<Producto>;

    expect(body.data.length).toBeGreaterThan(0);
    for (const producto of body.data) {
      expect(producto.name.toLowerCase()).toContain('pliers');
    }
  });

  test('API-06 un producto inexistente devuelve 404 @regression', async ({ request }) => {
    const response = await request.get('/products/id-que-no-existe-12345');

    expect(response.status()).toBe(404);
  });
});

test.describe('API · Marcas y categorías', () => {
  test('API-07 el listado de marcas responde 200 @smoke', async ({ request }) => {
    const response = await request.get('/brands');

    expect(response.status()).toBe(200);
    const marcas = (await response.json()) as Array<{ id: string; name: string; slug: string }>;

    expect(marcas.length).toBeGreaterThan(0);
    for (const marca of marcas) {
      expect(marca.id).toBeTruthy();
      expect(marca.name).toBeTruthy();
    }
  });

  test('API-08 el listado de categorías responde 200 @regression', async ({ request }) => {
    const response = await request.get('/categories');

    expect(response.status()).toBe(200);
    const categorias = (await response.json()) as Array<{ id: string; name: string }>;

    expect(categorias.length).toBeGreaterThan(0);
  });

  test('API-09 una marca inexistente devuelve 404 @regression', async ({ request }) => {
    const response = await request.get('/brands/marca-inexistente-99999');

    expect(response.status()).toBe(404);
  });
});

test.describe('API · Autenticación', () => {
  test('API-10 el login con credenciales inválidas es rechazado @regression', async ({
    request,
  }) => {
    const response = await request.post('/users/login', {
      data: { email: 'no-existe@ejemplo.com', password: 'clave_incorrecta' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 422]).toContain(response.status());

    const body = await response.json();
    expect(body.access_token, 'no debe emitir token').toBeFalsy();
  });

  test('API-11 el login sin campos obligatorios devuelve error de validación @regression', async ({
    request,
  }) => {
    const response = await request.post('/users/login', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    expect([401, 422]).toContain(response.status());
  });

  test('API-12 un endpoint protegido sin token es rechazado @smoke', async ({ request }) => {
    const response = await request.get('/users/me');

    expect([401, 403]).toContain(response.status());
  });
});
