# Documentación técnica — Sistema de Trazabilidad por QR (Helaspi)

Proyecto Final PP2 — Industria 4.0. Backend Node/Express + PostgreSQL, frontend React (Vite).

## 1. Instalación

### Requisitos
- Node.js 18+
- PostgreSQL 14+ (ver nota sobre el motor en la sección 6)

### Base de datos
```bash
# 1) Crear la base y las tablas
psql -U tu_usuario -d helaspi_trazabilidad -f backend/database.sql

# 2) Cargar el usuario semilla (necesario para el primer login:
#    crear usuarios requiere estar autenticado, así que sin esto no hay forma de entrar)
psql -U tu_usuario -d helaspi_trazabilidad -f backend/seed_usuario_inicial.sql
```
El usuario semilla queda en `admin@helaspi.com` / `helaspi2026`, rol `supervision`. Se recomienda darlo de baja una vez creados los usuarios reales.

### Backend
```bash
cd backend
npm install
# copiar .env.example a .env y completar los datos reales (ver sección 2)
npm start          # node server.js, puerto 3000 por defecto
```

### Frontend
```bash
cd frontend
npm install
# copiar .env.example a .env y completar la IP de la PC (ver sección 2)
npm start          # vite, puerto 5173 por defecto
# para probar desde el celular en la misma red: npm run dev -- --host
```

## 2. Variables de entorno

### `backend/.env`
| Variable | Descripción |
|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | Conexión a PostgreSQL |
| `PORT` | Puerto del servidor Express (por defecto 3000) |
| `JWT_SECRET` | Clave para firmar los tokens. Generar una propia y larga, nunca usar el valor de ejemplo |
| `JWT_EXPIRES_IN` | Vigencia del token (ej. `8h`) |

### `frontend/.env`
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (`http://IP_DE_LA_PC:3000/api`). Si se prueba solo en la misma PC alcanza con `http://localhost:3000/api`, pero para probar desde el celular en la misma red hace falta la IP de la PC (`ipconfig`), porque `localhost` en el celular es el propio celular |
| `VITE_APP_URL` | URL base del frontend, usada para armar el link que se codifica en el QR de cada materia prima |

Ninguno de los dos `.env` se sube al repositorio (`.gitignore`); sí se suben los `.env.example` correspondientes.

## 3. Endpoints de la API

Todas las rutas están bajo `/api`. Todas requieren JWT (`Authorization: Bearer <token>`) excepto `POST /auth/login`. Devuelven 401 sin token y 403 con un rol no autorizado.

### Autenticación
| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, usuario }` |

### Proveedores (`/proveedores`) — gestión: `calidad`, `supervision`
| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/` | cualquiera | solo `activo = true` |
| GET | `/:id` | cualquiera | |
| POST | `/` | calidad, supervision | `{ nombre, contacto, telefono }` |
| PUT | `/:id` | calidad, supervision | |
| DELETE | `/:id` | calidad, supervision | baja lógica |

### Materia Prima (`/materia-prima`) — gestión: `calidad`, `supervision`; asociar a lote: `logistica`, `supervision`
| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/` | cualquiera | |
| GET | `/:id` | cualquiera | |
| GET | `/:id/trazabilidad` | cualquiera | trazabilidad hacia adelante: MP → proveedor → lote |
| POST | `/` | calidad, supervision | `{ nombre, codigo_qr, fecha_ingreso, id_proveedor }` |
| PUT | `/:id` | calidad, supervision | 409 si la MP ya está `utilizada` (H3) |
| PUT | `/:id/asociar-lote` | logistica, supervision | 409 si la MP ya fue usada o el lote está finalizado (H2) |
| DELETE | `/:id` | calidad, supervision | baja lógica |

### Lotes de Producción (`/lotes-produccion`) — gestión: `logistica`, `supervision`
| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/` | cualquiera | |
| GET | `/:id` | cualquiera | |
| GET | `/:id/trazabilidad` | cualquiera | trazabilidad hacia atrás: lote → materias primas → proveedores |
| POST | `/` | logistica, supervision | `{ codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable }` |
| PUT | `/:id` | logistica, supervision | si no se envía `estado`, se conserva el actual (H4) |
| DELETE | `/:id` | logistica, supervision | baja lógica |

### Usuarios (`/usuarios`) — gestión: solo `supervision` (desde H1, S6)
| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/` | cualquiera | se usa para elegir el responsable al crear un lote |
| GET | `/:id` | cualquiera | |
| POST | `/` | supervision | `{ nombre, email, password, rol }`, hash con bcrypt |
| PUT | `/:id` | supervision | `{ nombre, email, rol }` |
| DELETE | `/:id` | supervision | baja lógica |

### Reportes (`/reportes`) — consulta: cualquier rol
| Método | Ruta | Query params | Notas |
|---|---|---|---|
| GET | `/resumen` | `desde`, `hasta` (fecha), `proveedor` (id) | 400 si las fechas son inválidas o `desde > hasta`. Devuelve `mp_registradas`, `mp_por_proveedor`, `lotes_por_estado`, `mp_por_estado` |

## 4. Modelo de datos

4 tablas en PostgreSQL (`backend/database.sql`):

- **Proveedor** (`id_proveedor` PK) — proveedores de materia prima.
- **Usuario** (`id_usuario` PK) — `rol` restringido por `CHECK` a `calidad` / `logistica` / `supervision`.
- **LoteProduccion** (`id_lote_produccion` PK) — `id_usuario_responsable` FK a Usuario. `estado`: `en_proceso` / `finalizado`.
- **MateriaPrima** (`id_materia_prima` PK) — `id_proveedor` FK a Proveedor, `id_lote_produccion` FK opcional a LoteProduccion (NULL hasta que se asocia). `estado`: `disponible` / `utilizada`.

Todas las tablas tienen `activo BOOLEAN DEFAULT TRUE`. No hay borrado físico: dar de baja es `UPDATE ... SET activo = false`, para no perder la trazabilidad de datos ya referenciados por otra tabla. Todas las consultas de listado filtran `WHERE activo = true`.

## 5. Plan de pruebas

### Colección de Postman (`tests/postman/`)
`Helaspi_S4_UpdateDelete.postman_collection.json` — 62 requests / 70 aserciones, corridas con Newman (CLI). Carpetas:
- `00` Preparación (login y usuarios de prueba)
- `01`–`04` Update/Delete de las 4 entidades
- `05` Hallazgos — casos que reproducen H1 a H5

Resultado por corrida (exportado como JSON en la misma carpeta):
| Corrida | Resultado |
|---|---|
| `resultados_s8.json` (antes de S9) | 67 passed / 3 failed (H3, H4, H5) |
| `resultados_s9.json` (después de S9) | **70 passed / 0 failed** |

### Escenario E2E (`tests/e2e/`)
`escenario_s6.mjs` (Playwright): recorre 8 pasos end-to-end en el navegador real (login, registrar MP, crear lote, asociar, intentar reasignar una MP usada, trazabilidad hacia adelante y hacia atrás, acceso denegado a `/usuarios` con un rol no autorizado). Genera una captura por paso en `evidencias/` y el resumen en `informe_s6.md`. Resultado de la última corrida: 8/8 OK.

### Hallazgos (H1–H6) — historial completo
| Hallazgo | Problema | Corregido en | Semana |
|---|---|---|---|
| H1 | Logística podía escalar su propio rol a Supervisión | `usuarioRoutes.js` → `verificarRol(['supervision'])` | S6 |
| H2 | Una MP ya utilizada podía reasignarse a otro lote | `materiaPrimaModel.asociarALote` (estado en el mismo UPDATE) | S6 |
| H6 | El endpoint de trazabilidad hacia adelante no existía | `materiaPrimaController.obtenerTrazabilidad` (nuevo) | S6 |
| H3 | Se podía editar el proveedor/QR de una MP ya utilizada | `materiaPrimaController.actualizar` (409 si `estado === 'utilizada'`) | S9 |
| H4 | Editar un lote sin enviar `estado` reabría un lote finalizado | `loteProduccionController.actualizar` (conserva el estado si no viene) | S9 |
| H5 | Un DELETE repetido devolvía 200 en vez de 404 | `darDeBaja` en las 4 entidades (`AND activo = true` en el WHERE) | S9 |

El detalle de cada corrección y las decisiones de diseño están en `docs/bitacora_IA_S6_H1_H2.md` y `docs/bitacora_IA_S9_Hallazgos.md`.

## 6. Nota sobre el motor de base de datos

El motor de base de datos es PostgreSQL; la guía original del TP indicaba MySQL. El cambio fue solicitado por el estudiante en S3 y autorizado por el docente.
