# Reportes de Bug · The Internet

---

## BUG-101 — El editor TinyMCE del iframe está en modo solo lectura

| | |
|---|---|
| **Severidad** | Crítica |
| **Prioridad** | Alta |
| **Componente** | `/iframe` · editor de texto enriquecido |
| **Entorno** | Chromium 131 · https://the-internet.herokuapp.com/iframe |
| **Estado** | Abierto · **verificado** |
| **Detectado por** | `TC-10` — suite automatizada |

### Pasos para reproducir

1. Abrir https://the-internet.herokuapp.com/iframe
2. Hacer clic dentro del área del editor
3. Intentar escribir cualquier texto

### Resultado esperado

El editor acepta la entrada de teclado y el texto aparece en el área de edición. La página existe justamente para practicar la interacción con un editor dentro de un iframe.

### Resultado obtenido

El editor no acepta ninguna entrada. El `<body>` dentro del iframe tiene el atributo y las clases de solo lectura:

```html
<body id="tinymce"
      contenteditable="false"
      class="mce-content-body mce-content-readonly"
      aria-label="Rich Text Area. Press ALT-0 for help.">
```

`document.designMode` está en `off`.

### Evidencia técnica

El estado es **permanente**, no un problema de sincronización. Se midió el atributo a los 0, 1, 3, 6, 10 y 15 segundos desde la carga y no cambia en ningún momento:

```
t≈0ms     {"contenteditable":"false","clase":"mce-content-body mce-content-readonly","designMode":"off"}
t≈15000ms {"contenteditable":"false","clase":"mce-content-body mce-content-readonly","designMode":"off"}
```

La consola del navegador revela la causa raíz:

```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
All created TinyMCE editors are configured to be read-only.
```

### Causa raíz probable

Dos recursos externos de TinyMCE no resuelven por DNS. Ante la falta de una licencia o configuración válida, las versiones recientes de TinyMCE **degradan el editor a modo solo lectura** en lugar de fallar de forma visible.

### Impacto

La página pierde por completo su propósito: es el ejemplo de referencia para practicar automatización sobre iframes y el elemento a automatizar no es interactuable. Cualquier suite de terceros que use esta página como caso de prueba va a fallar sin motivo aparente.

### Cómo se manejó en la suite

`TC-10` está marcado con `test.fail()` referenciando este bug. El test **pasa porque falla como se espera**: la suite refleja el estado real de la aplicación, el pipeline no se rompe, y el defecto sigue visible en el reporte. Cuando se corrija, el marcador se elimina.

### Nota de diagnóstico

El primer intento de este test falló con un `TimeoutError` genérico en `locator.click`. Un timeout no dice *por qué* algo no se puede clickear. Recién al leer el `call log` de Playwright apareció el atributo `contenteditable="false"`, y de ahí se llegó a la consola y a la causa raíz.

Subir el timeout habría "arreglado" el síntoma sin encontrar nada.
