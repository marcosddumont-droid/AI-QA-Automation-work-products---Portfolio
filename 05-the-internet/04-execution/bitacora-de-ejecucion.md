# Bitácora de ejecución · The Internet

## Ciclo 1 — Primera corrida

```
  3 failed
  15 passed (1.0m)
```

| Caso | Error | Naturaleza |
|---|---|---|
| TC-03 | `expect(received).toHaveLength(3)` | **Mío** — suposición equivocada |
| TC-10 | `TimeoutError: locator.click` tras 20 s | **De la aplicación** |
| TC-60 | `expected 200, received 301` | **Mío** — suposición equivocada |

---

## Diagnóstico de TC-03 y TC-60

Ambos venían de asumir en lugar de verificar. Se instrumentó la página:

```
large-10: 4        ← se habían asumido 3 bloques
rows: 4

status_codes/200 -> 200
status_codes/301 -> 301    ← se había asumido que redirigía a 200
status_codes/404 -> 404
status_codes/500 -> 500
```

**Correcciones:**

- **TC-03:** en vez de cambiar el 3 por un 4, se reescribió como aserción estructural: los bloques deben ser los mismos entre recargas, sin fijar el número. Un número exacto sería frágil ante cualquier cambio de la página.
- **TC-60:** se corrigió la expectativa a `301` y se dejó comentado que fue verificado contra el servidor, para que nadie lo "arregle" de vuelta.

---

## Diagnóstico de TC-10 — el hallazgo

El error inicial no decía nada útil:

```
TimeoutError: locator.click: Timeout 20000ms exceeded.
```

**Un timeout no explica por qué.** La tentación es subirlo. En vez de eso, se leyó el `call log` de Playwright:

```
- waiting for locator('#mce_0_ifr').contentFrame().locator('body#tinymce')
  - locator resolved to <body id="tinymce" contenteditable="false"
      class="mce-content-body mce-content-readonly">
  41 × waiting for element to be visible, enabled and stable
```

El elemento **existía**, pero estaba en modo solo lectura. Playwright nunca lo consideró interactuable.

### ¿Transitorio o permanente?

Se midió el atributo a lo largo del tiempo:

```
t≈0ms     {"contenteditable":"false","clase":"mce-content-body mce-content-readonly","designMode":"off"}
t≈1000ms  {"contenteditable":"false", ...}
t≈3000ms  {"contenteditable":"false", ...}
t≈6000ms  {"contenteditable":"false", ...}
t≈10000ms {"contenteditable":"false", ...}
t≈15000ms {"contenteditable":"false", ...}
```

Permanente. Ninguna espera lo habría resuelto.

### Causa raíz

La consola del navegador:

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
All created TinyMCE editors are configured to be read-only.
```

Dos recursos externos de TinyMCE no resuelven por DNS. Ante la falta de una configuración válida, TinyMCE **degrada el editor a solo lectura** en lugar de fallar de forma visible.

Documentado como [BUG-101](bug-reports.md).

### Cómo se manejó

`test.fail()` referenciando el bug. El test pasa porque **falla como se espera**: la suite refleja el estado real de la aplicación, el pipeline no se rompe y el defecto sigue visible en el reporte. Cuando se corrija, se quita el marcador.

---

## Ciclo 2 — Corrida final

```
  18 passed (42.4s)
```

| Categoría | Casos | Resultado |
|---|---|---|
| Carga diferida y sincronización | 3 | ✅ |
| Frames | 2 | ✅ (uno como fallo esperado documentado) |
| Diálogos nativos | 3 | ✅ |
| Ventanas | 1 | ✅ |
| Autenticación | 3 | ✅ |
| Interacciones complejas | 4 | ✅ |
| Respuestas del servidor | 2 | ✅ |

**Criterio de calidad cumplido:** cero `waitForTimeout` en los 18 casos.

---

## Ciclo 3 — Performance con k6

**Escenario:** PERF-40 · 1 VU, 5 iteraciones sobre 5 rutas, think time 2 s

| Métrica | Valor | Umbral | Estado |
|---|---|---|---|
| `checks` | 25 / 25 | — | ✅ 100 % |
| `codigo_inesperado` | 0.00 % | < 1 % | ✅ |
| `http_req_duration` p(95) | 173.71 ms | < 4000 ms | ✅ |
| `http_req_duration` avg | 171.06 ms | — | — |

**Detalle de diseño:** dos de las cinco rutas devuelven 404 y 500 **a propósito**. Usar `http_req_failed` habría dado un 40 % de error falso. El script declara el estado esperado por ruta con `http.expectedStatuses()` y calcula el error real sobre una métrica propia.

Es un buen ejemplo de que **el umbral por defecto de una herramienta no siempre mide lo que uno quiere medir**.

---

## Resumen de defectos

| ID | Título | Severidad | Estado |
|---|---|---|---|
| [BUG-101](bug-reports.md) | El editor TinyMCE del iframe está en modo solo lectura | Crítica | Abierto · verificado |

**Balance:** 3 fallos iniciales, 2 míos y 1 real. Los dos propios venían de asumir el comportamiento en lugar de verificarlo, y quedaron documentados con la evidencia que los corrigió.
