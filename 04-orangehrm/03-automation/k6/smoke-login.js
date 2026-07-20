/**
 * PERF-30 · Smoke de performance sobre OrangeHRM.
 *
 * LÍMITE AUTOIMPUESTO: 1 usuario virtual y think time de 3 s. Solo se piden
 * páginas públicas (la de login): NO se automatiza el inicio de sesión por
 * carga contra un demo compartido.
 *
 *   k6 run smoke-login.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.UI_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const options = {
  vus: 1,
  iterations: 5,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    // OrangeHRM es una SPA pesada: el umbral refleja lo que realmente tarda,
    // no un ideal. Sirve para detectar que el servicio está caído o degradado.
    http_req_duration: ['p(95)<6000'],
  },
};

export default function () {
  const login = http.get(`${BASE}/web/index.php/auth/login`, { tags: { pagina: 'login' } });

  /**
   * OrangeHRM es una SPA de Vue: el HTML que devuelve el servidor NO contiene
   * el formulario de login (ni `name="username"` ni el token CSRF). Todo eso
   * lo renderiza el cliente después de ejecutar el bundle.
   *
   * Por eso k6 verifica lo único que el servidor sí entrega: el contenedor de
   * la aplicación y el bundle. Validar el formulario en sí requiere un
   * navegador real, y de eso se encarga la suite de Cypress.
   */
  check(login, {
    'la página de login responde 200': (r) => r.status === 200,
    'entrega el contenedor de la SPA': (r) => r.body.includes('id="app"'),
    'referencia el bundle de la aplicación': (r) => r.body.includes('app.js'),
  });

  sleep(3);
}
