/**
 * Mock API local — objetivo de las pruebas de carga (k6 y JMeter).
 *
 * Existe para no generar carga contra los sitios demo, que son infraestructura
 * de terceros. Simula latencia variable y degradación bajo concurrencia, que es
 * lo que hace interesante una prueba de performance.
 *
 * Sin dependencias: corre con `node server.js`.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);

/** Latencia base por endpoint, en ms. */
const LATENCIA_BASE = {
  '/api/health': 2,
  '/api/products': 35,
  '/api/login': 60,
  '/api/orders': 80,
};

/** Cuántas requests hay en vuelo ahora mismo. */
let enVuelo = 0;
let totalAtendidas = 0;

/**
 * Degradación realista: a partir de cierta concurrencia la latencia crece.
 * Sin esto la prueba de carga daría una recta plana y no enseñaría nada.
 */
function calcularLatencia(base) {
  const UMBRAL_CONCURRENCIA = 20;
  const exceso = Math.max(0, enVuelo - UMBRAL_CONCURRENCIA);
  const penalizacion = exceso * 8;
  const jitter = Math.random() * 15;
  return base + penalizacion + jitter;
}

const PRODUCTOS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  nombre: `Producto ${i + 1}`,
  precio: Number((9.99 + i * 5).toFixed(2)),
  stock: (i * 7) % 40,
}));

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function leerBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null; // body inválido
  }
}

const server = createServer(async (req, res) => {
  enVuelo++;
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const ruta = url.pathname;

  try {
    await new Promise((r) => setTimeout(r, calcularLatencia(LATENCIA_BASE[ruta] ?? 20)));

    if (ruta === '/api/health') {
      return json(res, 200, { status: 'ok', enVuelo, totalAtendidas });
    }

    if (ruta === '/api/products' && req.method === 'GET') {
      const limite = Number(url.searchParams.get('limit') ?? 20);
      return json(res, 200, {
        total: PRODUCTOS.length,
        items: PRODUCTOS.slice(0, Math.min(limite, PRODUCTOS.length)),
      });
    }

    if (ruta === '/api/login' && req.method === 'POST') {
      const body = await leerBody(req);
      if (body === null) return json(res, 400, { error: 'JSON inválido' });
      if (body.usuario === 'demo' && body.password === 'demo123') {
        return json(res, 200, { token: `tok_${Math.random().toString(36).slice(2, 12)}` });
      }
      return json(res, 401, { error: 'Credenciales inválidas' });
    }

    if (ruta === '/api/orders' && req.method === 'POST') {
      const body = await leerBody(req);
      if (body === null) return json(res, 400, { error: 'JSON inválido' });
      if (!body.productoId || !body.cantidad) {
        return json(res, 422, { error: 'Faltan campos obligatorios: productoId, cantidad' });
      }
      return json(res, 201, {
        ordenId: Math.floor(Math.random() * 1_000_000),
        productoId: body.productoId,
        cantidad: body.cantidad,
        estado: 'confirmada',
      });
    }

    return json(res, 404, { error: 'Endpoint no encontrado' });
  } finally {
    enVuelo--;
    totalAtendidas++;
  }
});

server.listen(PORT, () => {
  console.log(`Mock API escuchando en http://localhost:${PORT}`);
  console.log('Endpoints: GET /api/health · GET /api/products · POST /api/login · POST /api/orders');
});
