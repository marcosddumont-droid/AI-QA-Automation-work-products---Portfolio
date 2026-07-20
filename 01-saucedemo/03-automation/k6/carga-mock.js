/**
 * PERF-01 · Prueba de carga sobre el mock local.
 *
 * Objetivo: encontrar el punto donde la latencia se degrada al subir la
 * concurrencia, y verificar que se cumplan los umbrales acordados.
 *
 * Apunta al mock local (tools/mock-api), NUNCA a los sitios demo.
 *   1. node tools/mock-api/server.js
 *   2. k6 run carga-mock.js
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3001';

const latenciaLogin = new Trend('latencia_login');
const latenciaCatalogo = new Trend('latencia_catalogo');
const erroresNegocio = new Rate('errores_negocio');

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // rampa de subida
    { duration: '30s', target: 30 }, // meseta por encima del umbral de degradación
    { duration: '15s', target: 0 },  // bajada
  ],
  /**
   * Los umbrales son el criterio de aceptación: si no se cumplen, k6 sale
   * con código distinto de cero y el pipeline falla. Sin esto, una prueba de
   * carga es solo un gráfico lindo.
   */
  thresholds: {
    http_req_failed: ['rate<0.01'],              // menos del 1 % de errores HTTP
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    latencia_login: ['p(95)<900'],
    errores_negocio: ['rate<0.02'],
  },
};

export default function () {
  group('login', () => {
    const res = http.post(
      `${BASE}/api/login`,
      JSON.stringify({ usuario: 'demo', password: 'demo123' }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } },
    );

    latenciaLogin.add(res.timings.duration);
    const ok = check(res, {
      'login responde 200': (r) => r.status === 200,
      'login devuelve token': (r) => !!r.json('token'),
    });
    erroresNegocio.add(!ok);
  });

  group('catalogo', () => {
    const res = http.get(`${BASE}/api/products?limit=20`, { tags: { endpoint: 'products' } });

    latenciaCatalogo.add(res.timings.duration);
    const ok = check(res, {
      'catálogo responde 200': (r) => r.status === 200,
      'catálogo devuelve 20 ítems': (r) => r.json('items')?.length === 20,
    });
    erroresNegocio.add(!ok);
  });

  group('crear orden', () => {
    const res = http.post(
      `${BASE}/api/orders`,
      JSON.stringify({ productoId: Math.ceil(Math.random() * 20), cantidad: 1 }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'orders' } },
    );

    const ok = check(res, {
      'orden creada con 201': (r) => r.status === 201,
      'orden confirmada': (r) => r.json('estado') === 'confirmada',
    });
    erroresNegocio.add(!ok);
  });

  sleep(1); // think time: un usuario real no dispara sin pausa
}
