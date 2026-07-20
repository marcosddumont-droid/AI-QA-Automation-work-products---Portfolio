# Plan de Pruebas · OrangeHRM

## 1. Objetivo

Validar la autenticación, el control de acceso y el módulo PIM (gestión de empleados) de una aplicación de RRHH empresarial, **usando un framework distinto al del resto del portfolio** para demostrar que la estrategia no depende de la herramienta.

## 2. Por qué Cypress

| Aspecto | Playwright (sitios 01, 02, 03, 05) | Cypress (este sitio) |
|---|---|---|
| Ejecución | Fuera del navegador, por protocolo | **Dentro** del navegador |
| Sintaxis | `async/await` | Cadena de comandos |
| Page Objects | Métodos que devuelven promesas | Métodos que devuelven cadenas |
| Reintentos | En la aserción | En el comando y la aserción |
| Múltiples pestañas | Soportado | **No soportado** |
| Orígenes cruzados | Soportado | Limitado (`cy.origin`) |

**Consecuencia sobre el alcance:** los casos que requieren pestañas nuevas u orígenes cruzados quedan fuera de este sitio por limitación real del framework, no por olvido. Están cubiertos en [05-the-internet](../../05-the-internet/) con Playwright.

## 3. Alcance

### Dentro del alcance

| Área | Casos |
|---|---|
| Login válido e inválido | 3 |
| Validaciones del formulario | 2 |
| Enmascarado de contraseña | 1 |
| Control de acceso a rutas protegidas | 2 |
| Listado de empleados (PIM) | 2 |
| Filtros y búsqueda | 3 |
| Paginación | 1 |
| Navegación entre módulos | 4 |
| Performance de la página de login | 1 |

### Fuera del alcance, con motivo

| Qué | Por qué |
|---|---|
| Alta, edición y baja de empleados | Es un demo compartido: crear registros ensucia los datos de otras personas y los tests se vuelven dependientes del estado |
| Carga de fotos y adjuntos | Persiste archivos en un servidor de terceros |
| Módulos Leave, Time, Recruitment en profundidad | Solo se verifica que sean accesibles. Cubrirlos a fondo multiplicaría el esfuerzo sin agregar criterio nuevo |
| Gestión de usuarios del sistema (Admin) | Podría dejar la demo inutilizable para otros |
| Múltiples pestañas / orígenes cruzados | Limitación del framework, documentada arriba |

## 4. Estrategia

### Sesión compartida entre tests

El login contra el demo tarda **~35 segundos**. Con 18 casos, hacerlo en cada uno sumaría más de 10 minutos de puro login y golpearía innecesariamente un servidor compartido.

`cy.iniciarSesion()` usa `cy.session`, que cachea cookies y `localStorage`. Incluye `validate()`: si la sesión cacheada dejó de servir, Cypress rehace el login de forma automática.

Los tests de autenticación **no** usan la sesión cacheada, porque justamente prueban el proceso de login.

### Manejo de excepciones de la aplicación

Cypress falla el test ante cualquier excepción no capturada de la aplicación. OrangeHRM emite dos de forma recurrente.

La política aplicada: **lista explícita de defectos conocidos, cada uno con su ticket**.

```js
const DEFECTOS_CONOCIDOS_DE_LA_APP = [
  { patron: "Cannot read properties of undefined (reading 'response')",
    ticket: 'BUG-301', descripcion: '...' },
  { patron: 'ResizeObserver loop', ticket: 'BUG-302', descripcion: '...' },
];
```

No se usa un `return false` genérico: eso silenciaría también los errores reales que la suite tiene que detectar. Cada filtro se registra en el log de la corrida.

### Selectores por etiqueta visible

Los campos del filtro de PIM no tienen `name` ni `id`; las clases son generadas. Se ubican por la etiqueta visible y de ahí se sube al contenedor:

```js
cy.contains('.oxd-input-group label', 'Employee Id')
  .closest('.oxd-input-group')
  .find('input');
```

Más verboso que un selector directo, pero sobrevive a los cambios de clases generadas y se lee como lo vería una persona usando la aplicación.

## 5. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El demo es lento (~35 s por login) | Alto | `cy.session`, timeouts holgados, 1 reintento |
| Excepciones de la app rompen tests ajenos | Alto | Lista explícita de defectos conocidos con ticket |
| Electron no arranca sin flags de GPU | **Bloqueante** | `tools/run-cypress.mjs` los fija antes de lanzar Cypress |
| Los datos del demo cambian (120 empleados hoy) | Medio | Ningún test fija cantidades: se comparan conteos relativos |
| Clases CSS generadas cambian entre versiones | Medio | Selección por etiqueta visible y Page Objects |

## 6. Criterios de salida

- 100 % de `@smoke` en verde
- ≥ 95 % de la regresión en verde
- Cero defectos abiertos de severidad Crítica
- Todo filtro de `uncaught:exception` con su ticket documentado

## 7. Entregables

- Suite Cypress con Page Objects y comandos personalizados
- Script de k6 para la página de login
- [Casos de prueba](../02-test-cases/casos-de-prueba.md), [bitácora](../04-execution/bitacora-de-ejecucion.md) y [defectos](../04-execution/bug-reports.md)
