# Casos de Prueba

Cada caso está automatizado y su ID aparece en el nombre del test, de modo que un fallo en el reporte se rastrea directo a esta tabla.

## Autenticación — `tests/ui/login.spec.ts`

| ID | Título | Precondición | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|---|
| TC-01 | Login exitoso | Usuario `standard_user` válido | 1. Abrir la home<br>2. Ingresar usuario y contraseña<br>3. Click en Login | Redirige a `/inventory.html`, título "Products", 6 productos visibles | Crítica | Smoke |
| TC-02 | Usuario bloqueado | Usuario `locked_out_user` | 1. Ingresar credenciales del usuario bloqueado<br>2. Click en Login | Mensaje "Sorry, this user has been locked out", no redirige | Alta | Regresión |
| TC-03a | Usuario vacío | — | 1. Dejar usuario vacío<br>2. Completar contraseña<br>3. Login | Error "Username is required" | Media | Regresión |
| TC-03b | Contraseña vacía | — | 1. Completar usuario<br>2. Dejar contraseña vacía<br>3. Login | Error "Password is required" | Media | Regresión |
| TC-03c | Credenciales inexistentes | — | 1. Ingresar usuario y contraseña inválidos<br>2. Login | Error "Username and password do not match any user in this service" | Alta | Regresión |
| TC-04 | Logout | Sesión iniciada | 1. Abrir el menú lateral<br>2. Click en Logout | Vuelve a la pantalla de login | Alta | Regresión |
| TC-05 | Password enmascarado | — | 1. Inspeccionar el campo contraseña | El input tiene `type="password"` | Media | Regresión |

## Catálogo — `tests/ui/inventory.spec.ts`

| ID | Título | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| TC-10 | Listado de productos | 1. Iniciar sesión | 6 productos, todos con precio > 0 | Crítica | Smoke |
| TC-11 | Orden precio ascendente | 1. Seleccionar "Price (low to high)" | Precios ordenados de menor a mayor | Media | Regresión |
| TC-12 | Orden precio descendente | 1. Seleccionar "Price (high to low)" | Precios ordenados de mayor a menor | Media | Regresión |
| TC-13 | Orden nombre Z-A | 1. Seleccionar "Name (Z to A)" | Nombres en orden alfabético inverso | Baja | Regresión |
| TC-14 | Agregar y quitar producto | 1. Agregar al carrito<br>2. Quitar del carrito | El badge pasa de 0 → 1 → sin badge | Crítica | Smoke |
| TC-15 | Persistencia del carrito | 1. Agregar 2 productos<br>2. Navegar al carrito | Ambos productos siguen en el carrito | Alta | Regresión |

## Checkout — `tests/ui/checkout.spec.ts`

| ID | Título | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| TC-20 | Compra end-to-end | 1. Agregar 2 productos<br>2. Ir al carrito<br>3. Checkout<br>4. Completar datos<br>5. Continuar y finalizar | "Thank you for your order!" y carrito vacío | Crítica | Smoke |
| TC-21 | Cálculo de impuestos | 1. Llegar al resumen de compra | `tax = subtotal × 0.08` y `total = subtotal + tax` | Crítica | Regresión |
| TC-22a | Falta el nombre | 1. Dejar First Name vacío<br>2. Continuar | "Error: First Name is required" | Alta | Regresión |
| TC-22b | Falta el apellido | 1. Dejar Last Name vacío<br>2. Continuar | "Error: Last Name is required" | Alta | Regresión |
| TC-22c | Falta el código postal | 1. Dejar Postal Code vacío<br>2. Continuar | "Error: Postal Code is required" | Alta | Regresión |
| TC-23 | Quitar ítem del carrito | 1. Agregar 2 productos<br>2. Quitar uno | Queda 1 ítem y el subtotal baja | Alta | Regresión |

## API de Reservas — `tests/api/booking-crud.spec.ts`

| ID | Método | Endpoint | Escenario | Esperado | Prioridad |
|---|---|---|---|---|---|
| API-01 | GET | `/ping` | Health check | `201` | Crítica |
| API-02 | POST | `/auth` | Credenciales válidas | `200` + token alfanumérico | Crítica |
| API-03 | POST | `/booking` | Crear reserva | `200` + `bookingid` y datos coincidentes | Crítica |
| API-04 | GET | `/booking/{id}` | Recuperar reserva | `200` + datos correctos | Alta |
| API-05 | PUT | `/booking/{id}` | Actualización completa | `200` + todos los campos actualizados | Alta |
| API-06 | PATCH | `/booking/{id}` | Actualización parcial | `200`, solo cambia el campo enviado | Alta |
| API-07 | DELETE | `/booking/{id}` | Eliminar reserva | `201` y luego `404` al consultarla | Alta |
| API-08 | GET | `/booking/99999999` | Reserva inexistente | `404` | Media |
| API-09 | POST | `/auth` | Credenciales incorrectas | Sin token, `reason: "Bad credentials"` | Alta |
| API-10 | PUT | `/booking/{id}` | Sin token de autenticación | `403` | Crítica |
| API-11 | POST | `/booking` | Payload incompleto | Distinto de `200` | Media |

## Accesibilidad — `tests/a11y/accessibility.spec.ts`

| ID | Escenario | Criterio | Prioridad |
|---|---|---|---|
| A11Y-01 | Escaneo axe-core del login | Sin violaciones WCAG 2.1 AA de impacto `serious` o `critical` | Alta |
| A11Y-02 | Escaneo axe-core del inventario | Ídem | Alta |
| A11Y-03 | Login solo con teclado | El flujo completo se opera con Tab + Enter | Alta |
