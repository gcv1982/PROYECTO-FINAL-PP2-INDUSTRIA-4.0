const reporteModel = require('../models/reporteModel');

function validarFechas(desde, hasta) {
  if (desde && isNaN(Date.parse(desde))) return 'El parámetro "desde" no es una fecha válida';
  if (hasta && isNaN(Date.parse(hasta))) return 'El parámetro "hasta" no es una fecha válida';
  if (desde && hasta && new Date(desde) > new Date(hasta)) {
    return 'El parámetro "desde" no puede ser posterior a "hasta"';
  }
  return null;
}

async function resumen(req, res) {
  const { desde, hasta, proveedor } = req.query;
  const errorFechas = validarFechas(desde, hasta);
  if (errorFechas) {
    return res.status(400).json({ error: errorFechas });
  }

  const filtros = { desde: desde || null, hasta: hasta || null, id_proveedor: proveedor || null };

  try {
    const [mpRegistradas, mpPorProveedor, lotesPorEstado, mpPorEstado] = await Promise.all([
      reporteModel.mpRegistradasPorPeriodo(filtros),
      reporteModel.mpPorProveedor(filtros),
      reporteModel.lotesPorEstado(filtros),
      reporteModel.mpUtilizadasVsDisponibles(filtros),
    ]);

    res.json({
      mp_registradas: mpRegistradas,
      mp_por_proveedor: mpPorProveedor,
      lotes_por_estado: lotesPorEstado,
      mp_por_estado: mpPorEstado,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el resumen de reportes' });
  }
}

module.exports = { resumen };
