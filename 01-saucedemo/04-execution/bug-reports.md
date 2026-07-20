# Reportes de Bug

Defectos encontrados durante la exploración de la aplicación bajo prueba. Formato pensado para copiarse directo a Jira.

---

## BUG-001 — El usuario `problem_user` ve imágenes incorrectas en el catálogo

| | |
|---|---|
| **Severidad** | Alta |
| **Prioridad** | Alta |
| **Componente** | Catálogo de productos |
| **Entorno** | Chrome 131 / Windows 10 · https://www.saucedemo.com |
| **Estado** | Abierto |

**Pasos para reproducir**
1. Ingresar a https://www.saucedemo.com
2. Loguearse con `problem_user` / `secret_sauce`
3. Observar la grilla de productos

**Resultado esperado:** cada producto muestra su propia imagen.

**Resultado obtenido:** los 6 productos muestran la misma imagen (un perro), sin relación con el ítem.

**Impacto:** el usuario no puede identificar visualmente lo que compra, lo que degrada la conversión y aumenta la tasa de devoluciones.

**Evidencia:** `test-results/problem-user-images.png`

---

## BUG-002 — El ordenamiento no se aplica para `problem_user`

| | |
|---|---|
| **Severidad** | Media |
| **Prioridad** | Media |
| **Componente** | Catálogo · ordenamiento |
| **Entorno** | Chrome 131 / Windows 10 |
| **Estado** | Abierto |

**Pasos para reproducir**
1. Loguearse con `problem_user` / `secret_sauce`
2. Seleccionar "Price (low to high)" en el desplegable

**Resultado esperado:** los productos se reordenan por precio ascendente.

**Resultado obtenido:** el desplegable cambia su valor pero la grilla mantiene el orden original.

**Impacto:** el usuario no puede filtrar por presupuesto; afecta directamente la experiencia de compra.

---

## BUG-003 — El campo Last Name no se puede completar en el checkout

| | |
|---|---|
| **Severidad** | Crítica |
| **Prioridad** | Crítica |
| **Componente** | Checkout · paso 1 |
| **Entorno** | Chrome 131 / Windows 10 |
| **Estado** | Abierto |

**Pasos para reproducir**
1. Loguearse con `problem_user` / `secret_sauce`
2. Agregar cualquier producto al carrito
3. Ir al carrito → Checkout
4. Intentar escribir en el campo "Last Name"

**Resultado esperado:** el campo acepta el texto ingresado.

**Resultado obtenido:** el campo ignora la entrada y queda vacío, por lo que el checkout nunca se puede completar.

**Impacto:** bloqueante. El usuario no puede finalizar ninguna compra.

---

## BUG-004 — Login degradado supera el umbral aceptable de respuesta

| | |
|---|---|
| **Severidad** | Media |
| **Prioridad** | Alta |
| **Componente** | Autenticación · performance |
| **Entorno** | Chrome 131 / Windows 10 |
| **Estado** | Abierto |

**Pasos para reproducir**
1. Loguearse con `performance_glitch_user` / `secret_sauce`
2. Medir el tiempo hasta que carga `/inventory.html`

**Resultado esperado:** la carga se completa en menos de 3 s.

**Resultado obtenido:** entre 5 y 6 s de forma consistente en 10 ejecuciones.

**Impacto:** por encima del umbral de 3 s, el abandono en login crece de forma significativa.

**Nota técnica:** la degradación es del lado del cliente; el request de red responde rápido, el bloqueo está en el hilo de JavaScript.

---

## BUG-005 — La API acepta reservas con fecha de checkout anterior al checkin

| | |
|---|---|
| **Severidad** | Alta |
| **Prioridad** | Alta |
| **Componente** | API · `POST /booking` |
| **Entorno** | https://restful-booker.herokuapp.com |
| **Estado** | Abierto |

**Pasos para reproducir**
```bash
curl -X POST https://restful-booker.herokuapp.com/booking \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"Fecha","totalprice":100,"depositpaid":true,
       "bookingdates":{"checkin":"2026-12-10","checkout":"2026-12-01"}}'
```

**Resultado esperado:** `400 Bad Request` con un mensaje de validación de fechas.

**Resultado obtenido:** `200 OK`, la reserva se crea con un rango de fechas inválido.

**Impacto:** se persisten datos inconsistentes que rompen los cálculos de ocupación y facturación aguas abajo.

**Sugerencia:** validar `checkout > checkin` en la capa de API, no solo en el frontend.

---

## BUG-006 — El desplegable de ordenamiento no tiene nombre accesible

| | |
|---|---|
| **Severidad** | Alta |
| **Prioridad** | Media |
| **Componente** | Catálogo · accesibilidad |
| **Criterio WCAG** | 4.1.2 Nombre, función, valor (Nivel A) |
| **Estado** | Abierto |
| **Detectado por** | `A11Y-02` — escaneo automático con axe-core |

**Pasos para reproducir**
1. Iniciar sesión con `standard_user`
2. Ejecutar `npm run test:a11y`

**Resultado esperado:** el `<select>` de ordenamiento tiene una etiqueta asociada o un `aria-label`.

**Resultado obtenido:** axe-core reporta `select-name` con impacto `critical`:

```html
<select class="product_sort_container" data-test="product-sort-container">
```

El elemento no tiene `<label>` implícito ni explícito, ni `aria-label`, ni `aria-labelledby`, ni `title`.

**Impacto:** un usuario de lector de pantalla escucha solo "cuadro combinado" sin saber qué controla, por lo que no puede ordenar el catálogo. Es una barrera de accesibilidad y un incumplimiento de WCAG 2.1 nivel A.

**Corrección sugerida:**
```html
<select class="product_sort_container" aria-label="Ordenar productos">
```

**Nota:** el test `A11Y-02` está marcado con `test.fail()` referenciando este bug, de modo que la suite refleja el estado real sin romper el pipeline. Al corregirse el defecto, el marcador se elimina.
