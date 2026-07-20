# 01 · SauceDemo

**Aplicación:** https://www.saucedemo.com
**Dominio:** E-commerce
**Stack E2E:** Playwright + TypeScript

## Por qué esta aplicación

SauceDemo tiene **defectos inyectados a propósito** y usuarios que se comportan distinto (`problem_user` rompe imágenes y formularios, `performance_glitch_user` responde degradado). Eso la vuelve ideal para lo que más cuesta en la práctica: **distinguir un bug de la aplicación de un test mal escrito**.

## Alcance

| Área | Casos | Tipo |
|---|---|---|
| Autenticación | 7 | E2E UI |
| Catálogo y carrito | 6 | E2E UI |
| Checkout | 6 | E2E UI |
| API | 7 | Postman / Newman |
| Performance | 3 | k6 + JMeter |
| Accesibilidad | 3 | axe-core |

## Resultados de la última ejecución

| Suite | Herramienta | Resultado | Detalle |
|---|---|---|---|
| E2E UI | Playwright | **19/19** ✅ | Chromium |
| API | Newman | **20/20 aserciones** ✅ | 7 requests |
| Carga (mock) | k6 | **4614/4614 checks** ✅ | p95 = 95 ms |
| Carga (mock) | JMeter | **308 muestras, 0 errores** ✅ | avg 74 ms |
| Accesibilidad | axe-core | **3/3** ✅ | 1 fallo esperado documentado |

Los reportes están en [`05-reports/`](05-reports/).

## Hallazgo principal

El escaneo de accesibilidad detectó que el **desplegable de ordenamiento no tiene nombre accesible** (WCAG 4.1.2, nivel A). Un usuario de lector de pantalla escucha "cuadro combinado" sin saber qué controla.

Está documentado como [BUG-006](04-execution/bug-reports.md) y el test correspondiente está marcado con `test.fail()` referenciando el bug: la suite refleja el estado real de la aplicación sin romper el pipeline.

## Navegación

| Carpeta | Contenido |
|---|---|
| [`01-test-plan/`](01-test-plan/) | Estrategia, alcance, riesgos y criterios de salida |
| [`02-test-cases/`](02-test-cases/) | 22 casos documentados con IDs trazables |
| [`03-automation/`](03-automation/) | Playwright, Postman, k6 y JMeter |
| [`04-execution/`](04-execution/) | Bitácora de ejecución y bugs encontrados |
| [`05-reports/`](05-reports/) | Reportes de las corridas reales |

## Ejecución rápida

```bash
cd 03-automation/playwright
npm install && npx playwright install
npm run test:smoke        # ~1 min
npm test                  # suite completa
```
