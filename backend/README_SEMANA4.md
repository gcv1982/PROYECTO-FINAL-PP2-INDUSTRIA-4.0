# Semana 4 — Autenticación, Autorización por Roles y CRUD completo

## Qué se agregó sobre el backend de Semana 3

- **Autenticación JWT**: `POST /api/auth/login` (email + password) → devuelve token (expira en 8h).
- **Hash de contraseñas con bcrypt** (10 salt rounds) al crear usuarios.
- **Middleware `verificarToken`**: protege todas las rutas excepto `/api/auth/login`.
- **Middleware `verificarRol`**: autorización diferenciada según la matriz definida.
- **CRUD completo (Create, Read, Update, Delete)** en las 4 entidades — antes solo había Create + Read.
- **Baja lógica (`activo = false`)** en todas las entidades, en vez de borrado físico, para no romper la trazabilidad. Se agregó el campo `activo` a `LoteProduccion` y `MateriaPrima` (no lo tenían en S3).

## Matriz de autorización por rol

| Acción | Calidad | Logística | Supervisión |
|---|---|---|---|
| Proveedor: crear / editar / dar de baja | ✅ | ❌ | ✅ |
| MateriaPrima: crear / editar / dar de baja | ✅ | ❌ | ✅ |
| MateriaPrima: asociar a lote | ❌ | ✅ | ✅ |
| LoteProduccion: crear / editar / dar de baja | ❌ | ✅ | ✅ |
| Consultar (listar, ver detalle, trazabilidad) | ✅ | ✅ | ✅ |
| Usuario: gestionar (crear/editar/baja) | ✅ | ✅ | ✅ *(sin restricción de rol, decisión S4)* |

## Decisiones registradas esta semana (para tu bitácora de IA Responsable)

1. **Hasheo**: bcrypt (no bcryptjs) — decisión del estudiante.
2. **Expiración del token**: 8 horas — decisión del estudiante (jornada laboral).
3. **Matriz de permisos**: flexible, Supervisión con acceso amplio — decisión del estudiante.
4. **Delete = baja lógica en las 4 entidades** — decisión del estudiante, agrega campo `activo` a LoteProduccion y MateriaPrima.
5. **Gestión de Usuario sin restricción de rol adicional** — decisión del estudiante.
6. **PostgreSQL como motor**: elegido en S3; admitido entre las tecnologías base del proyecto (MySQL o PostgreSQL).

## Cómo aplicar los cambios de base de datos

Si tu base de datos de Semana 3 **ya existe**, corré:
```bash
psql -U tu_usuario -d helaspi_trazabilidad -f migracion_semana4.sql
```

Si estás creando la base **desde cero**, usá directamente el `database.sql` nuevo (ya incluye `activo` en las 4 tablas).

## Instalar dependencias nuevas

```bash
npm install
```
(agrega `bcrypt` y `jsonwebtoken` a lo que ya tenías)

## Configurar `.env`

Copiá `.env.example` a `.env` y completá tus datos reales de conexión, más un `JWT_SECRET` propio (una cadena larga y aleatoria — no dejes el valor de ejemplo).

## Probar con curl

**0. Cargar el usuario semilla** (resuelve el problema del "primer usuario": como crear usuarios requiere estar autenticado, no hay forma de loguearse la primera vez sin un usuario ya cargado):
```bash
psql -U tu_usuario -d helaspi_trazabilidad -f seed_usuario_inicial.sql
```
Crea `admin@helaspi.com` / `helaspi2026` con rol `supervision`. Usalo para el primer login y para crear el resto de los usuarios reales desde la API; después podés dar de baja este usuario semilla.

**1. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@helaspi.com","password":"helaspi2026"}'
```
Devuelve `{ "token": "...", "usuario": {...} }`.

**2. Usar el token en una ruta protegida:**
```bash
curl http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**3. Probar que un rol sin permiso sea rechazado (403):**
Logueado como `logistica`, intentar `POST /api/proveedores` debe devolver:
```json
{ "error": "Acceso denegado. Rol 'logistica' no autorizado para esta acción.", "roles_permitidos": ["calidad","supervision"] }
```

## Pendiente / riesgo abierto

- No hay endpoint de "registro" público — la creación de usuarios requiere estar autenticado, lo cual genera el problema del "primer usuario" mencionado arriba. Si el docente lo objeta, se puede resolver con un usuario semilla (seed) insertado directamente por SQL.
