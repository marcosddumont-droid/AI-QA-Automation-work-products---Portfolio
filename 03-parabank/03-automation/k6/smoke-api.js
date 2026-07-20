/**
 * PERF-20 · Smoke de performance sobre los servicios REST de ParaBank.
 *
 * LÍMITE AUTOIMPUESTO: 1 usuario virtual, solo lecturas, think time de 2 s.
 * No se generan movimientos de dinero ni se crean clientes por API: es una
 * base compartida con otras personas que la usan para aprender.
 *
 *   k6 run smoke-api.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.API_BASE_URL || 'https://parabank.parasoft.com/parabank/services/bank';
const CUENTA = __ENV.CUENTA || '13344';

export const options = {
  vus: 1,
  iterations: 8,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
  },
};

export default function () {
  const cuenta = http.get(`${BASE}/accounts/${CUENTA}`, {
    headers: { Accept: 'application/json' },
    tags: { endpoint: 'account' },
  });
  check(cuenta, {
    'la cuenta responde 200': (r) => r.status === 200,
    'la cuenta trae saldo numérico': (r) => typeof r.json('balance') === 'number',
  });

  sleep(2);

  const transacciones = http.get(`${BASE}/accounts/${CUENTA}/transactions`, {
    headers: { Accept: 'application/json' },
    tags: { endpoint: 'transactions' },
  });
  check(transacciones, {
    'las transacciones responden 200': (r) => r.status === 200,
    'las transacciones son una lista': (r) => Array.isArray(r.json()),
  });

  sleep(2);
}
