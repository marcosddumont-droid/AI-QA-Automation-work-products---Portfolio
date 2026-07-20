# Plan de Pruebas · Practice Software Testing

## 1. Objetivo

Validar el flujo de compra de una tienda de herramientas y el contrato de su API REST, repartiendo la cobertura entre ambas capas sin duplicar esfuerzo.

## 2. Alcance

### Dentro del alcance

| Área | Capa | Casos |
|---|---|---|
| Catálogo: listado, contrato de datos | API | 2 |
| Paginación y filtros por precio | API | 2 |
| Búsqueda por nombre | API | 1 |
| Marcas y categorías | API | 3 |
| Autenticación y endpoints protegidos | API | 3 |
| Recursos inexistentes (404) | API | 1 |
| Catálogo: render, búsqueda, ordenamiento | UI | 7 |
| Detalle de producto | UI | 2 |
| Carrito y aritmética de totales | UI | 4 |
| Performance de lectura | k6 / JMeter | 2 |

### Fuera del alcance, con motivo

| Qué | Por qué |
|---|---|
| Registro y compra completa con pago | Requiere crear usuarios y órdenes en un backend compartido con otras personas. Se prueba hasta el paso previo al pago |
| Operaciones de escritura por API (POST/PUT/DELETE) | Mismo motivo: contaminaría datos de terceros |
| Panel de administración | Requiere credenciales que no son públicas |
| Compatibilidad con Safari/IE | Sin acceso a esos navegadores en el entorno |

## 3. Estrategia: cómo se decidió la capa

La regla aplicada fue: **el riesgo se prueba en el nivel más barato donde se puede detectar**.

| Riesgo | Capa elegida | Razonamiento |
|---|---|---|
| El backend devuelve productos sin precio | API | Es una regla de datos. Un test de UI lo detectaría igual, pero tardando 20 veces más |
| El filtro de precio devuelve fuera de rango | API | Lógica de consulta, no de presentación |
| La grilla no muestra los productos | UI | Solo observable con render real |
| El total del carrito no suma bien | UI | El cálculo ocurre en el cliente |
| El ordenamiento está mal | **Ambas** | Son dos riesgos distintos: que el backend ordene mal, y que la UI no respete el orden recibido |

## 4. Decisiones de ejecución

### Concurrencia limitada a 2 workers

La aplicación es un demo público y compartido. La primera corrida con 4 workers produjo **5 timeouts** que no eran defectos: el servidor limitaba las peticiones.

Con 2 workers la suite pasó a verde **y bajó de 1 min 30 s a 48 s**. La concurrencia agresiva contra infraestructura ajena es contraproducente incluso para el propio tiempo de ejecución.

### Carga de performance contra el mock local

Los perfiles de stress y spike apuntan al [mock del portfolio](../../tools/mock-api/), no a esta aplicación. Contra la API real solo se corre un smoke de **2 usuarios virtuales con think time de 2 s**, que equivale a dos personas navegando.

Generar carga sostenida contra un servicio de terceros degrada el servicio para el resto y suele terminar en bloqueo de IP.

### Solo operaciones de lectura por API

Ningún test crea, modifica ni borra recursos. La base es compartida.

## 5. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El demo público limita peticiones o cae | Alto | Concurrencia baja, timeouts holgados, 1 reintento |
| Los ids de producto son ULIDs que cambian al resetear la base | Medio | Ningún test usa ids fijos: se encadenan desde el listado |
| El carrito se renderiza en el cliente con demora | Medio | Esperas explícitas en el Page Object, sin `sleep` |
| Los selectores `data-test` cambian entre versiones | Bajo | Page Object Model: se corrige en un archivo |

## 6. Criterios de salida

- 100 % de `@smoke` en verde
- ≥ 95 % de la regresión en verde
- Cero defectos abiertos de severidad Crítica o Alta
- Umbrales de k6 cumplidos (`p(95) < 4000 ms`, errores < 5 %)

## 7. Entregables

- Suite Playwright (API + UI) versionada
- Colección Postman ejecutable con Newman
- Scripts de k6 y plan de JMeter
- Reportes HTML, JUnit XML y `.jtl`
- [Casos de prueba](../02-test-cases/casos-de-prueba.md) y [bitácora](../04-execution/bitacora-de-ejecucion.md)
