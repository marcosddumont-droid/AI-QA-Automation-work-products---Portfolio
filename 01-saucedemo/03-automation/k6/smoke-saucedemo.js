/**
 * PERF-02 · Smoke de performance sobre SauceDemo real.
 *
 * IMPORTANTE — límite autoimpuesto:
 * SauceDemo es infraestructura de terceros. Este script usa 1 usuario virtual
 * y 5 iteraciones con think time: equivale a una persona navegando el sitio.
 * NO subir los VUs. Los perfiles de carga reales van contra el mock local
 * (ver carga-mock.js). El fundamento está en 01-test-plan/plan-de-pruebas.md.
 *
 *   k6 run smoke-saucedemo.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'https://www.saucedemo.com';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    // Umbral generoso a propósito: se mide un sitio público sobre internet,
    // no un entorno controlado. Sirve para detectar caídas, no para medir SLA.
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const res = http.get(BASE, { tags: { pagina: 'login' } });

  check(res, {
    'la home responde 200': (r) => r.status === 200,
    'la home trae el formulario de login': (r) => r.body.includes('login-button'),
    'responde en menos de 3 s': (r) => r.timings.duration < 3000,
  });

  sleep(2); // think time deliberadamente alto: no golpear el sitio
}
