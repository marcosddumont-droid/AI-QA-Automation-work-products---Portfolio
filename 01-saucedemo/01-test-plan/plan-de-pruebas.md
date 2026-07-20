# Plan de Pruebas — SauceDemo + Restful-Booker

## 1. Objetivo

Validar los flujos críticos de negocio de una tienda e-commerce (autenticación, catálogo y compra) y de una API REST de reservas, con una suite automatizada que corra en cada PR y sirva como red de seguridad ante regresiones.

## 2. Alcance

### Dentro del alcance

| Área | Cobertura |
|---|---|
| Autenticación UI | Login válido, usuario bloqueado, credenciales inválidas, logout, enmascarado de password |
| Catálogo | Listado, ordenamientos (4 criterios), agregar/quitar del carrito, persistencia |
| Checkout | Flujo E2E, cálculo de impuestos, validaciones de formulario |
| API Reservas | CRUD completo, autenticación por token, casos negativos (404, 403, payload inválido) |
| Accesibilidad | Escaneo WCAG 2.1 AA con axe-core, navegación por teclado |
| Compatibilidad | Chromium, Firefox y viewport mobile (Pixel 7) |

### Fuera del alcance

- Pruebas de carga y estrés (requieren herramienta dedicada tipo k6).
- Seguridad ofensiva / pentesting.
- Compatibilidad con Safari e Internet Explorer.
- Pruebas de la capa de base de datos (sin acceso al backend).

## 3. Estrategia

Pirámide de testing adaptada al contexto: la aplicación bajo prueba es de terceros y no hay acceso al código, por lo que la suite se concentra en **API (rápida y estable)** y **E2E de los caminos críticos**, evitando duplicar en UI lo que ya se valida a nivel API.

**Criterio de selección de casos:** riesgo × frecuencia de uso. El flujo de compra concentra el mayor impacto de negocio, por eso tiene la cobertura más profunda.

### Etiquetado

- `@smoke` — 6 casos, ~1 min. Corre en cada push. Si falla, el build se detiene.
- `@regression` — suite completa, ~4 min. Corre en cada PR y en la ejecución nocturna.
- `@a11y` — escaneos de accesibilidad, reportados aparte.

## 4. Entornos y datos

| Entorno | URL | Uso |
|---|---|---|
| UI | https://www.saucedemo.com | Configurable vía `UI_BASE_URL` |
| API | https://restful-booker.herokuapp.com | Configurable vía `API_BASE_URL` |

Los datos de reserva se generan con un builder (`buildBooking`) que produce valores únicos por ejecución, de modo que los tests corran en paralelo contra una API compartida sin interferir entre sí.

## 5. Criterios de entrada y salida

**Entrada:** entorno accesible, build desplegado, datos de prueba disponibles.

**Salida:**
- 100 % de los casos `@smoke` en verde.
- ≥ 95 % de la regresión en verde, sin fallos de severidad Alta o Crítica abiertos.
- Sin violaciones de accesibilidad de impacto `critical` o `serious`.

## 6. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La API pública puede estar caída o lenta | Alto | Health check previo (`API-01`), 2 reintentos en CI, timeouts explícitos |
| Datos compartidos entre ejecuciones concurrentes | Medio | Builder con datos únicos por test |
| Tests inestables (flaky) por timing | Medio | Auto-waiting de Playwright, sin `sleep` fijos, trazas en el primer reintento |
| Cambios de selectores en la app | Medio | Page Objects: el cambio se corrige en un solo archivo |

## 7. Entregables

- Suite automatizada versionada en el repositorio.
- Reporte HTML de Playwright (con trazas, video y screenshot de los fallos).
- Reporte JUnit XML para integración con herramientas de CI.
- Casos de prueba documentados en [`casos-de-prueba.md`](./casos-de-prueba.md).
- Reportes de bug en [`bug-reports.md`](./bug-reports.md).
