# Bitácora de ejecución · SauceDemo

Registro de los ciclos de ejecución con resultados reales.

## Ciclo 1 — Suite E2E de interfaz

**Herramienta:** Playwright 1.49 · Chromium · 4 workers en paralelo

```
Running 19 tests using 4 workers
  19 passed (13.7s)
```

| Métrica | Valor |
|---|---|
| Casos ejecutados | 19 |
| Aprobados | 19 |
| Fallidos | 0 |
| Duración | 13.7 s |

**Observaciones:** ningún test inestable en la corrida. Los tres casos de credenciales inválidas se generan por data-driven desde una sola definición, y cada uno reporta por separado.

---

## Ciclo 2 — Accesibilidad

**Herramienta:** axe-core vía `@axe-core/playwright` · WCAG 2.1 AA

```
  ok A11Y-03 el login es operable solo con teclado
  ok A11Y-01 la pantalla de login no tiene violaciones críticas
  x  A11Y-02 el inventario no tiene violaciones críticas  ← fallo esperado
  3 passed (4.5s)
```

**Hallazgo:** `A11Y-02` detectó una violación `select-name` de impacto `critical`:

```
select-name: Select element must have an accessible name
<select class="product_sort_container" data-test="product-sort-container">
```

**Acción tomada:** se documentó como [BUG-006](bug-reports.md) y se marcó el test con `test.fail()` referenciando el bug. El test ahora pasa porque falla *como se espera*; cuando el defecto se corrija, el marcador se quita y vuelve a verde por la vía normal.

**Criterio aplicado:** un bug conocido de la aplicación no debe romper el pipeline ni desaparecer del reporte. `test.fail()` resuelve las dos cosas.

---

## Ciclo 3 — API

**Herramienta:** Newman 6 · colección Postman contra el mock local

| Métrica | Valor |
|---|---|
| Requests | 7 |
| Aserciones | 20 |
| Fallidas | 0 |
| Duración total | 1079 ms |
| Tiempo de respuesta promedio | 71 ms (min 32, max 111) |

**Nota de alcance:** SauceDemo no expone una API pública, así que la cobertura de API de esta aplicación se hace contra el mock del portfolio. La cobertura de API contra un backend real está en [02-practice-software-testing](../../02-practice-software-testing/).

---

## Ciclo 4 — Performance con k6

**Escenario:** PERF-01 · rampa 10 → 30 VUs sobre el mock local · 65 s

| Métrica | Valor | Umbral | Estado |
|---|---|---|---|
| `checks` | 4614 / 4614 | — | ✅ 100 % |
| `http_req_failed` | 0.00 % | < 1 % | ✅ |
| `http_req_duration` p(95) | 95.08 ms | < 800 ms | ✅ |
| `http_req_duration` p(99) | — | < 1500 ms | ✅ |
| `latencia_login` p(95) | 86.52 ms | < 900 ms | ✅ |
| `errores_negocio` | 0.00 % | < 2 % | ✅ |

Throughput: 35 req/s · 769 iteraciones completas · 0 interrumpidas.

**Observación relevante:** el mock degrada la latencia a partir de ~20 requests **en vuelo simultáneo**, pero este perfil no llegó a activarla. Con 30 VUs y un think time de 1 s, la concurrencia real en vuelo se mantuvo baja (~2-3 requests). La latencia se mantuvo plana en ~73 ms.

**Conclusión:** el perfil valida que el sistema responde bien en condiciones normales, pero **no encontró el punto de quiebre**. Para hallarlo habría que subir los VUs o bajar el think time. Queda anotado como próximo paso, no como resultado alcanzado.

---

## Ciclo 5 — Performance con JMeter

**Escenario:** PERF-03 · 20 usuarios, rampa 10 s, duración 30 s

```
summary +    164 in 00:00:18 =    8.9/s Avg:    74 Min:    37 Max:   146 Err: 0 (0.00%)
summary +    144 in 00:00:12 =   12.4/s Avg:    75 Min:    39 Max:   111 Err: 0 (0.00%)
summary =    308 in 00:00:30 =   10.2/s Avg:    74 Min:    37 Max:   146 Err: 0 (0.00%)
```

| Métrica | Valor |
|---|---|
| Muestras | 308 |
| Errores | 0 (0.00 %) |
| Tiempo promedio | 74 ms |
| Mínimo / Máximo | 37 ms / 146 ms |
| Throughput | 10.2 req/s |

**Contraste con k6:** ambos escenarios dan promedios equivalentes (74 ms en JMeter, 73 ms en k6) sobre el mismo objetivo, lo que valida que están midiendo lo mismo. La diferencia de throughput (10.2 vs 35 req/s) se explica por el think time: JMeter usa 1-2 s aleatorio, k6 usa 1 s fijo.

Reporte HTML en [`05-reports/jmeter/`](../05-reports/jmeter/).

---

## Ciclo 6 — Corrida completa de la matriz de navegadores

Hasta acá los ciclos se habían corrido con `--project=chromium-ui`. Al ejecutar la configuración completa aparecieron los cinco proyectos:

```
  19 failed
  52 passed (36.3s)
```

| Proyecto | Casos | Resultado |
|---|---|---|
| `chromium-ui` | 19 | ✅ |
| `mobile-ui` (Pixel 7) | 19 | ✅ |
| `api` (Restful-Booker) | 11 | ✅ |
| `a11y` | 3 | ✅ |
| `firefox-ui` | 19 | ❌ |

**Los 19 fallos de Firefox son idénticos y duran ~5 ms cada uno:**

```
Error: browserType.launch: spawn UNKNOWN
```

Un fallo del 100 % en milisegundos no es un problema de la aplicación: el navegador ni siquiera arranca.

**Diagnóstico:** se ejecutó el binario a mano.

```
C:\Users\...\ms-playwright\firefox-1532\firefox\firefox.exe --version

ERROR: No se pudo iniciar la aplicación; la configuración en paralelo no es correcta.
```

"Configuración en paralelo incorrecta" (*side-by-side configuration*) es el mensaje de Windows para **falta el runtime de Visual C++**. Reinstalar el navegador con `playwright install firefox --force` no lo resuelve, porque el problema no está en Playwright.

**Solución:** `winget install Microsoft.VCRedist.2015+.x64`

**Decisión:** se deja `firefox-ui` en la matriz. Quitarlo pondría la suite en verde ocultando que se perdió cobertura real de un navegador. El fallo es del entorno local, está documentado, y en CI (Ubuntu) no se produce.

---

## Resumen de defectos

| ID | Título | Severidad | Estado |
|---|---|---|---|
| [BUG-006](bug-reports.md) | Desplegable de ordenamiento sin nombre accesible | Alta | Abierto · verificado |

Los demás defectos listados en [`bug-reports.md`](bug-reports.md) corresponden a comportamientos conocidos de la aplicación demo y **requieren reverificación** antes de considerarse confirmados.
