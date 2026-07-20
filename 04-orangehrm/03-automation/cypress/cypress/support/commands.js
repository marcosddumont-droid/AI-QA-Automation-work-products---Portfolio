/**
 * Comandos personalizados.
 *
 * `cy.iniciarSesion` usa `cy.session`, que cachea cookies y localStorage entre
 * tests: el login se ejecuta una sola vez y los tests siguientes restauran la
 * sesión. Sin esto, cada test pagaría el costo del login contra un demo
 * público compartido, que es lento y además carga innecesariamente el sitio.
 */
Cypress.Commands.add('iniciarSesion', (usuario = 'Admin', password = 'admin123') => {
  cy.session(
    [usuario, password],
    () => {
      cy.visit('/web/index.php/auth/login');
      cy.get('input[name="username"]').type(usuario);
      cy.get('input[name="password"]').type(password, { log: false });
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard/index');
    },
    {
      validate() {
        // Si la sesión cacheada ya no sirve, Cypress rehace el login.
        cy.visit('/web/index.php/dashboard/index');
        cy.get('.oxd-topbar-header-breadcrumb-module').should('be.visible');
      },
    },
  );
});

/** Espera a que el spinner de carga de OrangeHRM desaparezca. */
Cypress.Commands.add('esperarCarga', () => {
  cy.get('body').then(($body) => {
    if ($body.find('.oxd-loading-spinner').length) {
      cy.get('.oxd-loading-spinner', { timeout: 30_000 }).should('not.exist');
    }
  });
});
