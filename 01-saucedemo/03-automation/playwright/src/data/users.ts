export interface User {
  username: string;
  password: string;
  /** Comportamiento esperado del usuario en la app demo. */
  note: string;
}

export const PASSWORD = 'secret_sauce';

export const users = {
  standard: {
    username: 'standard_user',
    password: PASSWORD,
    note: 'Usuario feliz, sin defectos inyectados',
  },
  locked: {
    username: 'locked_out_user',
    password: PASSWORD,
    note: 'Bloqueado, debe rechazar el login',
  },
  problem: {
    username: 'problem_user',
    password: PASSWORD,
    note: 'Imágenes y formularios con defectos inyectados',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    note: 'Login degradado, útil para validar timeouts',
  },
} as const satisfies Record<string, User>;

export const invalidCredentials = [
  { username: '', password: PASSWORD, error: 'Username is required' },
  { username: 'standard_user', password: '', error: 'Password is required' },
  {
    username: 'usuario_inexistente',
    password: 'clave_incorrecta',
    error: 'Username and password do not match any user in this service',
  },
];
