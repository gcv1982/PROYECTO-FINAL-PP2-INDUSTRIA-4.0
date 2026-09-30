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

// H2 (S6): solo se asocia una MP activa y 'disponible'. La condición va en el mismo
// UPDATE para que dos asociaciones simultáneas no puedan reasignar la misma MP.
async function asociarALote(id_materia_prima, id_lote_produccion) {
  const result = await pool.query(
    `UPDATE MateriaPrima
     SET id_lote_produccion = $1, estado = 'utilizada'
     WHERE id_materia_prima = $2 AND activo = true AND estado = 'disponible'`,
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

// Trazabilidad hacia adelante (S6): materia prima -> proveedor de origen -> lote donde se utilizó
async function getTrazabilidad(id) {
  const { rows } = await pool.query(
    `SELECT mp.id_materia_prima, mp.nombre, mp.codigo_qr, mp.fecha_ingreso, mp.estado, mp.activo,
            p.id_proveedor, p.nombre AS proveedor_nombre,
            l.id_lote_produccion, l.codigo_lote, l.producto, l.fecha_produccion, l.estado AS lote_estado
     FROM MateriaPrima mp
     JOIN Proveedor p ON p.id_proveedor = mp.id_proveedor
     LEFT JOIN LoteProduccion l ON l.id_lote_produccion = mp.id_lote_produccion
     WHERE mp.id_materia_prima = $1`,
    [id]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    materia_prima: {
      id_materia_prima: r.id_materia_prima, nombre: r.nombre, codigo_qr: r.codigo_qr,
      fecha_ingreso: r.fecha_ingreso, estado: r.estado, activo: r.activo,
      proveedor: { id_proveedor: r.id_proveedor, nombre: r.proveedor_nombre }
    },
    lote: r.id_lote_produccion ? {
      id_lote_produccion: r.id_lote_produccion, codigo_lote: r.codigo_lote, producto: r.producto,
      fecha_produccion: r.fecha_produccion, estado: r.lote_estado
    } : null
  };
}

module.exports = { getAll, getById, create, update, asociarALote, darDeBaja, getTrazabilidad };
