# QA Portfolio · Testing E2E multi-aplicación

Portfolio de QA construido sobre **5 aplicaciones web distintas**, cada una con su ciclo de testing completo: plan de pruebas, casos documentados, automatización, ejecución y reportes.

> **Empezá por acá:** [`00-introduccion/`](00-introduccion/) explica el objetivo, la estrategia y cómo está organizado todo.

## Las 5 aplicaciones

| # | Aplicación | Dominio | Desafío técnico | Stack E2E |
|---|---|---|---|---|
| [01](01-saucedemo/) | **SauceDemo** | E-commerce | Defectos inyectados a propósito, usuarios con comportamientos distintos | Playwright + TS |
| [02](02-practice-software-testing/) | **Practice Software Testing** | Tienda de herramientas | API REST propia, filtros, paginación, roles | Playwright + TS |
| [03](03-parabank/) | **ParaBank** | Banca | Transferencias, cálculo de saldos, servicios SOAP/REST | Playwright + TS |
| [04](04-orangehrm/) | **OrangeHRM** | RRHH enterprise | Formularios complejos, tablas, permisos por rol | Cypress + JS |
| [05](05-the-internet/) | **The Internet** | Casos borde | iframes, uploads, drag & drop, alerts, autenticación básica | Playwright + TS |

Las cinco son aplicaciones **publicadas expresamente para practicar testing**. No se testea infraestructura de terceros sin permiso.

## Estructura de cada carpeta

Todas las aplicaciones siguen exactamente el mismo esquema, para que se puedan comparar entre sí:

```
0X-aplicacion/
├── README.md              Resumen, alcance y resultados
├── 01-test-plan/          Estrategia, alcance, riesgos, criterios
├── 02-test-cases/         Casos documentados con IDs trazables
├── 03-automation/         Scripts: Playwright/Cypress, Postman, k6, JMeter
├── 04-execution/          Ciclos de ejecución, bitácora y bugs encontrados
└── 05-reports/            Reportes generados por las corridas reales
```

## Capas de testing cubiertas

| Capa | Herramienta | Dónde |
|---|---|---|
| E2E de interfaz | Playwright + TypeScript / Cypress | `03-automation/playwright` o `/cypress` |
| API funcional | Playwright API + Postman/Newman | `03-automation/postman` |
| Performance | k6 | `03-automation/k6` |
| Performance (alternativa) | Apache JMeter | `03-automation/jmeter` |
| Accesibilidad | axe-core | dentro de la suite E2E |

> **Sobre las pruebas de carga:** los perfiles de stress y spike apuntan a un [mock local](tools/mock-api/) incluido en el repo, no a los sitios demo. Generar carga contra infraestructura ajena es abusivo y puede derivar en bloqueos. La justificación está en cada test plan.

## Cómo recorrerlo

**Si tenés 5 minutos:** leé [`00-introduccion/README.md`](00-introduccion/README.md) y mirá los resultados de [01-saucedemo](01-saucedemo/).

**Si tenés 20:** sumá el test plan de [03-parabank](03-parabank/01-test-plan/) — es el dominio con las reglas de negocio más interesantes — y los bugs de [04-execution](01-saucedemo/04-execution/).

**Si querés ver código:** [`01-saucedemo/03-automation/playwright/src/`](01-saucedemo/03-automation/playwright/src/) tiene el Page Object Model y las fixtures.

## Contacto

- **LinkedIn:** _completar_
- **Email:** _completar_
