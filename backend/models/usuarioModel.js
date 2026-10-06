const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query(
    'SELECT id_usuario, nombre, email, rol, activo FROM Usuario WHERE activo = true'
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT id_usuario, nombre, email, rol, activo FROM Usuario WHERE id_usuario = $1',
    [id]
  );
  return rows[0];
}

// Se usa exclusivamente para login: sí necesita el password_hash
async function getByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM Usuario WHERE email = $1',
    [email]
  );
  return rows[0];
}

async function create({ nombre, email, password_hash, rol }) {
  const { rows } = await pool.query(
    `INSERT INTO Usuario (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id_usuario`,
    [nombre, email, password_hash, rol]
  );
  return rows[0].id_usuario;
}

async function update(id, { nombre, email, rol }) {
  const { rows } = await pool.query(
    `UPDATE Usuario
     SET nombre = $1, email = $2, rol = $3
     WHERE id_usuario = $4 AND activo = true
     RETURNING id_usuario`,
    [nombre, email, rol, id]
  );
  return rows[0];
}

// Baja lógica: no se borra la fila, se marca activo = false (preserva trazabilidad)
async function darDeBaja(id) {
  const { rows } = await pool.query(
    `UPDATE Usuario SET activo = false WHERE id_usuario = $1 AND activo = true RETURNING id_usuario`,
    [id]
  );
  return rows[0];
}

module.exports = { getAll, getById, getByEmail, create, update, darDeBaja };
