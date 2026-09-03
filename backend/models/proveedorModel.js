
const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM Proveedor');
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM Proveedor WHERE id_proveedor = $1',
    [id]
  );
  return rows[0];
}

async function create({ nombre, contacto, telefono }) {
  const { rows } = await pool.query(
    `INSERT INTO Proveedor (nombre, contacto, telefono)
     VALUES ($1, $2, $3)
     RETURNING id_proveedor`,
    [nombre, contacto, telefono]
  );
  return rows[0].id_proveedor;
}

module.exports = { getAll, getById, create };