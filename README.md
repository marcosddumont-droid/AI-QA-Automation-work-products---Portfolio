<div align="center">

<!-- ============================================================
     CARÁTULA
     Pendiente de reemplazar:
       · TU-USUARIO-LINKEDIN  (badge de LinkedIn)
       · TU-USUARIO/qa-portfolio  (badge de CI, según el repo real)
     ============================================================ -->

# 🧪 QA Portfolio

### Testing E2E, API, Performance y Accesibilidad sobre 5 aplicaciones reales

**Marcos Dumont** · QA Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/marcos-dumont)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:marcos.d.dumont@gmail.com)

<br>

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=flat-square&logo=cypress&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![k6](https://img.shields.io/badge/k6-7D64FF?style=flat-square&logo=k6&logoColor=white)
![JMeter](https://img.shields.io/badge/JMeter-D22128?style=flat-square&logo=apache&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-2088FF?style=flat-square&logo=githubactions&logoColor=white)

[![CI](https://github.com/marcosddumont-droid/AI-QA-Automation-work-products---Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/marcosddumont-droid/AI-QA-Automation-work-products---Portfolio/actions/workflows/ci.yml)

<br>

| Aplicaciones | Casos automatizados | Defectos hallados | Herramientas |
|:---:|:---:|:---:|:---:|
| **5** | **113** | **4** | **6** |

<sub>113 casos distintos · 151 ejecuciones con la matriz de navegadores · 53 aserciones adicionales en Postman</sub>

</div>

---

Portfolio de QA construido sobre **5 aplicaciones web distintas**, cada una con su ciclo completo de testing: plan de pruebas, casos documentados, automatización, ejecución y reportes.

Todos los resultados de este documento provienen de **corridas reales verificadas**, no de estimaciones. Las bitácoras de ejecución registran los 19 fallos que hubo durante el desarrollo —15 propios y 4 de las aplicaciones— con su diagnóstico completo, porque encontrar la causa raíz es la parte que importa.

> **Empezá por acá:** [`00-introduccion/`](00-introduccion/) explica el objetivo, la estrategia y cómo está organizado todo.

## Las 5 aplicaciones

| # | Aplicación | Dominio | Desafío técnico | Stack | Resultado |
|---|---|---|---|---|---|
| [01](01-saucedemo/) | **SauceDemo** | E-commerce | Defectos inyectados a propósito | Playwright + TS | **52/71** ⚠️ |
| [02](02-practice-software-testing/) | **Practice Software Testing** | Tienda de herramientas | API REST propia junto a la UI | Playwright + TS | **25/25** ✅ |
| [03](03-parabank/) | **ParaBank** | Banca | Aritmética de saldos, datos compartidos | Playwright + TS | **19/19** ✅ |
| [04](04-orangehrm/) | **OrangeHRM** | RRHH enterprise | Framework distinto, app lenta | **Cypress + JS** | **18/18** ✅ |
| [05](05-the-internet/) | **The Internet** | Casos borde | iframes, alerts, ventanas, uploads | Playwright + TS | **18/18** ✅ |

> ⚠️ **Sobre el 52/71 del sitio 01:** los 19 fallos son **todos del proyecto `firefox-ui`** y se deben a que la máquina donde se corrió no tiene instalado el runtime de Visual C++ (`browserType.launch: spawn UNKNOWN`). No es un defecto de la aplicación ni de los tests: los mismos 19 casos pasan en Chromium y en viewport mobile. Se resuelve con `winget install Microsoft.VCRedist.2015+.x64`. En CI (Ubuntu) no aplica.
>
> Se deja documentado en lugar de sacar Firefox de la matriz: **quitar cobertura para que el número quede lindo es exactamente lo que no hay que hacer.**

Las cinco son aplicaciones **publicadas expresamente para practicar testing**. No se testea infraestructura de terceros sin permiso.

## Resumen de ejecución

| Capa | Herramienta | Cobertura | Resultado |
|---|---|---|---|
| E2E de interfaz | Playwright + Cypress | 100 casos ejecutables | **100/100** ✅ |
| E2E de interfaz | Playwright · Firefox | 19 casos | ⚠️ Bloqueados por el entorno local |
| API funcional | Playwright | 29 casos | **29/29** ✅ |
| API declarativa | Postman / Newman | 20 requests | **53/53 aserciones** ✅ |
| Performance | k6 | 5 escenarios | **4726/4726 checks** ✅ |
| Performance | JMeter | 2 planes | **338 muestras, 0 errores** ✅ |
| Accesibilidad | axe-core | 3 escaneos | **3/3** ✅ |

**Desglose de E2E:** SauceDemo 38 (Chromium + mobile) · Practice Software Testing 13 · ParaBank 13 · OrangeHRM 18 · The Internet 18.

**Desglose de API:** SauceDemo/Restful-Booker 11 · Practice Software Testing 12 · ParaBank 6.

## Defectos encontrados

Cuatro defectos reales, todos con evidencia reproducible:

| ID | Aplicación | Defecto | Severidad |
|---|---|---|---|
| [BUG-006](01-saucedemo/04-execution/bug-reports.md) | SauceDemo | El desplegable de ordenamiento no tiene nombre accesible (WCAG 4.1.2 nivel A) | Alta |
| [BUG-101](05-the-internet/04-execution/bug-reports.md) | The Internet | El editor TinyMCE del iframe está permanentemente en modo solo lectura | Crítica |
| [BUG-201](03-parabank/04-execution/bug-reports.md) | ParaBank | La API devuelve `400` en vez de `404` para una cuenta inexistente | Baja |
| [BUG-301](04-orangehrm/04-execution/bug-reports.md) | OrangeHRM | Promesa rechazada sin manejar al cerrar sesión | Media |

Los tests correspondientes están marcados con `test.fail()` o filtrados de forma explícita, siempre referenciando el ticket: **la suite refleja el estado real de cada aplicación sin romper el pipeline y sin ocultar el defecto.**

## Estructura de cada carpeta

Todas las aplicaciones siguen el mismo esquema, para que se puedan comparar entre sí:

```
0X-aplicacion/
├── README.md              Resumen, decisiones y resultados
├── 01-test-plan/          Estrategia, alcance, riesgos, criterios
├── 02-test-cases/         Casos documentados con IDs trazables
├── 03-automation/         Playwright/Cypress, Postman, k6, JMeter
├── 04-execution/          Bitácora de ciclos y defectos encontrados
└── 05-reports/            Datos de las corridas reales
```

## Decisiones que definen el portfolio

**Las pruebas de carga no golpean infraestructura ajena.** Los perfiles de stress y spike apuntan a un [mock local](tools/mock-api/) incluido en el repo. Contra los sitios reales solo corren smokes de 1-2 usuarios virtuales, equivalentes a navegación normal. El fundamento está en cada test plan.

**Menos concurrencia resultó más rápido.** En el sitio 02, bajar de 4 a 2 workers no solo eliminó 5 timeouts: la suite pasó de 1 min 30 s a 48 s. Cuando el cuello de botella es un servidor compartido, sumar paralelismo resta.

**Ningún `waitForTimeout` en todo el repositorio.** Solo auto-waiting y aserciones con reintento. Es un criterio de calidad de la suite, no solo del resultado.

**Los fallos propios están documentados, no borrados.** De los 19 fallos que hubo durante el desarrollo, 15 fueron de los tests y 4 de las aplicaciones. Las bitácoras registran los 19 con su diagnóstico, porque el proceso de encontrar la causa raíz es la parte que importa.

**Se documenta lo que no se hizo y por qué.** Drag & drop en el sitio 05, escrituras por API en el 02 y 03, alta de empleados en el 04. Un alcance sin límites escritos no es un alcance.

## Cómo recorrerlo

**Si tenés 5 minutos:** [`00-introduccion/README.md`](00-introduccion/README.md) y la tabla de defectos de arriba.

**Si tenés 20:** sumá el [test plan de ParaBank](03-parabank/01-test-plan/plan-de-pruebas.md) —el dominio con las reglas de negocio más exigentes— y la [bitácora de The Internet](05-the-internet/04-execution/bitacora-de-ejecucion.md), donde se ve el diagnóstico completo de BUG-101 desde un timeout genérico hasta la causa raíz.

**Si querés ver código:** [Page Objects de ParaBank](03-parabank/03-automation/playwright/src/pages/) y las [fixtures](03-parabank/03-automation/playwright/src/fixtures/test-fixtures.ts) que aíslan los datos por test.

## Ejecución rápida

```bash
npm install && npx playwright install
npm run test:smoke        # los casos críticos de los 4 sitios Playwright
npm run test:04           # OrangeHRM con Cypress
```

Guía completa en [`00-introduccion/como-ejecutar.md`](00-introduccion/como-ejecutar.md).

## Contacto

**Marcos Dumont** · QA Engineer

- **LinkedIn:** linkedin.com/in/marcos-dumont
- **Email:** marcos.d.dumont@gmail.com
