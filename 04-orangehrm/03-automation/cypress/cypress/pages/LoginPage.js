/**
 * Page Object de la pantalla de login.
 *
 * En Cypress los Page Objects devuelven cadenas de comandos, no promesas:
 * los métodos encolan comandos y las aserciones se escriben en el test.
 */
export class LoginPage {
  abrir() {
    cy.visit('/web/index.php/auth/login');
    return this;
  }

  usuario() {
    return cy.get('input[name="username"]');
  }

  password() {
    return cy.get('input[name="password"]');
  }

  botonLogin() {
    return cy.get('button[type="submit"]');
  }

  alerta() {
    return cy.get('.oxd-alert-content-text');
  }

  erroresDeCampo() {
    return cy.get('.oxd-input-field-error-message');
  }

  ingresar(usuario, password) {
    if (usuario) this.usuario().type(usuario);
    // `log: false` evita que la contraseña quede escrita en el reporte.
    if (password) this.password().type(password, { log: false });
    this.botonLogin().click();
    return this;
  }
}

export const loginPage = new LoginPage();
