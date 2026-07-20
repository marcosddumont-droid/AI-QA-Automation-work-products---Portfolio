# Pruebas de performance · k6

## Scripts

| ID | Script | Objetivo | Perfil |
|---|---|---|---|
| PERF-01 | [`carga-mock.js`](carga-mock.js) | Mock local | Rampa 10 → 30 VUs, 65 s |
| PERF-02 | [`smoke-saucedemo.js`](smoke-saucedemo.js) | SauceDemo real | 1 VU, 5 iteraciones |

## Por qué dos objetivos distintos

**PERF-01 apunta al mock local** porque generar carga contra SauceDemo sería abusar de infraestructura ajena. El mock simula degradación bajo concurrencia, así que la prueba mide algo real.

**PERF-02 apunta al sitio real** pero con 1 usuario virtual y think time de 2 s: equivale a una persona navegando. Sirve para detectar que el sitio está arriba y responde en tiempos razonables, no para medir un SLA.

## Umbrales

Los `thresholds` son **criterios de aceptación**, no decoración: si no se cumplen, k6 termina con código distinto de cero y el pipeline falla.

| Métrica | Umbral | Por qué |
|---|---|---|
| `http_req_failed` | < 1 % | Tolerancia mínima a errores de transporte |
| `http_req_duration p(95)` | < 800 ms (mock) | Percentil 95, no promedio: el promedio esconde la cola |
| `http_req_duration p(99)` | < 1500 ms | Controla los peores casos |
| `latencia_login` p(95) | < 900 ms | Login es el cuello de botella típico |
| `errores_negocio` | < 2 % | Respuestas 200 pero con contenido incorrecto |

Se usan **percentiles y no promedios** porque el promedio esconde la cola: 95 requests en 100 ms y 5 en 10 s dan un promedio aceptable y una experiencia pésima.

## Ejecución

```bash
# PERF-01 — primero levantar el mock
node ../../../../tools/mock-api/server.js     # en otra terminal
k6 run carga-mock.js

# PERF-02 — contra el sitio real
k6 run smoke-saucedemo.js

# Exportar resultados
k6 run --summary-export=../../05-reports/k6-resumen.json carga-mock.js
```

## Instalación de k6

```bash
winget install Grafana.k6      # Windows
brew install k6                # macOS
```
