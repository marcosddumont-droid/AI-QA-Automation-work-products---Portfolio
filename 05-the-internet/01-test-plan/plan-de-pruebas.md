# Plan de Pruebas · The Internet

## 1. Objetivo

Demostrar el manejo correcto de los **mecanismos de navegador que más tests inestables generan**: sincronización, frames, diálogos nativos, ventanas, autenticación y carga de archivos.

A diferencia del resto del portfolio, acá el objeto de prueba no es un flujo de negocio sino **la técnica de automatización en sí**.

## 2. Alcance

### Dentro del alcance

| Mecanismo | Casos | Por qué importa |
|---|---|---|
| Sincronización y carga diferida | 3 | Es la causa número uno de tests inestables |
| Frames simples y anidados | 2 | Requieren cambiar de contexto de ejecución |
| Diálogos nativos (alert/confirm/prompt) | 3 | Bloquean la ejecución si el handler se registra tarde |
| Ventanas y pestañas nuevas | 1 | Exige capturar un evento, no buscar un elemento |
| Autenticación básica y por formulario | 3 | Credenciales a nivel de contexto vs. de página |
| Subida de archivos | 1 | Interacción con el sistema de archivos |
| Menú contextual, tablas, hover | 3 | Interacciones que no son un click simple |
| Códigos de estado HTTP | 2 | Verificar la respuesta, no solo el render |

### Fuera del alcance, con motivo

| Qué | Por qué |
|---|---|
| Drag & drop (`/drag_and_drop`) | La página usa HTML5 drag events, que Playwright no simula de forma confiable con `dragTo`. Un test inestable sería peor que no tenerlo. **Se documenta la limitación en vez de fingir cobertura** |
| Shadow DOM | Playwright lo atraviesa de forma transparente: no hay técnica que demostrar |
| Descarga de archivos con verificación de contenido | Ensucia el sistema de archivos sin agregar criterio nuevo. Se verifica que los enlaces existan |
| Scroll infinito | El caso es visualmente vistoso pero no aporta una técnica distinta a la carga diferida ya cubierta |

## 3. Estrategia

### Regla central: cero esperas fijas

**No hay un solo `waitForTimeout` en los 18 casos.** Cada mecanismo se resuelve con la herramienta que corresponde:

| Situación | Solución incorrecta | Solución aplicada |
|---|---|---|
| El elemento aparece tarde | `waitForTimeout(5000)` | `expect(locator).toBeVisible()` — reintenta |
| El nodo aún no existe | `waitForTimeout` + `count()` | `toHaveText()` — espera a que se cree |
| Se abre una pestaña | `waitForTimeout` + buscar página | `context.waitForEvent('page')` en paralelo al click |
| Aparece un alert | Click y después manejar | **Handler registrado antes** del click |
| Un contador cambia | `count()` puntual | `toHaveCount()` o `expect.poll()` |

Una espera fija es una apuesta: si el entorno va lento, falla; si va rápido, desperdicia tiempo. Las aserciones con reintento se resuelven apenas la condición se cumple.

### Aserciones estructurales sobre contenido variable

`/dynamic_content` devuelve texto aleatorio en cada recarga. El test **no fija el texto ni la cantidad exacta de bloques**: verifica que la estructura se mantenga estable entre recargas.

Fijar un número exacto fue justamente el error de la primera corrida: se asumieron 3 bloques y son 4.

### Verificar el comportamiento real, no el esperado

`/status_codes/301` **no** sigue la redirección: devuelve 301. La primera versión del test asumía lo contrario. Se verificó contra el servidor y se corrigió la expectativa, dejándolo comentado.

## 4. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La aplicación está alojada en Heroku y puede dormirse | Medio | Timeouts holgados, 1 reintento |
| Recursos externos de terceros que no resuelven | **Alto** | Detectado: es la causa de [BUG-101](../04-execution/bug-reports.md) |
| Contenido aleatorio entre recargas | Medio | Aserciones estructurales, nunca de texto exacto |
| Demo público compartido | Medio | 2 workers, think time en k6 |

## 5. Criterios de salida

- 100 % de `@smoke` en verde
- ≥ 95 % de la regresión en verde
- **Cero `waitForTimeout` en el código**: es un criterio de calidad de la suite, no solo del resultado
- Todo `test.fail()` con su reporte de bug asociado

## 6. Entregables

- Suite Playwright con 18 casos y fixture de archivo para la subida
- Script de k6 que valida códigos de estado intencionales (incluye 404 y 500 esperados)
- [Casos de prueba](../02-test-cases/casos-de-prueba.md), [bitácora](../04-execution/bitacora-de-ejecucion.md) y [BUG-101](../04-execution/bug-reports.md)
