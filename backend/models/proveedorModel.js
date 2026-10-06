const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM Proveedor WHERE activo = true');
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

async function update(id, { nombre, contacto, telefono }) {
  const { rows } = await pool.query(
    `UPDATE Proveedor
     SET nombre = $1, contacto = $2, telefono = $3
     WHERE id_proveedor = $4 AND activo = true
     RETURNING id_proveedor`,
    [nombre, contacto, telefono, id]
  );
  return rows[0];
}

// Baja lógica: preserva la trazabilidad de materias primas ya asociadas a este proveedor
async function darDeBaja(id) {
  const { rows } = await pool.query(
    `UPDATE Proveedor SET activo = false WHERE id_proveedor = $1 AND activo = true RETURNING id_proveedor`,
    [id]
  );
  return rows[0];
}

module.exports = { getAll, getById, create, update, darDeBaja };
