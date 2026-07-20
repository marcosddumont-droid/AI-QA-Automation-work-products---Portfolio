# Estrategia de QA

## Cómo se decide qué probar

### 1. Matriz de riesgo

Cada funcionalidad se ubica según **impacto si falla** y **probabilidad de fallo**. La probabilidad se estima por complejidad, frecuencia de cambio y antecedentes de defectos.

| | Impacto bajo | Impacto medio | Impacto alto |
|---|---|---|---|
| **Prob. alta** | Automatizar en regresión | Automatizar en regresión | **Automatizar en smoke** |
| **Prob. media** | Exploratorio | Automatizar en regresión | **Automatizar en smoke** |
| **Prob. baja** | No cubrir | Exploratorio | Automatizar en regresión |

Ejemplo aplicado a un e-commerce: el checkout es impacto alto y probabilidad media (toca pagos, cambia seguido) → smoke. El ordenamiento del catálogo es impacto bajo y probabilidad baja → regresión, no smoke.

### 2. Qué NO se automatiza

Decisión tan importante como la anterior, y casi nunca escrita:

- **Lo que cambia todo el tiempo.** Un test que hay que arreglar cada sprint cuesta más de lo que aporta.
- **Lo que se ejecuta una sola vez.** Una migración se prueba a mano.
- **Lo que depende de criterio visual o subjetivo.** "¿Se ve bien?" no es una aserción.
- **Lo que ya está cubierto en una capa más barata.** Si la validación se prueba en API, no se repite en UI.

### 3. Elección de capa

Ante un caso nuevo, la pregunta es **cuál es el nivel más barato donde este riesgo se puede detectar**:

| Se prueba en | Cuando |
|---|---|
| **API** | La regla es de negocio o de datos y no depende de la interfaz |
| **E2E UI** | El riesgo está en la integración entre capas o en el flujo del usuario |
| **Visual / a11y** | El riesgo está en la presentación o en la accesibilidad |
| **Performance** | El riesgo es de tiempo de respuesta bajo concurrencia |

Regla práctica: si el mismo bug lo detectaría un test de API, no se escribe un test de UI para eso.

## Tipos de prueba aplicados

### Funcionales

- **Camino feliz** — el flujo completo con datos válidos. Es el `@smoke`.
- **Casos negativos** — datos inválidos, campos vacíos, credenciales incorrectas. Suelen encontrar más bugs que el camino feliz.
- **Casos borde** — límites de rango, cadenas largas, cero, valores negativos.
- **Particiones de equivalencia y valores límite** — para no escribir 40 casos donde 6 cubren lo mismo.

### No funcionales

- **Performance** — latencia y throughput bajo concurrencia, con umbrales que hacen fallar la corrida.
- **Accesibilidad** — WCAG 2.1 nivel AA, automatizado con axe-core más verificación de navegación por teclado.
- **Compatibilidad** — Chromium, Firefox y viewport mobile en la matriz de CI.

### Exploratorias

Sesiones con carta de exploración (*charter*), tiempo acotado y notas. Es lo que encuentra los bugs que ningún caso escrito anticipa. Los hallazgos se documentan en `04-execution/` de cada aplicación.

## Criterios de entrada y salida

**Entrada a la ejecución:**
- Entorno accesible y build desplegado
- Datos de prueba disponibles
- Casos revisados y priorizados

**Salida (definición de terminado):**
- 100 % de `@smoke` en verde
- ≥ 95 % de la regresión en verde
- Cero defectos abiertos de severidad Crítica o Alta
- Cero violaciones de accesibilidad de impacto `critical` o `serious` sin documentar
- Hallazgos reportados con pasos reproducibles y evidencia

## Clasificación de defectos

### Severidad — impacto técnico

| Nivel | Definición |
|---|---|
| **Crítica** | Bloquea un flujo de negocio completo, sin alternativa |
| **Alta** | Funcionalidad importante rota, pero hay camino alternativo |
| **Media** | Comportamiento incorrecto con impacto acotado |
| **Baja** | Cosmético o de bajo alcance |

### Prioridad — urgencia de negocio

Se define con el equipo de producto, no por QA en soledad. Severidad y prioridad **no son lo mismo**: un typo en el logo de la home es severidad Baja y prioridad Crítica.

## Gestión de tests inestables (flaky)

Un test que falla de manera intermitente es peor que no tener test: entrena al equipo a ignorar el rojo.

Protocolo aplicado:
1. **Detectar** — el reporte marca los que pasan al reintentar.
2. **Diagnosticar con la traza**, nunca subiendo el timeout a ciegas.
3. **Corregir la causa** — normalmente un selector frágil, una dependencia de orden entre tests o datos compartidos.
4. **Si no se puede corregir en el momento**, se aísla con `test.fixme()` y queda un ticket. No se deja en verde a fuerza de reintentos.
