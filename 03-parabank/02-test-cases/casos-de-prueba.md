# Casos de Prueba · ParaBank

## UI · Autenticación — `tests/ui/autenticacion.spec.ts`

| ID | Título | Precondición | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|---|
| TC-01 | Registro de cliente nuevo | Usuario irrepetible | 1. Abrir registro<br>2. Completar los 11 campos<br>3. Registrar | `Welcome <usuario>` + "Your account was created successfully". Sesión iniciada: el resumen es accesible sin volver a loguearse | Crítica | Smoke |
| TC-02 | Usuario ya existente | `john` existe | 1. Registrar con usuario `john` | Error "This username already exists" | Alta | Regresión |
| TC-03 | Campos obligatorios | — | 1. Enviar el registro vacío | **10 mensajes** de validación, uno por campo | Alta | Regresión |
| TC-04 | Login válido | `john/demo` | 1. Ingresar credenciales<br>2. Log In | Resumen de cuentas visible con la tabla cargada | Crítica | Smoke |
| TC-05 | Contraseña incorrecta | — | 1. Usuario válido, clave inválida | "could not be verified", sin redirección | Alta | Regresión |
| TC-06 | Campos vacíos | — | 1. Enviar el login vacío | Mensaje de error visible | Media | Regresión |
| TC-07 | Cierre de sesión | Sesión iniciada | 1. Log Out | Vuelve a `index.htm` con el formulario de login | Alta | Regresión |
| TC-08 | Contraseña enmascarada | — | 1. Inspeccionar el campo | `type="password"` | Media | Regresión |

## UI · Cuentas y transferencias — `tests/ui/transferencias.spec.ts`

| ID | Título | Precondición | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|---|
| TC-20 | Cuenta inicial del cliente | Cliente recién registrado | 1. Abrir el resumen | Al menos una cuenta, con saldo > 0 | Crítica | Smoke |
| TC-21 | Apertura de segunda cuenta | Cliente registrado | 1. Open New Account<br>2. Tipo SAVINGS<br>3. Confirmar | Se devuelve un id numérico y el resumen pasa a tener una cuenta más | Alta | Regresión |
| TC-22 | **Transferencia con verificación de saldos** | Cliente con 2 cuentas | 1. Leer saldos de origen y destino<br>2. Transferir $25<br>3. Releer saldos | Panel de resultado con "Transfer Complete!", monto y ambas cuentas confirmadas.<br>**`origen = origen_antes − 25`**<br>**`destino = destino_antes + 25`** | **Crítica** | Smoke |
| TC-23 | Transferencia sin monto | Cliente registrado | 1. Enviar sin completar el monto | El panel de resultado permanece oculto | Alta | Regresión |
| TC-24 | Detalle de cuenta | Cliente registrado | 1. Abrir una cuenta del resumen | Se muestran id, tipo y saldo de esa cuenta | Alta | Regresión |

> **Nota sobre TC-22:** es el caso de mayor prioridad del portfolio. Un fallo acá bloquea la entrega sin excepción, porque implica una discrepancia de saldo.

## API · Servicios REST — `tests/api/servicios.spec.ts`

| ID | Endpoint | Escenario | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| API-01 | `GET /accounts/13344` | Detalle de cuenta | `200` + id, `customerId`, `balance` numérico y `type` | Crítica | Smoke |
| API-02 | `GET /accounts/13344/transactions` | Transacciones | `200` + lista | Alta | Regresión |
| API-03 | `GET /accounts/13344/transactions` | Contrato | Cada transacción con `id`, `accountId`, `amount` numérico y `type` | Alta | Regresión |
| API-04 | `GET /accounts/99999999` | Cuenta inexistente | `400` — comportamiento real, ver [BUG-201](../04-execution/bug-reports.md) | Media | Regresión |
| API-05 | `GET /accounts/13344/transactions/amount/100` | Búsqueda por monto | `200` o `204` | Media | Regresión |
| API-06 | `GET /customers/12212` | Detalle de cliente | `200` + nombre y apellido | Media | Regresión |

## Postman · Cobertura declarativa

| ID | Request | Aserciones |
|---|---|---|
| API-01 | Detalle de cuenta | Estado, id, saldo numérico, tipo dentro del conjunto válido |
| API-02 | Transacciones | Lista, contrato de cada elemento, tipo `Credit`/`Debit` |
| API-03 | Detalle de cliente | Id encadenado desde API-01, nombre y dirección |
| API-04 | Cuentas del cliente | Todas pertenecen al cliente consultado |
| API-05 | Cuenta inexistente | `400` y sin exponer saldo |

## Performance

| ID | Herramienta | Escenario | Umbral | Prioridad |
|---|---|---|---|---|
| PERF-20 | k6 | 1 VU, 8 iteraciones, **solo lecturas** | `p(95) < 3000 ms`, errores < 5 % | Media |
