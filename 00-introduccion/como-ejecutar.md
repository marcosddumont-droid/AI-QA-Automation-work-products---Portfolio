# Cómo ejecutar

## Requisitos

| Herramienta | Versión | Necesaria para |
|---|---|---|
| Node.js | ≥ 20 | Todo |
| Java | ≥ 8 | Solo JMeter |
| k6 | ≥ 0.50 | Solo pruebas de carga |
| JMeter | 5.6.3 | Solo pruebas de carga |
| Newman | ≥ 6 | Solo colecciones Postman |

## Instalación

```bash
git clone <url-del-repo>
cd qa-portfolio

npm install
npx playwright install chromium firefox
```

Una sola instalación en la raíz cubre los cinco sitios: comparten dependencias y cada uno aporta su propia configuración.

### Herramientas opcionales

```bash
# k6
winget install GrafanaLabs.k6     # Windows
brew install k6                   # macOS

# Newman
npm install -g newman

# JMeter: descargar de https://jmeter.apache.org/download_jmeter.cgi
```

## Ejecución

### Todo lo que corre sin herramientas extra

```bash
npm run test:playwright   # sitios 01, 02, 03 y 05
npm run test:04           # sitio 04 (Cypress)
npm run test:smoke        # solo los casos @smoke de los sitios Playwright
```

### Por sitio

```bash
npm run test:01           # SauceDemo
npm run test:02           # Practice Software Testing
npm run test:03           # ParaBank
npm run test:04           # OrangeHRM (Cypress)
npm run test:05           # The Internet
```

> **Sitio 04:** usar siempre `npm run test:04`, nunca `cypress run` directo. El script fija los flags de GPU sin los cuales Electron no arranca. El motivo está en [`tools/run-cypress.mjs`](../tools/run-cypress.mjs).

### Filtrar por etiqueta

```bash
npm run test:01 -- --grep @smoke
npm run test:02 -- --grep @regression
```

### Modo interactivo

```bash
npm run test:01 -- --headed        # con navegador visible
npm run test:01 -- --debug         # inspector de Playwright
npm run test:04:open               # runner de Cypress
```

## API con Postman / Newman

El mock local tiene que estar corriendo para la colección del sitio 01:

```bash
npm run mock          # en una terminal
```

```bash
# Sitio 01 · contra el mock local
newman run 01-saucedemo/03-automation/postman/mock-api.postman_collection.json

# Sitio 02 · contra la API real
newman run 02-practice-software-testing/03-automation/postman/practice-api.postman_collection.json

# Sitio 03 · contra los servicios de ParaBank
newman run 03-parabank/03-automation/postman/parabank-api.postman_collection.json
```

## Performance con k6

```bash
# Carga real — contra el mock local (levantarlo primero con npm run mock)
k6 run 01-saucedemo/03-automation/k6/carga-mock.js

# Smokes contra los sitios reales (1-2 VUs)
k6 run 01-saucedemo/03-automation/k6/smoke-saucedemo.js
k6 run 02-practice-software-testing/03-automation/k6/smoke-api.js
k6 run 03-parabank/03-automation/k6/smoke-api.js
k6 run 04-orangehrm/03-automation/k6/smoke-login.js
k6 run 05-the-internet/03-automation/k6/smoke-endpoints.js
```

> **No subir los usuarios virtuales de los smokes.** Apuntan a infraestructura de terceros. Los perfiles de carga van contra el mock local. El fundamento está en cada test plan.

## Performance con JMeter

```bash
npm run mock   # en otra terminal

jmeter -n -t 01-saucedemo/03-automation/jmeter/carga-mock.jmx \
       -l 01-saucedemo/05-reports/jmeter-resultados.jtl \
       -e -o 01-saucedemo/05-reports/jmeter \
       -Jusuarios=20 -Jrampa=10 -Jduracion=30
```

Parámetros disponibles: `usuarios`, `rampa`, `duracion`, `host`, `port`.

## Reportes

Los dashboards HTML **no están versionados**: se generan al correr las suites. Después de ejecutar:

| Reporte | Ruta |
|---|---|
| Playwright | `0X-sitio/05-reports/playwright/index.html` |
| JMeter | `01-saucedemo/05-reports/jmeter/index.html` |
| Capturas de Cypress | `04-orangehrm/05-reports/cypress/screenshots/` |

Sí están versionados los **datos** de ejecución: `junit.xml`, `.jtl` y `statistics.json`.

## Calidad del código

```bash
npm run typecheck    # TypeScript en modo strict
npm run lint         # ESLint
```

Ambos corren en CI y bloquean el merge si fallan.

## Problemas conocidos del entorno

| Síntoma | Causa | Solución |
|---|---|---|
| `browserType.launch: spawn UNKNOWN` en Firefox | Falta el runtime de Visual C++ | `winget install Microsoft.VCRedist.2015+.x64` |
| `GPU process isn't usable` en Cypress | Electron sin aceleración por hardware | Usar `npm run test:04`, que ya fija los flags |
| Tests de UI con timeouts esporádicos | Los demos públicos limitan peticiones | Ya mitigado con `workers: 2`. No subirlo |
