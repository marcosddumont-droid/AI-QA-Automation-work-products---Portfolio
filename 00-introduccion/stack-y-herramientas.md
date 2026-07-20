# Stack y herramientas

Cada herramienta está acá porque resuelve algo que las otras no. No hay ninguna de adorno.

## E2E de interfaz

### Playwright + TypeScript — aplicaciones 01, 02, 03, 05

**Por qué:** auto-waiting real (no hay que poner esperas), ejecución paralela nativa, trazas navegables para depurar fallos, y un solo runner para UI y API. TypeScript en modo `strict` detecta en compilación errores de datos y selectores que de otro modo aparecen recién en la corrida.

**Qué aporta al portfolio:** es el stack más demandado hoy en automatización web.

### Cypress + JavaScript — aplicación 04

**Por qué:** deliberadamente distinto, para mostrar que el criterio de testing no depende de la herramienta. Cypress tiene un modelo de ejecución diferente (corre dentro del navegador), su propio manejo de comandos encadenados y su runner interactivo.

**Qué obliga a resolver:** Cypress no maneja bien múltiples pestañas ni orígenes cruzados. OrangeHRM se eligió justamente porque no los necesita, y esa limitación queda documentada en su test plan.

## API

### Playwright API Testing

**Por qué:** los tests de API viven junto a los de UI, comparten fixtures y datos, y corren en el mismo pipeline. Sirve para validaciones que necesitan lógica: encadenar llamadas, construir datos, afirmar sobre estructuras complejas.

### Postman + Newman

**Por qué:** es el formato que un equipo de QA comparte y versiona en la práctica. La colección sirve de documentación viva de la API, y **Newman** la ejecuta desde la línea de comandos, así que la misma colección que se usa a mano corre en CI.

**Diferencia con lo anterior:** Playwright API es para lógica de test compleja; Postman es para cobertura declarativa y para que cualquiera del equipo la corra sin escribir código.

## Performance

### k6

**Por qué:** los escenarios de carga se escriben en JavaScript y se versionan como código. Se integra a CI y define umbrales (`thresholds`) que hacen fallar la corrida si la latencia se pasa de lo acordado — que es lo que convierte una prueba de performance en un criterio de aceptación y no en un gráfico lindo.

### Apache JMeter

**Por qué:** sigue siendo el estándar en empresas grandes y en banca. Se incluye para mostrar dominio del formato `.jmx`, los thread groups y los listeners, que es lo que se pide en esas vacantes.

**k6 y JMeter juntos no son redundancia:** son los dos mundos que conviven en el mercado. Los escenarios están espejados a propósito para que se vea la equivalencia.

### Nota sobre los objetivos de carga

Los perfiles de **stress y spike apuntan a un mock local** incluido en [`tools/mock-api/`](../tools/mock-api/), nunca a los sitios demo.

Generar carga sostenida contra infraestructura de terceros es abusivo, puede degradar el servicio para otros y suele terminar en bloqueo de IP. Contra las APIs demo reales solo se corren **smokes de 1-2 usuarios virtuales**, que equivalen a navegación normal.

Esta decisión está documentada en cada test plan porque **el criterio para no hacer algo también es parte del trabajo de QA**.

## Accesibilidad

### axe-core (`@axe-core/playwright`)

**Por qué:** automatiza la detección de violaciones WCAG 2.1 AA. Cubre entre el 30 % y el 40 % de los criterios; el resto necesita revisión manual, y eso se aclara en los test plans para no vender cobertura que no existe.

## Soporte

| Herramienta | Para qué |
|---|---|
| **ESLint** | Calidad del código de test, validada en CI |
| **GitHub Actions** | Pipeline con matriz de navegadores y regresión nocturna |
| **Reporter HTML de Playwright** | Reportes con traza, video y screenshot del fallo |
| **JUnit XML** | Formato que consumen las herramientas de CI y gestión de pruebas |

## Qué quedó afuera y por qué

| Herramienta | Motivo |
|---|---|
| Selenium | Playwright cubre lo mismo con menos código y mejor manejo de esperas. Sumarlo no agregaba criterio nuevo, solo volumen |
| Appium | No hay aplicación móvil nativa en el alcance. La cobertura mobile se hace con emulación de viewport |
| Cucumber / Gherkin | Agrega una capa de indirección que solo se justifica si hay gente de negocio escribiendo escenarios. Acá no aportaba |
| Pruebas de seguridad | Fuera de alcance. Escanear aplicaciones de terceros sin autorización escrita no corresponde |
