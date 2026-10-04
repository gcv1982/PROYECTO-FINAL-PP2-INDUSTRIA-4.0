const pool = require('../config/db');

function construirFiltros({ desde, hasta, id_proveedor }, columnaFecha, alias = '') {
  const prefijo = alias ? `${alias}.` : '';
  const cond = [`${prefijo}activo = true`];
  const params = [];
  if (desde) {
    params.push(desde);
    cond.push(`${prefijo}${columnaFecha} >= $${params.length}`);
  }
  if (hasta) {
    params.push(hasta);
    cond.push(`${prefijo}${columnaFecha} <= $${params.length}`);
  }
  if (id_proveedor) {
    params.push(id_proveedor);
    cond.push(`${prefijo}id_proveedor = $${params.length}`);
  }
  return { where: cond.join(' AND '), params };
}

async function mpRegistradasPorPeriodo(filtros) {
  const { where, params } = construirFiltros(filtros, 'fecha_ingreso');
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM MateriaPrima WHERE ${where}`,
    params
  );
  return rows[0].total;
}

async function mpPorProveedor(filtros) {
  const { where, params } = construirFiltros(filtros, 'fecha_ingreso', 'mp');
  const { rows } = await pool.query(
    `SELECT p.nombre AS proveedor, COUNT(*)::int AS total
     FROM MateriaPrima mp
     JOIN Proveedor p ON p.id_proveedor = mp.id_proveedor
     WHERE ${where}
     GROUP BY p.nombre
     ORDER BY total DESC`,
    params
  );
  return rows;
}

async function lotesPorEstado({ desde, hasta }) {
  const cond = ['activo = true'];
  const params = [];
  if (desde) {
    params.push(desde);
    cond.push(`fecha_produccion >= $${params.length}`);
  }
  if (hasta) {
    params.push(hasta);
    cond.push(`fecha_produccion <= $${params.length}`);
  }
  const { rows } = await pool.query(
    `SELECT estado, COUNT(*)::int AS total
     FROM LoteProduccion
     WHERE ${cond.join(' AND ')}
     GROUP BY estado`,
    params
  );
  return rows;
}

async function mpUtilizadasVsDisponibles(filtros) {
  const { where, params } = construirFiltros(filtros, 'fecha_ingreso');
  const { rows } = await pool.query(
    `SELECT estado, COUNT(*)::int AS total
     FROM MateriaPrima
     WHERE ${where}
     GROUP BY estado`,
    params
  );
  return rows;
}

module.exports = { mpRegistradasPorPeriodo, mpPorProveedor, lotesPorEstado, mpUtilizadasVsDisponibles };
