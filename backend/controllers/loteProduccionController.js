const loteModel = require('../models/loteProduccionModel');

async function listar(req, res) {
  try {
    const lotes = await loteModel.getAll();
    res.json(lotes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lotes de producción' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const lote = await loteModel.getById(req.params.id);
    if (!lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }
    res.json(lote);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el lote' });
  }
}

// Trazabilidad hacia atrás: dado un lote, ver qué materias primas se usaron
async function obtenerTrazabilidad(req, res) {
  try {
    const resultado = await loteModel.getConMateriasPrimas(req.params.id);
    if (!resultado.lote) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la trazabilidad del lote' });
  }
}

async function crear(req, res) {
  try {
    const { codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable } = req.body;
    if (!codigo_lote || !fecha_produccion || !producto || !id_usuario_responsable) {
      return res.status(400).json({
        error: 'codigo_lote, fecha_produccion, producto e id_usuario_responsable son obligatorios'
      });
    }
    const id = await loteModel.create({
      codigo_lote, fecha_produccion, producto, cantidad_producida, unidad_medida, id_usuario_responsable
    });
    res.status(201).json({ id_lote_produccion: id, codigo_lote, estado: 'en_proceso' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el lote de producción' });
  }
}

module.exports = { listar, obtenerPorId, obtenerTrazabilidad, crear };
