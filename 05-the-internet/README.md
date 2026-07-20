# 05 · The Internet (Sauce Labs)

**Aplicación:** https://the-internet.herokuapp.com
**Dominio:** Casos borde de automatización
**Stack E2E:** Playwright + TypeScript

## Por qué esta aplicación

No tiene un flujo de negocio: es una colección de **los escenarios que rompen las suites mal escritas**. iframes, ventanas nuevas, alerts nativos, carga diferida, subida de archivos, autenticación básica, códigos de estado.

El valor de esta suite no es la cobertura funcional sino **demostrar cómo se resuelve cada mecanismo sin recurrir a esperas fijas**. No hay un solo `waitForTimeout` en los 18 casos.

## Resultados de la última ejecución

| Suite | Herramienta | Resultado |
|---|---|---|
| E2E | Playwright | **18/18** ✅ · 42 s |
| Performance | k6 | **25/25 checks** ✅ · p95 174 ms |

## Mecanismos cubiertos

| Mecanismo | Caso | Cómo se resuelve |
|---|---|---|
| Carga diferida (elemento oculto) | TC-01 | Aserción con reintento, sin sleep |
| Carga diferida (elemento inexistente) | TC-02 | `toHaveText` espera a que el nodo se cree |
| Contenido aleatorio | TC-03 | Se afirma la estructura, no el texto |
| iframe | TC-10 | `frameLocator` + espera del body editable |
| Frames anidados | TC-11 | `frameLocator` encadenado |
| Alert / confirm / prompt | TC-20 a TC-22 | Handler registrado **antes** de disparar el diálogo |
| Pestaña nueva | TC-30 | `context.waitForEvent('page')` en paralelo al click |
| Autenticación básica | TC-40 | `httpCredentials` en el contexto |
| Subida de archivos | TC-50 | `setInputFiles` con fixture del repo |
| Menú contextual | TC-51 | `click({ button: 'right' })` con handler de diálogo |
| Tabla ordenable | TC-52 | Comparación contra el array ordenado |
| Hover | TC-53 | `hover()` + aserción de visibilidad |
| Códigos de estado HTTP | TC-60 | Se verifica el estado de cada respuesta |

## Hallazgo: BUG-101

`TC-10` fallaba con un `TimeoutError` genérico en `locator.click`. En lugar de subir el timeout, se leyó el **call log de Playwright**:

```html
<body id="tinymce" contenteditable="false" class="mce-content-body mce-content-readonly">
```

El editor está en **modo solo lectura**. Se midió el atributo a los 0, 1, 3, 6, 10 y 15 segundos: no cambia nunca. La consola revela la causa raíz:

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
All created TinyMCE editors are configured to be read-only.
```

Dos recursos externos de TinyMCE no resuelven por DNS, y la librería degrada el editor a solo lectura en vez de fallar visiblemente.

**La página perdió su propósito:** es el ejemplo de referencia para practicar iframes y el elemento a automatizar no es interactuable.

El test está marcado con `test.fail()` referenciando [BUG-101](04-execution/bug-reports.md): pasa porque falla como se espera, el pipeline no se rompe y el defecto sigue visible en el reporte.

> **Un timeout no dice por qué.** Subirlo habría "arreglado" el síntoma sin encontrar nada.

## Correcciones de la suite

Otros tres fallos iniciales fueron míos, no de la aplicación:

| Caso | Suposición equivocada | Realidad verificada |
|---|---|---|
| TC-03 | 3 bloques de contenido | Son 4. Se cambió por una aserción estructural que no fija el número |
| TC-60 | El 301 se sigue y termina en 200 | Devuelve 301 tal cual |

## Navegación

| Carpeta | Contenido |
|---|---|
| [`01-test-plan/`](01-test-plan/) | Estrategia y alcance |
| [`02-test-cases/`](02-test-cases/) | 18 casos con IDs trazables |
| [`03-automation/`](03-automation/) | Playwright y k6 |
| [`04-execution/`](04-execution/) | Bitácora y BUG-101 |
| [`05-reports/`](05-reports/) | Reportes de las corridas |

## Ejecución

```bash
npm run test:05
k6 run 05-the-internet/03-automation/k6/smoke-endpoints.js
```
