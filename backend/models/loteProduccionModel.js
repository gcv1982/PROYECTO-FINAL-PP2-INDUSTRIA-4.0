const pool = require('../config/db');

async function getAll() {
  const { rows } = await pool.query('SELECT * FROM LoteProduccion WHERE activo = true');
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM LoteProduccion WHERE id_lote_produccion = $1',
    [id]
  );
  return rows[0];
}

// Trazabilidad hacia atrás: dado un lote, ver qué materias primas se usaron
// No se filtra por activo: la trazabilidad debe poder reconstruirse aunque el lote haya sido dado de baja
async function getConMateriasPrimas(id) {
  const lote = await pool.query(
    'SELECT * FROM LoteProduccion WHERE id_lote_produccion = $1',
    [id]
  );
  // S6: se incluye el proveedor de origen de cada materia prima (objetivo de la trazabilidad hacia atrás)
  const materias = await pool.query(
    `SELECT mp.*, p.nombre AS proveedor_nombre
     FROM MateriaPrima mp
     JOIN Proveedor p ON p.id_proveedor = mp.id_proveedor
     WHERE mp.id_lote_produccion = $1`,
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

async function update(id, { fecha_produccion, producto, cantidad_producida, unidad_medida, estado }) {
  const { rows } = await pool.query(
    `UPDATE LoteProduccion
     SET fecha_produccion = $1, producto = $2, cantidad_producida = $3, unidad_medida = $4, estado = $5
     WHERE id_lote_produccion = $6 AND activo = true
     RETURNING id_lote_produccion`,
    [fecha_produccion, producto, cantidad_producida, unidad_medida, estado, id]
  );
  return rows[0];
}

// Baja lógica: el lote permanece en la BD para no romper la trazabilidad de las materias primas ya asociadas
async function darDeBaja(id) {
  const { rows } = await pool.query(
    `UPDATE LoteProduccion SET activo = false WHERE id_lote_produccion = $1 AND activo = true RETURNING id_lote_produccion`,
    [id]
  );
  return rows[0];
}

module.exports = { getAll, getById, getConMateriasPrimas, create, update, darDeBaja };
