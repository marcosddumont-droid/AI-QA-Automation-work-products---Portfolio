import './commands.js';

/**
 * OrangeHRM emite excepciones no capturadas desde su propio bundle de Vue.
 * Cypress falla el test ante cualquier excepción de la aplicación, así que
 * se filtran SOLO las que están identificadas y documentadas como defectos
 * de la app, con su ticket asociado.
 *
 * No es un "ignorar todo": cualquier error fuera de esta lista sigue rompiendo
 * el test, que es justamente lo que se quiere.
 */
const DEFECTOS_CONOCIDOS_DE_LA_APP = [
  {
    patron: "Cannot read properties of undefined (reading 'response')",
    ticket: 'BUG-301',
    descripcion:
      'Al cerrar sesión, las peticiones en vuelo se abortan y el manejador ' +
      'de errores de axios accede a error.response sin verificar que exista.',
  },
  {
    patron: 'ResizeObserver loop',
    ticket: 'BUG-302',
    descripcion: 'Bucle de ResizeObserver en el layout: ruido, sin impacto funcional.',
  },
];

Cypress.on('uncaught:exception', (err) => {
  const conocido = DEFECTOS_CONOCIDOS_DE_LA_APP.find(({ patron }) => err.message.includes(patron));

  if (conocido) {
    // Queda registrado en el log de la corrida: el defecto no desaparece,
    // simplemente no invalida un test que verifica otra cosa.
    Cypress.log({
      name: 'defecto conocido',
      message: `${conocido.ticket}: ${conocido.descripcion}`,
    });
    return false;
  }

  return true;
});
