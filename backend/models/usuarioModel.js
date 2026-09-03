
const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query(
    'SELECT id_usuario, nombre, email, rol, activo FROM Usuario'
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

module.exports = { getAll, getById, getByEmail, create };