# Introducción

## Objetivo de este portfolio

Mostrar, sobre aplicaciones reales y verificables, el ciclo completo de trabajo de un QA: cómo se decide **qué** probar, cómo se documenta, cómo se automatiza y cómo se comunican los resultados.

La automatización es la parte visible, pero no es el objetivo. Un framework prolijo que prueba lo que no importa no sirve de nada. Por eso cada aplicación arranca con un **test plan que justifica el alcance** y termina con **hallazgos concretos**, no con una cifra de tests en verde.

## Por qué 5 aplicaciones y no una

Una sola aplicación demuestra que sabés usar una herramienta. Cinco dominios distintos demuestran que sabés **adaptar la estrategia al contexto**, que es lo que realmente se hace en el trabajo:

| Aplicación | Qué obliga a resolver |
|---|---|
| SauceDemo | Defectos inyectados: separar *bug de la app* de *test mal escrito* |
| Practice Software Testing | API propia: decidir qué se prueba en API y qué en UI sin duplicar |
| ParaBank | Reglas de negocio con dinero: precisión en cálculos y estados |
| OrangeHRM | Enterprise: formularios largos, tablas paginadas, permisos por rol |
| The Internet | Casos borde que rompen frameworks: iframes, uploads, alerts |

## Estrategia general

### Selección de casos: riesgo × frecuencia

No se automatiza todo. Se prioriza por el producto entre **impacto si falla** y **cuán seguido se usa**. En un e-commerce eso es el checkout; en un banco, la transferencia; en un HR, el alta de empleado.

Lo que queda afuera se documenta como decisión explícita en cada test plan, con el motivo. Un alcance sin límites escritos no es un alcance.

### Distribución por capa

```
        /\          E2E UI  · pocos, caros, solo caminos críticos
       /  \
      /----\        API     · muchos, rápidos, la mayor parte de la lógica
     /      \
    /--------\      Unit    · fuera de alcance: no hay acceso al código
   /__________\
```

Las aplicaciones bajo prueba son de terceros y no se tiene acceso al código fuente, así que la base de la pirámide (unitarias) no es alcanzable. La estrategia compensa cargando el peso en **API**, que es rápida y estable, y reservando **E2E de UI** para los flujos que solo se pueden validar de punta a punta.

### Etiquetado

| Etiqueta | Qué agrupa | Cuándo corre |
|---|---|---|
| `@smoke` | Camino feliz de cada flujo crítico | En cada push. Si falla, se corta el build |
| `@regression` | Suite completa, incluye negativos y borde | En cada PR y de forma nocturna |
| `@a11y` | Escaneos de accesibilidad | Nocturno, se reporta aparte |

## Convenciones

**IDs trazables.** Cada caso documentado tiene un ID (`TC-01`, `API-03`, `PERF-02`) que aparece en el nombre del test automatizado. Un fallo en el reporte se rastrea hasta la fila de la tabla en segundos.

**Un solo lugar para los selectores.** Page Object Model en todas las suites. Cuando la app cambia, se toca un archivo.

**Sin esperas fijas.** Ningún `sleep` ni `waitForTimeout` en el código. Solo auto-waiting y aserciones con reintento, que es lo que evita los tests inestables.

**Datos únicos por ejecución.** Los tests que crean registros usan builders que generan valores irrepetibles, para poder correr en paralelo sin colisiones.

**Los bugs conocidos no se ocultan.** Cuando un test falla por un defecto real de la app, se documenta y se marca con `test.fail()` referenciando el bug. El pipeline queda verde sin barrer el problema bajo la alfombra.

## Documentos de esta carpeta

- [`estrategia-qa.md`](estrategia-qa.md) — criterios de priorización, tipos de prueba y cuándo aplicar cada uno
- [`stack-y-herramientas.md`](stack-y-herramientas.md) — qué hace cada herramienta, por qué esa y no otra
- [`como-ejecutar.md`](como-ejecutar.md) — instalación y comandos para correr todo
