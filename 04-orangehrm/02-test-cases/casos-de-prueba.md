# Casos de Prueba · OrangeHRM

## Autenticación — `cypress/e2e/autenticacion.cy.js`

| ID | Título | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| TC-01 | Login válido | 1. `Admin` / `admin123`<br>2. Login | Redirige a `/dashboard/index`, breadcrumb "Dashboard", menú de usuario visible | Crítica | Smoke |
| TC-02 | Contraseña incorrecta | 1. Usuario válido, clave inválida | Alerta "Invalid credentials", permanece en `/auth/login` | Alta | Regresión |
| TC-03 | Usuario inexistente | 1. Usuario que no existe | Alerta "Invalid credentials" | Alta | Regresión |
| TC-04 | Formulario vacío | 1. Enviar sin completar nada | **2** mensajes "Required", uno por campo | Media | Regresión |
| TC-05 | Solo usuario | 1. Completar usuario<br>2. Enviar | **1** mensaje de campo obligatorio | Media | Regresión |
| TC-06 | Contraseña enmascarada | 1. Inspeccionar el campo | `type="password"` | Media | Regresión |
| TC-07 | Ruta protegida sin sesión | 1. Limpiar cookies<br>2. Ir a `/pim/viewEmployeeList` | Redirige a `/auth/login` | Crítica | Smoke |
| TC-08 | Logout invalida el acceso | 1. Iniciar sesión<br>2. Logout<br>3. Reintentar entrar al dashboard | Redirige a login en ambos pasos | Alta | Regresión |

> **TC-04 y TC-05 verifican el mismo mecanismo con distinta granularidad:** que la validación sea *por campo* y no un mensaje global. Por eso uno espera 2 mensajes y el otro exactamente 1.

> **TC-08 destapó [BUG-301](../04-execution/bug-reports.md):** una promesa rechazada sin manejar durante el logout.

## PIM · Listado de empleados — `cypress/e2e/pim.cy.js`

| ID | Título | Precondición | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|---|
| TC-20 | Listado y contador | Sesión iniciada | 1. Abrir PIM | Filas visibles y contador con formato `(N) Records Found` | Crítica | Smoke |
| TC-21 | Columnas de la tabla | Sesión iniciada | 1. Abrir PIM | Presentes: Id, First (& Middle) Name, Last Name, Job Title, Sub Unit | Media | Regresión |
| TC-22 | Búsqueda sin resultados | Sesión iniciada | 1. Buscar Employee Id `99999999` | Mensaje "No Records Found" | Alta | Regresión |
| TC-23 | El filtro reduce resultados | Sesión iniciada | 1. Contar filas<br>2. Filtrar por Id `0001` | Menos filas que al inicio, o "No Records Found" | Alta | Regresión |
| TC-24 | Reset restaura el listado | Sesión iniciada | 1. Filtrar sin resultados<br>2. Reset | Vuelve a la cantidad original de filas | Media | Regresión |
| TC-25 | Paginación | Sesión iniciada | 1. Ir a la página 2 | Se listan filas en la página siguiente | Baja | Regresión |

> **TC-23 acepta dos resultados válidos** (menos filas, o ninguna) porque el conjunto de datos del demo cambia. Fijar un número exacto haría el test inestable sin ganar nada.

> **TC-25 se auto-omite** si el listado no está paginado en el entorno. Un test que falla porque el escenario no aplica es ruido, no información.

## Navegación entre módulos — data-driven

| ID | Módulo | URL esperada | Prioridad | Tipo |
|---|---|---|---|---|
| TC-30 | Admin | `/admin/viewSystemUsers` | Media | Regresión |
| TC-30 | PIM | `/pim/viewEmployeeList` | Media | Regresión |
| TC-30 | Leave | `/leave/viewLeaveList` | Media | Regresión |
| TC-30 | Time | `/time/viewEmployeeTimesheet` | Media | Regresión |

Los cuatro se generan desde una sola definición y reportan por separado.

## Performance

| ID | Herramienta | Escenario | Umbral | Prioridad |
|---|---|---|---|---|
| PERF-30 | k6 | 1 VU, 5 iteraciones sobre la página de login | `p(95) < 6000 ms`, errores < 5 % | Baja |

> **Nota:** k6 verifica el contenedor de la SPA y la referencia al bundle, **no el formulario**. OrangeHRM renderiza el login del lado del cliente: el HTML del servidor no contiene `name="username"` ni el token CSRF. Validar el formulario requiere un navegador real, y de eso se encarga la suite Cypress.
