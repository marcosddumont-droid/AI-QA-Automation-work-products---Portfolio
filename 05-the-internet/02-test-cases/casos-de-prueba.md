# Casos de Prueba · The Internet

Todos en `03-automation/playwright/tests/casos-borde.spec.ts`.

## Carga diferida y sincronización

| ID | Título | Página | Pasos | Resultado esperado | Técnica | Prioridad |
|---|---|---|---|---|---|---|
| TC-01 | Elemento oculto que aparece | `/dynamic_loading/1` | 1. Click en Start | `#finish` visible con "Hello World!" | Aserción con reintento | Crítica |
| TC-02 | Elemento que se crea al final | `/dynamic_loading/2` | 1. Click en Start | `#finish` con "Hello World!" | `toHaveText` espera la creación del nodo | Alta |
| TC-03 | Contenido aleatorio | `/dynamic_content` | 1. Leer bloques<br>2. Recargar<br>3. Releer | Misma cantidad de bloques, sin fijar el texto | Aserción estructural | Media |

> **TC-01 y TC-02 parecen iguales pero no lo son:** en el primero el elemento existe oculto; en el segundo no existe en el DOM hasta que termina la carga. Son dos casos de espera distintos.

## Frames

| ID | Título | Página | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-10 | Escribir dentro de un iframe | `/iframe` | El texto queda en el editor · **`test.fail()` por [BUG-101](../04-execution/bug-reports.md)** | Crítica |
| TC-11 | Frames anidados | `/nested_frames` | Se lee LEFT, MIDDLE y BOTTOM en sus frames | Alta |

## Diálogos nativos del navegador

| ID | Título | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-20 | Aceptar un alert | 1. Registrar handler<br>2. Click en JS Alert | "You successfully clicked an alert" | Crítica |
| TC-21 | Cancelar un confirm | 1. Handler con dismiss<br>2. Click en JS Confirm | "You clicked: Cancel" | Alta |
| TC-22 | Completar un prompt | 1. Handler con accept + texto<br>2. Click en JS Prompt | "You entered: texto de prueba" | Alta |

> **El handler se registra ANTES de disparar el diálogo.** Al revés, la ejecución queda bloqueada esperando una respuesta que nunca llega.

## Ventanas y navegación

| ID | Título | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-30 | Pestaña nueva | 1. Esperar evento `page` en paralelo al click | La pestaña nueva muestra "New Window" y la original sigue accesible | Crítica |

## Autenticación

| ID | Título | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-40 | Autenticación básica | 1. Contexto con `httpCredentials`<br>2. Ir a `/basic_auth` | Mensaje de felicitación | Crítica |
| TC-41 | Login válido | 1. `tomsmith` / `SuperSecretPassword!` | "You logged into a secure area", URL `/secure` | Crítica |
| TC-42 | Contraseña incorrecta | 1. Clave inválida | "Your password is invalid", no entra a `/secure` | Alta |

## Interacciones complejas

| ID | Título | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-50 | Subir un archivo | 1. `setInputFiles` con el fixture<br>2. Enviar | "File Uploaded!" y el nombre del archivo listado | Crítica |
| TC-51 | Menú contextual | 1. Click derecho en el hotspot | Alert "You selected a context menu" | Media |
| TC-52 | Tabla ordenable | 1. Click en la cabecera Last Name | Apellidos en orden alfabético | Media |
| TC-53 | Hover revela contenido | 1. Hover sobre la primera figura | Se muestra el caption con "name: user1" | Media |

## Respuestas del servidor

| ID | Título | Escenario | Resultado esperado | Prioridad |
|---|---|---|---|---|
| TC-60 | Códigos de estado | `/status_codes/{200,301,404,500}` | Cada ruta devuelve **su propio código**. El 301 **no** se sigue automáticamente | Media |
| TC-61 | Enlaces de descarga | `/download` | Hay al menos un enlace disponible | Baja |

## Performance

| ID | Herramienta | Escenario | Umbral | Prioridad |
|---|---|---|---|---|
| PERF-40 | k6 | 1 VU, 5 iteraciones sobre 5 rutas | `p(95) < 4000 ms`, código inesperado < 1 % | Baja |

> **PERF-40 tiene una particularidad:** incluye rutas que devuelven 404 y 500 **a propósito**. Un chequeo ingenuo de "todo debe ser 2xx" daría un falso positivo, así que el script usa `http.expectedStatuses()` por ruta y calcula el error sobre una métrica propia (`codigo_inesperado`) en lugar de `http_req_failed`.

## Casos evaluados y descartados

| Caso | Motivo |
|---|---|
| Drag & drop | La página usa eventos HTML5 que Playwright no simula de forma confiable. Un test inestable es peor que ninguno |
| Shadow DOM | Playwright lo atraviesa de forma transparente: no hay técnica que demostrar |
| Scroll infinito | No aporta una técnica distinta a la carga diferida ya cubierta |
