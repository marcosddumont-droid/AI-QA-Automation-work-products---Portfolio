# Bitácora de ejecución · OrangeHRM

## Ciclo 0 — Cypress no arrancaba

Antes de correr un solo test:

```
[ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073741790
[FATAL:gpu_data_manager_impl_private.cc(448)] GPU process isn't usable. Goodbye.
```

`exit_code=-1073741790` es `0xC0000022`: **ACCESS_DENIED**. Electron no puede levantar su proceso GPU.

### Tres intentos hasta dar con la solución

| Intento | Qué se hizo | Resultado |
|---|---|---|
| 1 | Flags en `before:browser:launch` del config | ❌ Ese hook no aplica a Electron |
| 2 | `process.env` al inicio de `cypress.config.js` | ❌ Llega tarde: Electron arranca antes de que se lea el config |
| 3 | Variable de entorno antes de lanzar el binario | ✅ |

El intento 3 falló primero con `ERR_FAILED (-2) loading 'about:blank'`: **`--in-process-gpu` necesita `--no-sandbox`**. Los dos flags van juntos o ninguno.

**Solución final:** [`tools/run-cypress.mjs`](../../tools/run-cypress.mjs) fija `ELECTRON_EXTRA_LAUNCH_ARGS` y lanza Cypress como proceso hijo. `npm run test:04` lo invoca, así que funciona sin que nadie tenga que exportar nada a mano.

---

## Ciclo 1 — Autenticación · primera corrida

```
  7 passing
  1 failing  → TC-08 (logout)
```

**Error:**

```
TypeError: The following error originated from your application code, not from Cypress.
It was caused by an unhandled promise rejection.

> Cannot read properties of undefined (reading 'response')
    at web/dist/js/app.js:1:11603
    at async ln.request (chunk-vendors.js:144:83035)
```

**Diagnóstico:** el error viene del bundle de OrangeHRM, no del test. Al navegar fuera del dashboard, las peticiones XHR en vuelo se abortan; en una petición abortada el error de axios **no tiene `response`**, y el interceptor de la aplicación lo accede sin verificar.

Es un defecto real: [BUG-301](bug-reports.md).

**Decisión:** el filtro de `uncaught:exception` ya existente cubría `'Cannot read properties of null'`, pero este error dice `undefined`. En lugar de ampliarlo a un comodín, se reescribió como **lista explícita de defectos conocidos**, cada uno con ticket, descripción y registro en el log de la corrida.

Un `return false` genérico habría silenciado también los errores reales que la suite tiene que detectar.

```
  8 passing (4m 34s)
```

---

## Ciclo 2 — PIM · primera corrida

```
  9 passing
  1 failing  → TC-20
```

**Error:**

```
AssertionError: Timed out retrying after 15000ms:
expected '<span.oxd-text.oxd-text--span>' to match /\(\d+\) Records Found/
```

**Diagnóstico:** error mío. En Cypress, `should('match', ...)` sobre un elemento compara **selectores CSS**, no texto. El elemento existía y su texto era correcto.

**Corrección:**

```js
// mal — 'match' compara selectores CSS
pimPage.contadorDeRegistros().should('match', /\(\d+\) Records Found/);

// bien — se extrae el texto primero
pimPage.contadorDeRegistros().invoke('text').should('match', /\(\d+\) Records Found/);
```

```
  10 passing (1m 43s)
```

---

## Ciclo 3 — Corrida final

| Spec | Casos | Aprobados | Duración |
|---|---|---|---|
| `autenticacion.cy.js` | 8 | 8 | 4m 34s |
| `pim.cy.js` | 10 | 10 | 1m 43s |
| **Total** | **18** | **18** | **6m 21s** |

### Sobre los tiempos

Los tests de autenticación tardan ~35 s cada uno porque **cada uno hace login de verdad**: están probando justamente eso, así que no pueden usar la sesión cacheada.

Los de PIM promedian ~7 s porque `cy.session` restaura cookies y `localStorage` en lugar de repetir el login. La diferencia —35 s contra 7 s— muestra cuánto pesa el login contra este demo.

| Caso | Duración | Motivo |
|---|---|---|
| TC-08 (logout) | 108 s | Hace login, logout y dos verificaciones de acceso, con reintentos |
| TC-01 (login) | 37 s | Login real |
| TC-21 (columnas) | 4 s | Sesión restaurada |

---

## Ciclo 4 — Performance con k6

**Escenario:** PERF-30 · 1 VU, 5 iteraciones sobre la página de login

**Primera corrida — 5 de 15 checks:**

```
✗ entrega el formulario      0% — ✓ 0 / ✗ 5
✗ incluye el token CSRF      0% — ✓ 0 / ✗ 5
```

**Diagnóstico:** no era un problema del sitio. OrangeHRM es una **SPA de Vue**: el HTML que devuelve el servidor son 3.4 KB con un `<div id="app">` y la referencia al bundle. El formulario, el campo `username` y el token CSRF los genera el cliente al ejecutar JavaScript.

Verificado con una petición directa:

```
id="app"     : True
app.js       : True
username     : False
_token       : False
csrf         : False
```

**Corrección:** k6 ahora verifica lo único que el servidor sí entrega —el contenedor de la SPA y el bundle— con un comentario que aclara que la validación del formulario es responsabilidad de la suite Cypress.

**Corrida final:**

| Métrica | Valor | Umbral | Estado |
|---|---|---|---|
| `checks` | 15 / 15 | — | ✅ 100 % |
| `http_req_failed` | 0.00 % | < 5 % | ✅ |
| `http_req_duration` p(95) | 386.13 ms | < 6000 ms | ✅ |
| `http_req_duration` avg | 377.99 ms | — | — |

**Lección registrada:** una herramienta de carga HTTP no ve lo mismo que un navegador. Contra una SPA, medir "el formulario está en la respuesta" da un falso negativo garantizado.

---

## Resumen de defectos

| ID | Título | Severidad | Estado |
|---|---|---|---|
| [BUG-301](bug-reports.md) | Promesa rechazada sin manejar al cerrar sesión | Media | Abierto · verificado |
| [BUG-302](bug-reports.md) | Bucle de ResizeObserver en el layout | Baja | Abierto |
