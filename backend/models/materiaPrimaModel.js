const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM MateriaPrima WHERE activo = true');
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM MateriaPrima WHERE id_materia_prima = $1',
    [id]
  );
  return rows[0];
}

async function create({ nombre, codigo_qr, fecha_ingreso, id_proveedor }) {
  const { rows } = await pool.query(
    `INSERT INTO MateriaPrima (nombre, codigo_qr, fecha_ingreso, id_proveedor)
     VALUES ($1, $2, $3, $4)
     RETURNING id_materia_prima`,
    [nombre, codigo_qr, fecha_ingreso, id_proveedor]
  );
  return rows[0].id_materia_prima;
}

async function update(id, { nombre, codigo_qr, fecha_ingreso, id_proveedor }) {
  const { rows } = await pool.query(
    `UPDATE MateriaPrima
     SET nombre = $1, codigo_qr = $2, fecha_ingreso = $3, id_proveedor = $4
     WHERE id_materia_prima = $5 AND activo = true
     RETURNING id_materia_prima`,
    [nombre, codigo_qr, fecha_ingreso, id_proveedor, id]
  );
  return rows[0];
}

async function asociarALote(id_materia_prima, id_lote_produccion) {
  const result = await pool.query(
    `UPDATE MateriaPrima
     SET id_lote_produccion = $1, estado = 'utilizada'
     WHERE id_materia_prima = $2 AND activo = true`,
    [id_lote_produccion, id_materia_prima]
  );
  return result.rowCount;
}

// Baja lógica: preserva la trazabilidad si esta materia prima ya fue asociada a un lote
async function darDeBaja(id) {
  const { rows } = await pool.query(
    `UPDATE MateriaPrima SET activo = false WHERE id_materia_prima = $1 RETURNING id_materia_prima`,
    [id]
  );
  return rows[0];
}

module.exports = { getAll, getById, create, update, asociarALote, darDeBaja };
