import { loginPage } from '../pages/LoginPage.js';

describe('Autenticación', () => {
  beforeEach(() => {
    loginPage.abrir();
  });

  it('TC-01 login con credenciales válidas lleva al dashboard @smoke', () => {
    loginPage.ingresar('Admin', 'admin123');

    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-topbar-header-breadcrumb-module').should('contain.text', 'Dashboard');
    cy.get('.oxd-userdropdown-name').should('be.visible');
  });

  it('TC-02 login con contraseña incorrecta muestra "Invalid credentials" @regression', () => {
    loginPage.ingresar('Admin', 'clave_incorrecta');

    loginPage.alerta().should('be.visible').and('contain.text', 'Invalid credentials');
    cy.url().should('include', '/auth/login');
  });

  it('TC-03 login con usuario inexistente muestra "Invalid credentials" @regression', () => {
    loginPage.ingresar('usuario_que_no_existe', 'admin123');

    loginPage.alerta().should('contain.text', 'Invalid credentials');
  });

  it('TC-04 enviar el formulario vacío exige ambos campos @regression', () => {
    loginPage.botonLogin().click();

    // Validación del lado del cliente: un mensaje por campo obligatorio.
    loginPage.erroresDeCampo().should('have.length', 2);
    loginPage.erroresDeCampo().first().should('contain.text', 'Required');
  });

  it('TC-05 enviar solo el usuario exige la contraseña @regression', () => {
    loginPage.usuario().type('Admin');
    loginPage.botonLogin().click();

    loginPage.erroresDeCampo().should('have.length', 1);
  });

  it('TC-06 la contraseña se enmascara en pantalla @regression', () => {
    loginPage.password().should('have.attr', 'type', 'password');
  });

  it('TC-07 una ruta protegida sin sesión redirige al login @smoke', () => {
    cy.clearCookies();
    cy.visit('/web/index.php/pim/viewEmployeeList');

    cy.url().should('include', '/auth/login');
  });

  it('TC-08 cerrar sesión invalida el acceso a rutas protegidas @regression', () => {
    loginPage.ingresar('Admin', 'admin123');
    cy.url().should('include', '/dashboard/index');

    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();

    cy.url().should('include', '/auth/login');

    // Y la sesión quedó realmente cerrada.
    cy.visit('/web/index.php/dashboard/index');
    cy.url().should('include', '/auth/login');
  });
});
