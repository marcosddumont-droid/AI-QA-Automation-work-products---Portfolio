# 04 · OrangeHRM

**Aplicación:** https://opensource-demo.orangehrmlive.com
**Credenciales:** `Admin` / `admin123`
**Dominio:** Recursos humanos (enterprise)
**Stack E2E:** **Cypress + JavaScript**

## Por qué Cypress acá y Playwright en el resto

Deliberado: **el criterio de testing no depende de la herramienta**. Los mismos principios del resto del portfolio —Page Objects, IDs trazables, cero esperas fijas, bugs conocidos documentados— se aplican con un framework de modelo de ejecución distinto.

Cypress corre **dentro** del navegador y encadena comandos en lugar de usar `async/await`. Eso cambia cómo se escriben los Page Objects: devuelven cadenas de comandos, no promesas.

**Limitación asumida:** Cypress no maneja bien múltiples pestañas ni orígenes cruzados. OrangeHRM se eligió para este stack justamente porque no los necesita. Los casos que sí los requieren (`TC-30`, ventanas nuevas) están en [05-the-internet](../05-the-internet/) con Playwright.

## Resultados de la última ejecución

| Spec | Casos | Resultado |
|---|---|---|
| `autenticacion.cy.js` | 8 | **8/8** ✅ |
| `pim.cy.js` | 10 | **10/10** ✅ |
| k6 smoke | 15 checks | **15/15** ✅ · p95 386 ms |

## Hallazgo: BUG-301

`TC-08` (logout) fallaba de forma consistente. La causa **no era el test**: al cerrar sesión, OrangeHRM aborta las peticiones XHR en vuelo y su interceptor de axios accede a `error.response` sin verificar que exista.

```
TypeError: Cannot read properties of undefined (reading 'response')
    at web/dist/js/app.js:1:11603
```

Cypress falla cualquier test ante una excepción no capturada de la aplicación, así que el defecto rompía la suite.

**Cómo se resolvió:** en lugar de un `return false` genérico que silenciara toda excepción, se filtra **ese mensaje puntual**, con su número de ticket y descripción, y queda registrado en el log de la corrida con `Cypress.log`. Cualquier otro error sigue rompiendo el test, que es lo que se busca.

Detalle completo en [`04-execution/bug-reports.md`](04-execution/bug-reports.md).

## Dos problemas de infraestructura resueltos

**Electron y el proceso GPU.** Cypress moría antes de correr un solo test:

```
[ERROR:gpu_process_host.cc] GPU process exited unexpectedly: exit_code=-1073741790
[FATAL] GPU process isn't usable. Goodbye.
```

Los flags que lo desactivan solo se aceptan por la variable `ELECTRON_EXTRA_LAUNCH_ARGS`, y tiene que estar puesta **antes** de que arranque el binario de Cypress. Fijarla desde `cypress.config.js` llega tarde. Se resolvió con [`tools/run-cypress.mjs`](../tools/run-cypress.mjs), que es lo que invoca `npm run test:04`.

**Sesión cacheada.** Cada login contra el demo tarda ~35 s. Con `cy.session`, solo el primer test lo paga y el resto restaura cookies y `localStorage`. Además de acelerar la suite, evita golpear innecesariamente un servidor compartido.

## Navegación

| Carpeta | Contenido |
|---|---|
| [`01-test-plan/`](01-test-plan/) | Estrategia y limitaciones del stack |
| [`02-test-cases/`](02-test-cases/) | 18 casos con IDs trazables |
| [`03-automation/`](03-automation/) | Cypress y k6 |
| [`04-execution/`](04-execution/) | Bitácora y defectos |
| [`05-reports/`](05-reports/) | Capturas de los fallos |

## Ejecución

```bash
npm run test:04           # modo headless
npm run test:04:open      # runner interactivo
```

> Usar siempre `npm run test:04`, no `cypress run` directo: el script fija los flags de GPU sin los cuales Electron no arranca.
