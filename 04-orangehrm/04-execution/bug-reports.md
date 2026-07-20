# Reportes de Bug · OrangeHRM

---

## BUG-301 — Promesa rechazada sin manejar al cerrar sesión

| | |
|---|---|
| **Severidad** | Media |
| **Prioridad** | Media |
| **Componente** | Autenticación · cierre de sesión |
| **Entorno** | Electron 118 (Cypress) · https://opensource-demo.orangehrmlive.com |
| **Estado** | Abierto · **verificado** |
| **Detectado por** | `TC-08` — suite automatizada Cypress |

### Pasos para reproducir

1. Iniciar sesión con `Admin` / `admin123`
2. Abrir el desplegable del usuario, arriba a la derecha
3. Hacer clic en **Logout**
4. Observar la consola del navegador

### Resultado esperado

El cierre de sesión se completa sin errores en consola. Las peticiones que quedan en vuelo al navegar se cancelan de forma controlada.

### Resultado obtenido

Se produce una promesa rechazada sin manejar:

```
TypeError: Cannot read properties of undefined (reading 'response')
    at web/dist/js/app.js:1:11603
    at async ln.request (chunk-vendors.js:144:83035)
    at ln.request (chunk-vendors.js:144:83131)
```

### Causa raíz

Al navegar fuera del dashboard, las peticiones XHR en curso se abortan. En una petición abortada, el objeto de error de axios **no tiene la propiedad `response`** (no hubo respuesta del servidor). El interceptor de errores de la aplicación accede a `error.response` sin verificar que exista, y revienta.

### Impacto

El usuario no percibe nada: la sesión se cierra igual. Pero:

- Ensucia la consola y dificulta diagnosticar problemas reales.
- Toda suite automatizada que verifique el logout falla, porque los frameworks E2E interpretan una excepción no capturada de la aplicación como un fallo del test. Es exactamente lo que pasó acá.
- Indica un patrón de manejo de errores incompleto que probablemente se repita en otros interceptores.

### Corrección sugerida

```js
// En el interceptor de errores
if (error.response) {
  // manejo normal del error HTTP
} else if (axios.isCancel(error)) {
  return; // petición cancelada: no es un error a reportar
}
```

### Cómo se manejó en la suite

En `cypress/support/e2e.js` se filtra **este mensaje puntual**, con el número de ticket y la explicación asociada, y se registra en el log de la corrida con `Cypress.log`.

No se usó un `return false` genérico que silenciara toda excepción: eso habría tapado también los errores reales que la suite tiene que detectar. La lista de defectos filtrados es explícita y cada entrada tiene su ticket.

---

## BUG-302 — Bucle de ResizeObserver en el layout

| | |
|---|---|
| **Severidad** | Baja |
| **Prioridad** | Baja |
| **Componente** | Layout general |
| **Estado** | Abierto |

**Descripción:** la aplicación emite `ResizeObserver loop completed with undelivered notifications` al redimensionar o al montar ciertos componentes.

**Impacto:** ninguno a nivel funcional. Es ruido en consola, pero rompe suites automatizadas por el mismo motivo que BUG-301.

**Nota:** es un problema conocido y frecuente en aplicaciones Vue/React que observan tamaños en un ciclo de render. Se corrige normalmente encolando la callback del observer con `requestAnimationFrame`.
