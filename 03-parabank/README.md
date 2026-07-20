# 03 · ParaBank

**Aplicación:** https://parabank.parasoft.com/parabank
**Dominio:** Banca en línea
**Stack E2E:** Playwright + TypeScript

## Por qué esta aplicación

Es el único dominio del portfolio donde **el resultado de una operación es dinero**. Eso cambia el estándar de una aserción: no alcanza con "la transferencia no dio error". Hay que verificar la aritmética de los saldos antes y después.

También obliga a resolver **aislamiento de datos**: la base es compartida y de escritura, así que un usuario fijo haría que cada corrida dependa de lo que dejó la anterior.

## Decisión de diseño: un cliente nuevo por test

La fixture `clienteRegistrado` da de alta un cliente con usuario irrepetible antes de cada test que lo necesita.

```
usuario: qa_<timestamp><aleatorio>
```

Sin esto, los tests de saldo serían inestables: el saldo esperado dependería de las transferencias de corridas anteriores, propias o de cualquier otra persona usando la demo.

## Resultados de la última ejecución

| Suite | Herramienta | Resultado |
|---|---|---|
| E2E UI | Playwright | **13/13** ✅ |
| API | Playwright | **6/6** ✅ |
| API | Newman/Postman | **15/15 aserciones** ✅ |
| Performance | k6 | **32/32 checks** ✅ · p95 314 ms |

## Tres trampas de la aplicación que la suite documenta

**1. La baseURL tiene path.** `page.goto('/index.htm')` con baseURL `https://parabank.parasoft.com/parabank` resuelve a `https://parabank.parasoft.com/index.htm`: la barra inicial descarta el path. Las 13 pruebas fallaban por esto. Se resolvió con barra final en la baseURL y rutas relativas.

**2. Hay varios `h1` visibles a la vez.** La página de transferencia mantiene tres paneles en el DOM —formulario, resultado y error— y alterna cuál muestra. Afirmar sobre el primer `h1` devuelve siempre "Transfer Funds", incluso con la operación completada. Los locators apuntan al panel correcto (`#showResult`), no al primer elemento que coincide.

**3. Los desplegables se pueblan por AJAX.** En transferencia y alta de cuenta, enviar el formulario antes de que los `select` tengan opciones lo manda vacío y **la operación falla en silencio**: la página no cambia y no aparece ningún error. Los Page Objects esperan a que existan las opciones.

## Navegación

| Carpeta | Contenido |
|---|---|
| [`01-test-plan/`](01-test-plan/) | Estrategia, alcance y riesgos del dominio bancario |
| [`02-test-cases/`](02-test-cases/) | 19 casos con IDs trazables |
| [`03-automation/`](03-automation/) | Playwright, Postman, k6 |
| [`04-execution/`](04-execution/) | Bitácora y defectos encontrados |
| [`05-reports/`](05-reports/) | Reportes de las corridas |

## Ejecución

```bash
npm run test:03
newman run 03-parabank/03-automation/postman/parabank-api.postman_collection.json
k6 run 03-parabank/03-automation/k6/smoke-api.js
```
