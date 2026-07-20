import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aquí = dirname(fileURLToPath(import.meta.url));

/**
 * The Internet (Sauce Labs) reúne los escenarios que rompen frameworks de
 * automatización mal usados: iframes, ventanas nuevas, alerts nativos,
 * carga diferida, drag & drop y autenticación básica.
 *
 * El valor de esta suite no es la cobertura funcional, sino demostrar cómo se
 * resuelve cada mecanismo sin recurrir a esperas fijas.
 */

test.describe('Carga diferida y sincronización', () => {
  test('TC-01 elemento que aparece tras una demora @smoke', async ({ page }) => {
    await page.goto('/dynamic_loading/1');
    await page.getByRole('button', { name: 'Start' }).click();

    // Sin sleep: la aserción reintenta hasta que el elemento se vuelve visible.
    await expect(page.locator('#finish')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#finish')).toHaveText('Hello World!');
  });

  test('TC-02 elemento que se crea recién al terminar la carga @regression', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.getByRole('button', { name: 'Start' }).click();

    // Caso distinto al anterior: el nodo no existe en el DOM hasta el final.
    await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 15_000 });
  });

  test('TC-03 contenido que cambia en cada recarga @regression', async ({ page }) => {
    await page.goto('/dynamic_content');
    const primero = await page.locator('#content .large-10').allInnerTexts();

    await page.reload();
    const segundo = await page.locator('#content .large-10').allInnerTexts();

    // El contenido es aleatorio: se afirma la estructura, no el texto concreto.
    // Tampoco se fija el número exacto de filas, que es un detalle de la página.
    expect(primero.length).toBeGreaterThan(0);
    expect(segundo).toHaveLength(primero.length);
  });
});

test.describe('Frames', () => {
  test('TC-10 escribir dentro de un iframe @smoke', async ({ page }) => {
    // Fallo esperado: el editor TinyMCE quedó en modo solo lectura.
    // Defecto real de la aplicación, documentado en 04-execution → BUG-101.
    // Cuando se corrija, se quita este marcador y el test valida por la vía normal.
    test.fail(true, 'BUG-101: el editor TinyMCE está en modo solo lectura');

    await page.goto('/iframe');

    // El iframe arranca en about:blank y TinyMCE lo puebla después: hay que
    // esperar a que el body editable exista antes de interactuar.
    const editor = page.frameLocator('#mce_0_ifr').locator('body#tinymce');
    await expect(editor).toBeVisible({ timeout: 20_000 });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('Texto escrito dentro del iframe');

    await expect(editor).toContainText('Texto escrito dentro del iframe');
  });

  test('TC-11 frames anidados: leer cada uno @regression', async ({ page }) => {
    await page.goto('/nested_frames');

    const izquierdo = page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-left"]');
    const central = page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-middle"]');
    const inferior = page.frameLocator('frame[name="frame-bottom"]');

    await expect(izquierdo.locator('body')).toContainText('LEFT');
    await expect(central.locator('body')).toContainText('MIDDLE');
    await expect(inferior.locator('body')).toContainText('BOTTOM');
  });
});

test.describe('Diálogos nativos del navegador', () => {
  test('TC-20 aceptar un alert simple @smoke', async ({ page }) => {
    await page.goto('/javascript_alerts');

    // El handler se registra ANTES de disparar el diálogo: si se registra
    // después, la ejecución queda bloqueada.
    page.once('dialog', (dialog) => {
      expect(dialog.type()).toBe('alert');
      void dialog.accept();
    });
    await page.getByRole('button', { name: 'Click for JS Alert' }).click();

    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
  });

  test('TC-21 cancelar un confirm @regression', async ({ page }) => {
    await page.goto('/javascript_alerts');

    page.once('dialog', (dialog) => void dialog.dismiss());
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
  });

  test('TC-22 completar un prompt con texto @regression', async ({ page }) => {
    await page.goto('/javascript_alerts');

    page.once('dialog', (dialog) => void dialog.accept('texto de prueba'));
    await page.getByRole('button', { name: 'Click for JS Prompt' }).click();

    await expect(page.locator('#result')).toHaveText('You entered: texto de prueba');
  });
});

test.describe('Ventanas y navegación', () => {
  test('TC-30 una pestaña nueva se captura con el evento popup @smoke', async ({ page, context }) => {
    await page.goto('/windows');

    const [nuevaPestaña] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Click Here' }).click(),
    ]);

    await nuevaPestaña.waitForLoadState();
    await expect(nuevaPestaña.locator('h3')).toHaveText('New Window');

    // La pestaña original sigue accesible.
    await expect(page.locator('h3')).toHaveText('Opening a new window');
  });
});

test.describe('Autenticación', () => {
  test('TC-40 autenticación básica con credenciales en el contexto @smoke', async ({ browser }) => {
    const contexto = await browser.newContext({
      httpCredentials: { username: 'admin', password: 'admin' },
    });
    const pagina = await contexto.newPage();

    await pagina.goto('https://the-internet.herokuapp.com/basic_auth');

    await expect(pagina.locator('p')).toContainText('Congratulations');
    await contexto.close();
  });

  test('TC-41 login con credenciales válidas @smoke', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('tomsmith');
    await page.locator('#password').fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('#flash')).toContainText('You logged into a secure area');
    await expect(page).toHaveURL(/secure/);
  });

  test('TC-42 login con contraseña incorrecta @regression', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('tomsmith');
    await page.locator('#password').fill('clave_incorrecta');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('#flash')).toContainText('Your password is invalid');
    await expect(page).not.toHaveURL(/secure/);
  });
});

test.describe('Interacciones complejas', () => {
  test('TC-50 subir un archivo @smoke', async ({ page }) => {
    await page.goto('/upload');

    const archivo = join(aquí, '..', 'fixtures', 'archivo-de-prueba.txt');
    await page.locator('#file-upload').setInputFiles(archivo);
    await page.locator('#file-submit').click();

    await expect(page.locator('h3')).toHaveText('File Uploaded!');
    await expect(page.locator('#uploaded-files')).toHaveText('archivo-de-prueba.txt');
  });

  test('TC-51 menú contextual dispara un alert @regression', async ({ page }) => {
    await page.goto('/context_menu');

    page.once('dialog', (dialog) => {
      expect(dialog.message()).toBe('You selected a context menu');
      void dialog.accept();
    });
    await page.locator('#hot-spot').click({ button: 'right' });
  });

  test('TC-52 tabla ordenable: ordenar por columna @regression', async ({ page }) => {
    await page.goto('/tables');

    await page.locator('#table1 thead th').filter({ hasText: 'Last Name' }).click();

    const apellidos = await page.locator('#table1 tbody tr td:first-child').allInnerTexts();
    const ordenados = [...apellidos].sort((a, b) => a.localeCompare(b));
    expect(apellidos).toEqual(ordenados);
  });

  test('TC-53 hover revela información oculta @regression', async ({ page }) => {
    await page.goto('/hovers');

    const primeraFigura = page.locator('.figure').first();
    await primeraFigura.hover();

    await expect(primeraFigura.locator('.figcaption')).toBeVisible();
    await expect(primeraFigura.locator('h5')).toHaveText('name: user1');
  });
});

test.describe('Respuestas del servidor', () => {
  test('TC-60 códigos de estado HTTP @regression', async ({ page }) => {
    // Verificado contra el servidor: el 301 NO se sigue automáticamente,
    // devuelve el código tal cual. Cada ruta responde su propio estado.
    for (const codigo of [200, 301, 404, 500]) {
      const respuesta = await page.goto(`/status_codes/${codigo}`);
      expect(respuesta?.status(), `la ruta /status_codes/${codigo}`).toBe(codigo);
    }
  });

  test('TC-61 descarga de archivo disponible @regression', async ({ page }) => {
    await page.goto('/download');

    const enlaces = page.locator('.example a');
    expect(await enlaces.count()).toBeGreaterThan(0);
  });
});
