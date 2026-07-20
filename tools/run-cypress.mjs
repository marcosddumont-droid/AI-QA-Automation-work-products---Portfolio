/**
 * Lanzador de Cypress para el portfolio.
 *
 * Existe por un motivo puntual: Electron (el navegador por defecto de Cypress)
 * levanta un proceso GPU que en equipos con políticas restrictivas y en CI
 * muere con ACCESS_DENIED y tumba la corrida entera:
 *
 *   [ERROR:gpu_process_host.cc] GPU process exited unexpectedly: exit_code=-1073741790
 *   [FATAL:gpu_data_manager_impl_private.cc] GPU process isn't usable. Goodbye.
 *
 * Los flags que lo desactivan solo se aceptan por la variable de entorno
 * ELECTRON_EXTRA_LAUNCH_ARGS, y tiene que estar definida antes de que arranque
 * el binario de Cypress. Ponerla desde cypress.config.js llega tarde, y
 * exportarla a mano no es reproducible.
 *
 * Uso: node tools/run-cypress.mjs [args extra para cypress]
 */
import { spawn } from 'node:child_process';

const FLAGS_GPU = [
  '--disable-gpu',
  '--disable-gpu-compositing',
  '--disable-software-rasterizer',
  '--in-process-gpu',
  '--disable-dev-shm-usage',
  // Sin este flag, `--in-process-gpu` hace crashear el proceso renderer con
  // "ERR_FAILED (-2) loading 'about:blank'". Los dos van juntos o ninguno.
  // Es la misma recomendación que da Cypress para correr dentro de Docker.
  '--no-sandbox',
];

const PROYECTO = '04-orangehrm/03-automation/cypress';

const entorno = {
  ...process.env,
  ELECTRON_EXTRA_LAUNCH_ARGS: [process.env.ELECTRON_EXTRA_LAUNCH_ARGS ?? '', ...FLAGS_GPU]
    .join(' ')
    .trim(),
};

const argumentosExtra = process.argv.slice(2);
const comando = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const hijo = spawn(comando, ['cypress', 'run', '--project', PROYECTO, ...argumentosExtra], {
  env: entorno,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

hijo.on('exit', (codigo) => process.exit(codigo ?? 1));
