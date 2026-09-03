
const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM LoteProduccion');
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM LoteProduccion WHERE id_lote_produccion = $1',
    [id]
  );
  return rows[0];
}

async function getConMateriasPrimas(id) {
  const lote = await pool.query(
    'SELECT * FROM LoteProduccion WHERE id_lote_produccion = $1',
    [id]
  );
  const materias = await pool.query(
    'SELECT * FROM MateriaPrima WHERE id_lote_produccion = $1',
    [id]
  );
  return { lote: lote.rows[0], materias_primas: materias.rows };
}

async function create({ codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable }) {
  const { rows } = await pool.query(
    `INSERT INTO LoteProduccion
     (codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_lote_produccion`,
    [codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable]
  );
  return rows[0].id_lote_produccion;
}

module.exports = { getAll, getById, getConMateriasPrimas, create };