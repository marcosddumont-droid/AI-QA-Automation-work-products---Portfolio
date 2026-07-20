# Reportes de Bug · ParaBank

---

## BUG-201 — La API devuelve 400 en lugar de 404 para una cuenta inexistente

| | |
|---|---|
| **Severidad** | Baja |
| **Prioridad** | Baja |
| **Componente** | API · `GET /services/bank/accounts/{id}` |
| **Estado** | Abierto · **verificado** |
| **Detectado por** | `API-04` (Playwright) y `API-05` (Postman) |

### Pasos para reproducir

```bash
curl -H "Accept: application/json" \
  https://parabank.parasoft.com/parabank/services/bank/accounts/99999999
```

### Resultado esperado

`404 Not Found`. La petición está bien formada y es semánticamente válida; lo que no existe es el recurso.

### Resultado obtenido

`400 Bad Request`.

### Impacto

Bajo en lo funcional, pero incorrecto desde el diseño de la API:

- `400` le dice al cliente "tu petición está mal armada", cuando en realidad está perfecta.
- Un cliente que distinga *recurso inexistente* de *petición inválida* —para decidir entre mostrar "no encontrado" o registrar un error de programación— toma la decisión equivocada.
- Impide diferenciar un id inexistente de un id con formato inválido, porque ambos devuelven lo mismo.

### Cómo se manejó en la suite

El test **afirma el comportamiento real** (`400`), no el ideal, con un comentario que explica por qué y remite a este reporte.

Un test que afirmara `404` estaría rojo de forma permanente sin aportar información. La discrepancia entre lo que hace y lo que debería hacer se documenta acá, que es donde corresponde.

---

## Observaciones sin severidad asignada

Comportamientos detectados durante la exploración que no son defectos, pero que condicionan cómo se automatiza. Se registran porque le ahorran horas a quien retome la suite.

### OBS-01 · El registro no redirige al resumen de cuentas

Tras un alta exitosa, la aplicación **se queda en `register.htm`** mostrando "Welcome \<usuario\>" y el mensaje "Your account was created successfully. You are now logged in.". La sesión queda iniciada, pero hay que navegar a `overview.htm` de forma explícita.

Una fixture que espere el resumen de cuentas después de registrarse se cuelga hasta agotar el timeout.

### OBS-02 · El panel lateral saluda con nombre y apellido, no con el usuario

`#rightPanel h1` muestra `Welcome <usuario>` y `#leftPanel` muestra `Welcome <nombre> <apellido>`. Afirmar el usuario contra el panel equivocado falla.

### OBS-03 · La operación de transferencia falla en silencio

Si se envía el formulario antes de que los desplegables se pueblen por AJAX, no aparece ningún mensaje de error: la página simplemente no cambia. Desde el punto de vista de la usabilidad es un problema —el usuario no sabe qué pasó— aunque en la práctica la ventana para reproducirlo a mano es muy chica.
