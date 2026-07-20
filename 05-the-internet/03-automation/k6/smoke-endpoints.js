/**
 * PERF-40 · Smoke de performance sobre The Internet.
 *
 * LÍMITE AUTOIMPUESTO: 1 usuario virtual, think time de 2 s.
 *
 * Además de medir latencia, verifica que los códigos de estado sean los que la
 * aplicación promete. Es un caso interesante porque `/status_codes/500`
 * devuelve 500 A PROPÓSITO: un chequeo ingenuo de "todo debe ser 2xx" daría
 * un falso positivo. Por eso el umbral de error se calcula sobre una métrica
 * propia y no sobre http_req_failed.
 *
 *   k6 run smoke-endpoints.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE = __ENV.UI_BASE_URL || 'https://the-internet.herokuapp.com';

const codigoInesperado = new Rate('codigo_inesperado');

/** Rutas con el estado que cada una debe devolver. */
const RUTAS = [
  { ruta: '/', esperado: 200 },
  { ruta: '/login', esperado: 200 },
  { ruta: '/tables', esperado: 200 },
  { ruta: '/status_codes/404', esperado: 404 },
  { ruta: '/status_codes/500', esperado: 500 },
];

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_duration: ['p(95)<4000'],
    codigo_inesperado: ['rate<0.01'],
  },
};

export default function () {
  for (const { ruta, esperado } of RUTAS) {
    const res = http.get(`${BASE}${ruta}`, {
      tags: { ruta },
      // Sin esto k6 marcaría los 404 y 500 intencionales como fallos.
      responseCallback: http.expectedStatuses(esperado),
    });

    const ok = check(res, {
      [`${ruta} devuelve ${esperado}`]: (r) => r.status === esperado,
    });
    codigoInesperado.add(!ok);

    sleep(2);
  }
}
