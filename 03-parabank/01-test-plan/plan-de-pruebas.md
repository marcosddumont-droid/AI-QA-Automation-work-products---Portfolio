# Plan de Pruebas · ParaBank

## 1. Objetivo

Validar los flujos críticos de una aplicación de banca en línea —alta de clientes, autenticación, apertura de cuentas y transferencia de fondos— con especial atención a la **exactitud de los saldos**.

## 2. Por qué este dominio exige un estándar distinto

En un e-commerce, un error de cálculo genera un reclamo. En un banco, genera un descuadre contable y potencialmente un problema regulatorio.

Eso cambia el criterio de aserción:

| Nivel de aserción | Ejemplo | ¿Alcanza? |
|---|---|---|
| "La operación no dio error" | El botón no explotó | ❌ No |
| "Aparece el mensaje de éxito" | "Transfer Complete!" | ❌ No |
| **"Los saldos cuadran"** | `origen = origen_antes − monto` y `destino = destino_antes + monto` | ✅ Sí |

`TC-22` implementa el tercer nivel: lee los saldos antes, ejecuta la transferencia y verifica ambos lados de la ecuación.

## 3. Alcance

### Dentro del alcance

| Área | Capa | Casos |
|---|---|---|
| Registro de clientes y validaciones | UI | 3 |
| Login, logout y control de acceso | UI | 5 |
| Resumen y detalle de cuentas | UI | 2 |
| Apertura de cuentas | UI | 1 |
| Transferencia de fondos y aritmética de saldos | UI | 2 |
| Consulta de cuentas, clientes y transacciones | API | 6 |
| Performance de lectura | k6 | 1 |

### Fuera del alcance, con motivo

| Qué | Por qué |
|---|---|
| Solicitud de préstamos | Genera registros persistentes en la base compartida sin aportar cobertura nueva sobre el riesgo principal |
| Bill Pay | Ídem: es una variante de transferencia, ya cubierta |
| Operaciones de escritura por API | No se mueve dinero por API contra una base compartida |
| Servicios SOAP | El equivalente REST cubre los mismos casos con menos fricción |
| Panel de administración (`admin.htm`) | Permite resetear la base entera: usarlo afectaría a terceros |

## 4. Estrategia de datos: aislamiento por test

**Problema.** La base es compartida y de escritura. Un usuario fijo haría que el saldo esperado dependa de las transferencias de corridas anteriores —propias o de cualquier otra persona usando la demo—. Los tests de saldo serían inestables por diseño.

**Solución.** La fixture `clienteRegistrado` da de alta un cliente nuevo con usuario irrepetible:

```
qa_<últimos 8 dígitos del timestamp><aleatorio de 3 dígitos>
```

El componente aleatorio además del timestamp cubre el caso de dos workers arrancando en el mismo milisegundo.

**Contrapartida asumida.** Cada corrida deja clientes nuevos en la demo. Se aceptó porque es una aplicación diseñada expresamente para practicar registro, se resetea periódicamente, y la alternativa —tests que dependen de estado ajeno— es peor.

Para las pruebas de **solo lectura** se usa el usuario compartido `john/demo`, que no genera datos.

## 5. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Los saldos cambian entre lectura y verificación | **Alto** | `fullyParallel: false` dentro de cada archivo: los flujos de dinero corren en orden |
| Formularios poblados por AJAX enviados antes de tiempo | **Alto** | Page Objects que esperan a que los `select` tengan opciones. La operación falla en silencio si no |
| Varios `h1` visibles simultáneamente | Medio | Locators anclados al panel (`#showResult`), nunca al primer elemento que coincide |
| La demo se resetea durante la corrida | Medio | Ningún test depende de datos preexistentes salvo la cuenta 13344 de solo lectura |
| El demo público limita peticiones | Medio | 2 workers, timeouts holgados, 1 reintento |

## 6. Criterios de salida

- 100 % de `@smoke` en verde
- ≥ 95 % de la regresión en verde
- **Cero discrepancias de saldo**: cualquier fallo en `TC-22` bloquea la entrega, sin excepción
- Umbrales de k6 cumplidos (`p(95) < 3000 ms`)

## 7. Entregables

- Suite Playwright (UI + API)
- Colección Postman ejecutable con Newman
- Script de k6 de solo lectura
- [Casos de prueba](../02-test-cases/casos-de-prueba.md), [bitácora](../04-execution/bitacora-de-ejecucion.md) y [defectos](../04-execution/bug-reports.md)
