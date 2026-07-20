# Bitácora de ejecución · Practice Software Testing

## Ciclo 1 — API con Playwright

```
Running 12 tests using 4 workers
  12 passed (4.4s)
```

| Métrica | Valor |
|---|---|
| Casos | 12 |
| Aprobados | 12 |
| Duración | 4.4 s |

**Observación:** los tests de API toleran perfectamente 4 workers. El problema de concurrencia apareció solo en UI, donde cada worker levanta un navegador y multiplica las peticiones por página.

---

## Ciclo 2 — UI con Playwright · primera corrida (fallida)

```
  3 failed
  10 passed (1.1m)
```

Tres fallos, **todos causados por los tests, no por la aplicación**:

| Caso | Síntoma | Causa real |
|---|---|---|
| TC-04 | `expected 9, received otro` | Se leía el conteo con `.count()` inmediatamente después del reset; la grilla se re-renderiza en el cliente |
| TC-20 | El carrito no contenía el producto | Se leían los títulos antes de que las filas se renderizaran |
| TC-22 | La suma de líneas daba 0 | Ídem: lista vacía al momento de leer |

**Diagnóstico:** se midió el tiempo real de render del carrito instrumentando la página. Las filas aparecen a los **~3 segundos**:

```
t=0ms     titulos=[]  lineas=[]
t=1500ms  titulos=[]  lineas=[]
t=3000ms  titulos=["Combination Pliers "]  lineas=["$14.15"]
```

**Corrección aplicada:** método `esperarCargado()` en el Page Object del checkout y `expect.poll` / `toHaveCount` en lugar de lecturas puntuales. **No se subieron timeouts a ciegas.**

---

## Ciclo 3 — UI · segunda corrida (nuevos fallos)

```
  5 failed
  8 passed (1.5m)
```

Los tres anteriores pasaron, pero aparecieron **cinco fallos nuevos** con `TimeoutError` al cargar la home — en tests que antes estaban en verde.

**Diagnóstico:** la causa era la propia suite. Cuatro workers en paralelo, cada uno con un navegador, contra un demo público compartido: el servidor empezó a limitar las peticiones.

**Corrección aplicada:** `workers: 2` en la configuración, con el motivo documentado en el archivo.

---

## Ciclo 4 — UI · corrida final

```
  13 passed (47.9s)
```

| Métrica | Con 4 workers | Con 2 workers |
|---|---|---|
| Resultado | 8 de 13 | **13 de 13** |
| Duración | 1 min 30 s | **47.9 s** |

**Conclusión que vale la pena registrar:** bajar la concurrencia a la mitad hizo la suite **casi el doble de rápida**. Cuando el cuello de botella es un servidor compartido, sumar paralelismo resta.

---

## Ciclo 5 — API con Newman

| Métrica | Valor |
|---|---|
| Requests | 8 |
| Aserciones | 18 |
| Fallidas | 0 |
| Duración | 6.8 s |
| Tiempo de respuesta promedio | 767 ms (min 726, max 800) |

La colección encadena variables: `API-01` guarda el id del primer producto y `API-02` lo consume. Es cobertura declarativa que cualquiera del equipo puede correr sin escribir código.

---

## Ciclo 6 — Performance con k6

**Escenario:** PERF-10 · 2 VUs, 10 iteraciones, think time 2 s

| Métrica | Valor | Umbral | Estado |
|---|---|---|---|
| `checks` | 40 / 40 | — | ✅ 100 % |
| `http_req_failed` | 0.00 % | < 5 % | ✅ |
| `http_req_duration` p(95) | 503.88 ms | < 4000 ms | ✅ |
| `http_req_duration` avg | 334.82 ms | — | — |
| `http_req_duration` min / max | 246.9 ms / 515.45 ms | — | — |

---

## Ciclo 7 — Performance con JMeter

**Escenario:** PERF-11 · 2 hilos, 5 iteraciones, think time 2-3 s

```
summary =     30 in 00:00:52 =    0.6/s Avg:   824 Min:   701 Max:  2012 Err: 0 (0.00%)
```

| Métrica | Valor |
|---|---|
| Muestras | 30 |
| Errores | 0 (0.00 %) |
| Promedio | 824 ms |
| Mínimo / Máximo | 701 ms / 2012 ms |

**Contraste con k6:** JMeter promedia 824 ms y k6 335 ms sobre los mismos endpoints. La diferencia no es del sitio: k6 mide solo el tiempo de la petición HTTP, mientras que el promedio de JMeter incluye el primer request de cada hilo, que paga el costo del handshake TLS (max 2012 ms contra 701 ms de los siguientes). Es un buen recordatorio de que **comparar herramientas sin entender qué mide cada una lleva a conclusiones falsas**.

---

## Resumen

| Suite | Resultado final |
|---|---|
| API (Playwright) | 12/12 ✅ |
| UI (Playwright) | 13/13 ✅ |
| API (Newman) | 18/18 aserciones ✅ |
| k6 | 40/40 checks ✅ |
| JMeter | 30 muestras, 0 errores ✅ |

**Defectos de la aplicación encontrados:** ninguno. Los 8 fallos de las primeras corridas fueron todos de los tests, y quedaron documentados arriba en lugar de borrarse del historial.
