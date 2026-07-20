# Casos de Prueba · Practice Software Testing

Cada ID aparece en el nombre del test automatizado: un fallo en el reporte se rastrea hasta la fila de esta tabla.

## API · Catálogo — `tests/api/catalogo.spec.ts`

| ID | Endpoint | Escenario | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| API-01 | `GET /products` | Listado de productos | `200` + estructura paginada con `current_page`, `total` y `data` no vacío | Crítica | Smoke |
| API-02 | `GET /products` | Contrato de cada producto | Todo producto tiene `id`, `name` y `price` numérico positivo | Crítica | Smoke |
| API-03 | `GET /products?page=N` | Paginación | Las páginas 1 y 2 no comparten ningún producto | Alta | Regresión |
| API-04 | `GET /products?between=price,1,20` | Filtro por rango | Todos los precios devueltos están entre 1 y 20 | Alta | Regresión |
| API-05 | `GET /products/search?q=pliers` | Búsqueda por nombre | Todos los resultados contienen el término buscado | Alta | Regresión |
| API-06 | `GET /products/{id-inválido}` | Producto inexistente | `404` | Media | Regresión |

## API · Marcas y categorías

| ID | Endpoint | Escenario | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| API-07 | `GET /brands` | Listado de marcas | `200` + todas con `id` y `name` | Alta | Smoke |
| API-08 | `GET /categories` | Listado de categorías | `200` + lista no vacía | Media | Regresión |
| API-09 | `GET /brands/{id-inválido}` | Marca inexistente | `404` | Media | Regresión |

## API · Autenticación

| ID | Endpoint | Escenario | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| API-10 | `POST /users/login` | Credenciales inválidas | `401` o `422`, sin `access_token` | Alta | Regresión |
| API-11 | `POST /users/login` | Cuerpo vacío | `401` o `422` | Media | Regresión |
| API-12 | `GET /users/me` | Sin token | `401` o `403` | Crítica | Smoke |

## UI · Catálogo — `tests/ui/catalogo.spec.ts`

| ID | Escenario | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| TC-01 | Listado inicial | 1. Abrir la home | Productos visibles, todos con nombre y precio > 0 | Crítica | Smoke |
| TC-02 | Búsqueda | 1. Buscar "pliers"<br>2. Enviar | Todos los resultados contienen "pliers" | Crítica | Smoke |
| TC-03 | Búsqueda sin resultados | 1. Buscar un término inexistente | La página no se rompe y no hay productos listados | Media | Regresión |
| TC-04 | Limpiar búsqueda | 1. Buscar<br>2. Reset | Se restaura el total original de productos | Media | Regresión |
| TC-05 | Orden precio ascendente | 1. Ordenar por "Price (low to high)" | Precios de menor a mayor | Media | Regresión |
| TC-06 | Orden precio descendente | 1. Ordenar por "Price (high to low)" | Precios de mayor a menor | Media | Regresión |
| TC-07 | Orden nombre A-Z | 1. Ordenar por "Name (A to Z)" | Nombres alfabéticos ascendentes | Baja | Regresión |

## UI · Detalle de producto

| ID | Escenario | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|
| TC-10 | Datos del producto | Nombre, precio unitario y descripción visibles; precio > 0 | Crítica | Smoke |
| TC-11 | Selector de cantidad | El valor pasa de 1 a 2 al incrementar | Media | Regresión |

## UI · Carrito

| ID | Escenario | Pasos | Resultado esperado | Prioridad | Tipo |
|---|---|---|---|---|---|
| TC-20 | Agregar al carrito | 1. Abrir producto<br>2. Agregar<br>3. Ir al carrito | El producto agregado figura en el carrito | Crítica | Smoke |
| TC-21 | Precio de línea | 1. Fijar cantidad 3<br>2. Agregar<br>3. Ver carrito | `precio de línea = precio unitario × 3` | Crítica | Regresión |
| TC-22 | Total del carrito | 1. Agregar producto<br>2. Ver carrito | El total es la suma exacta de las líneas | Crítica | Regresión |
| TC-23 | Checkout como invitado | 1. Con producto en el carrito<br>2. Continuar | Se exige login o datos de invitado | Alta | Regresión |

## Performance

| ID | Herramienta | Escenario | Umbral | Prioridad |
|---|---|---|---|---|
| PERF-10 | k6 | 2 VUs, 10 iteraciones, think time 2 s | `p(95) < 4000 ms`, errores < 5 % | Media |
| PERF-11 | JMeter | 2 hilos, 5 iteraciones, think time 2-3 s | Cada request < 4000 ms, 0 errores | Media |

## Postman · Cobertura declarativa

| ID | Request | Aserciones |
|---|---|---|
| API-01 | Listar productos | Estado, paginación, contrato de cada producto |
| API-02 | Detalle de producto | Id encadenado, marca y categoría presentes |
| API-03 | Filtrar por precio | Todos dentro del rango |
| API-04 | Buscar por nombre | Coincidencias válidas |
| API-05 | Listar marcas | Contrato de cada marca |
| API-06 | Producto inexistente | `404` |
| API-07 | Endpoint protegido | `401`/`403`, sin filtrar datos |
| API-08 | Login inválido | Sin token emitido |
