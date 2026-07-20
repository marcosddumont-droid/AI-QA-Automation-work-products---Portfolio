export interface Cliente {
  nombre: string;
  apellido: string;
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  telefono: string;
  ssn: string;
  usuario: string;
  password: string;
}

/**
 * Genera un cliente con usuario irrepetible.
 *
 * ParaBank es una base compartida: si dos ejecuciones usaran el mismo usuario,
 * la segunda fallaría con "username already exists". El sufijo aleatorio además
 * del timestamp cubre el caso de dos workers arrancando en el mismo milisegundo.
 */
export function construirCliente(overrides: Partial<Cliente> = {}): Cliente {
  const unico = `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

  return {
    nombre: 'Marcos',
    apellido: `Test${unico}`,
    calle: 'Av. Siempre Viva 742',
    ciudad: 'Buenos Aires',
    provincia: 'BA',
    codigoPostal: 'B1900',
    telefono: '1155501234',
    ssn: '123-45-6789',
    usuario: `qa_${unico}`,
    password: 'Portfolio2026!',
    ...overrides,
  };
}

/** Usuario compartido de la demo. Solo para pruebas de lectura. */
export const usuarioDemo = { usuario: 'john', password: 'demo' };
