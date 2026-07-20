import { test, expect } from '../../src/fixtures/test-fixtures.js';
import { construirCliente, usuarioDemo } from '../../src/data/cliente.js';

test.describe('Autenticación', () => {
  test('TC-01 registro de un cliente nuevo e inicio de sesión automático @smoke', async ({
    registerPage,
    accountsPage,
    page,
  }) => {
    const cliente = construirCliente();

    await registerPage.abrir();
    await registerPage.completarYEnviar(cliente);

    // El alta confirma en la misma página y deja la sesión abierta.
    await expect(registerPage.titulo).toContainText(`Welcome ${cliente.usuario}`);
    await expect(registerPage.mensajeBienvenida).toContainText(
      'Your account was created successfully',
    );
    // El panel lateral saluda con nombre y apellido, no con el usuario.
    await expect(page.locator('#leftPanel')).toContainText(
      `Welcome ${cliente.nombre} ${cliente.apellido}`,
    );

    // Y la sesión es real: se puede entrar al resumen sin volver a loguearse.
    await accountsPage.abrir();
    await expect(accountsPage.titulo).toContainText('Accounts Overview');
  });

  test('TC-02 el registro rechaza un usuario ya existente @regression', async ({
    registerPage,
  }) => {
    // 'john' es el usuario de la demo: siempre existe.
    const repetido = construirCliente({ usuario: 'john' });

    await registerPage.abrir();
    await registerPage.completarYEnviar(repetido);

    await expect(registerPage.erroresDeValidacion().first()).toContainText(
      'This username already exists',
    );
  });

  test('TC-03 el registro exige los campos obligatorios @regression', async ({
    registerPage,
    page,
  }) => {
    await registerPage.abrir();
    await registerPage.botonRegistrar.click();

    // El formulario valida campo por campo, no con un único mensaje global:
    // son 10 mensajes, uno por cada campo obligatorio.
    // La aserción reintenta porque el envío recarga la página.
    await expect(registerPage.erroresDeValidacion()).toHaveCount(10);
    await expect(page.locator('#rightPanel')).toContainText('First name is required');
    await expect(page.locator('#rightPanel')).toContainText('Password is required');
  });

  test('TC-04 login con credenciales válidas @smoke', async ({ loginPage, accountsPage }) => {
    await loginPage.abrir();
    await loginPage.ingresar(usuarioDemo.usuario, usuarioDemo.password);

    await expect(accountsPage.titulo).toContainText('Accounts Overview');
    await expect(accountsPage.tablaCuentas).toBeVisible();
  });

  test('TC-05 login con contraseña incorrecta @regression', async ({ loginPage, page }) => {
    await loginPage.abrir();
    await loginPage.ingresar(usuarioDemo.usuario, 'clave_incorrecta');

    await expect(loginPage.mensajeError).toBeVisible();
    await expect(loginPage.mensajeError).toContainText('could not be verified');
    await expect(page).not.toHaveURL(/overview\.htm/);
  });

  test('TC-06 login con campos vacíos @regression', async ({ loginPage }) => {
    await loginPage.abrir();
    await loginPage.ingresar('', '');

    await expect(loginPage.mensajeError).toBeVisible();
  });

  test('TC-07 cerrar sesión vuelve a la portada @regression', async ({
    loginPage,
    accountsPage,
    page,
  }) => {
    await loginPage.abrir();
    await loginPage.ingresar(usuarioDemo.usuario, usuarioDemo.password);
    await expect(accountsPage.titulo).toContainText('Accounts Overview');

    await accountsPage.salir();

    await expect(loginPage.botonLogin).toBeVisible();
    await expect(page).toHaveURL(/index\.htm/);
  });

  test('TC-08 la contraseña se enmascara en pantalla @regression', async ({ loginPage }) => {
    await loginPage.abrir();

    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });
});
