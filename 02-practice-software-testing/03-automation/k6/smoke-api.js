/**
 * PERF-10 · Smoke de performance sobre la API de Practice Software Testing.
 *
 * LÍMITE AUTOIMPUESTO: 2 usuarios virtuales y think time de 2 s. Equivale a
 * dos personas navegando el catálogo. NO subir los VUs: es infraestructura de
 * terceros. Los perfiles de carga reales van contra el mock local
 * (ver 01-saucedemo/03-automation/k6/carga-mock.js).
 *
 *   k6 run smoke-api.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE = __ENV.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

const latenciaCatalogo = new Trend('latencia_catalogo');
const latenciaBusqueda = new Trend('latencia_busqueda');

export const options = {
  vus: 2,
  iterations: 10,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    // Umbral holgado a propósito: se mide un servicio público sobre internet,
    // no un entorno controlado. Sirve para detectar caídas y degradaciones
    // groseras, no para fijar un SLA.
    http_req_duration: ['p(95)<4000'],
    latencia_catalogo: ['p(95)<3000'],
  },
};

export default function () {
  const catalogo = http.get(`${BASE}/products`, { tags: { endpoint: 'products' } });
  latenciaCatalogo.add(catalogo.timings.duration);
  check(catalogo, {
    'catálogo responde 200': (r) => r.status === 200,
    'catálogo trae productos': (r) => (r.json('data')?.length ?? 0) > 0,
  });

  sleep(2);

  const busqueda = http.get(`${BASE}/products/search?q=pliers`, { tags: { endpoint: 'search' } });
  latenciaBusqueda.add(busqueda.timings.duration);
  check(busqueda, {
    'búsqueda responde 200': (r) => r.status === 200,
  });

  sleep(2);

  const marcas = http.get(`${BASE}/brands`, { tags: { endpoint: 'brands' } });
  check(marcas, {
    'marcas responde 200': (r) => r.status === 200,
  });

  sleep(2);
}
