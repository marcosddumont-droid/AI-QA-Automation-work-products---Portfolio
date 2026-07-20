# 02 · Practice Software Testing (Toolshop)

**Aplicación:** https://practicesoftwaretesting.com
**API:** https://api.practicesoftwaretesting.com
**Dominio:** Tienda de herramientas
**Stack E2E:** Playwright + TypeScript

## Por qué esta aplicación

Es la única del portfolio con una **API REST propia, pública y documentada** junto a su interfaz. Eso permite mostrar la decisión que más define una estrategia de testing: **qué se prueba en API y qué en UI, sin duplicar**.

## Cómo se repartió la cobertura

| Se prueba en | Qué | Por qué |
|---|---|---|
| **API** | Contrato de productos, paginación, filtros por precio, búsqueda, 404, autenticación | Son reglas de datos. No dependen de la interfaz y en API se validan en milisegundos |
| **UI** | Que el catálogo se renderice, ordenamiento visible, carrito, aritmética del checkout | Solo se puede verificar de punta a punta: involucra estado del cliente y render |

El ordenamiento por precio se prueba en las dos capas **a propósito**: en API valida que el backend ordene bien, en UI que la grilla refleje ese orden. Son dos riesgos distintos.

## Resultados de la última ejecución

| Suite | Herramienta | Resultado |
|---|---|---|
| API | Playwright | **12/12** ✅ |
| E2E UI | Playwright | **13/13** ✅ |
| API | Newman/Postman | **18/18 aserciones** ✅ |
| Performance | k6 | **40/40 checks** ✅ · p95 504 ms |
| Performance | JMeter | **30 muestras, 0 errores** ✅ · avg 824 ms |

## Lección de la ejecución

La primera corrida tuvo **5 tests fallando por timeout**. No era la aplicación: eran 4 workers en paralelo contra un demo público, que empezó a limitar las peticiones.

Bajar a **2 workers** no solo los puso en verde: la suite pasó de **1 min 30 s a 48 s**. Menos concurrencia contra un servidor compartido resultó más rápido. Está documentado en [`playwright.config.ts`](03-automation/playwright/playwright.config.ts).

Otros 3 fallos iniciales fueron carreras propias: el carrito se renderiza del lado del cliente y tarda ~3 s, y los tests leían antes. Se corrigieron con esperas explícitas y aserciones que reintentan, no subiendo timeouts a ciegas.

## Navegación

| Carpeta | Contenido |
|---|---|
| [`01-test-plan/`](01-test-plan/) | Estrategia, alcance y criterios |
| [`02-test-cases/`](02-test-cases/) | 25 casos con IDs trazables |
| [`03-automation/`](03-automation/) | Playwright, Postman, k6, JMeter |
| [`04-execution/`](04-execution/) | Bitácora de ejecución |
| [`05-reports/`](05-reports/) | Reportes de las corridas |

## Ejecución

```bash
npm install && npx playwright install
npm run test:02
newman run 02-practice-software-testing/03-automation/postman/practice-api.postman_collection.json
k6 run 02-practice-software-testing/03-automation/k6/smoke-api.js
```
