# Mock API local

Objetivo de las pruebas de carga de todo el portfolio.

## Por qué existe

Los sitios demo (SauceDemo, ParaBank, OrangeHRM, Restful-Booker) son infraestructura de terceros. Correr un perfil de 50 usuarios virtuales contra ellos:

- degrada el servicio para el resto de la gente que los usa para aprender,
- suele terminar en bloqueo de IP,
- y es, lisa y llanamente, abusivo.

Por eso los **perfiles de carga reales** (ramp-up, stress, spike) apuntan acá. Contra las APIs demo solo se corren **smokes de 1-2 usuarios virtuales**, equivalentes a navegación normal.

## Qué simula

- **Latencia base por endpoint**, distinta en cada uno.
- **Degradación bajo concurrencia:** a partir de ~20 requests en vuelo la latencia empieza a crecer de forma proporcional. Sin esto, una prueba de carga daría una recta plana y no mostraría nada.
- **Jitter aleatorio**, para que los percentiles tengan sentido.

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/health` | `200` + requests en vuelo y total atendidas |
| GET | `/api/products?limit=N` | `200` + listado de productos |
| POST | `/api/login` | `200` + token · `401` si las credenciales fallan |
| POST | `/api/orders` | `201` + orden · `422` si faltan campos |

Credenciales válidas: `demo` / `demo123`

## Uso

```bash
node tools/mock-api/server.js
# Mock API escuchando en http://localhost:3001
```

Sin dependencias: solo Node.js. El puerto se cambia con `PORT=4000 node server.js`.
