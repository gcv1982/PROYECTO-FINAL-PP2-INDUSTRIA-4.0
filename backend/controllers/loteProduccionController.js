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
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un lote con ese código' });
    }
    res.status(500).json({ error: 'Error al crear el lote de producción' });
  }
}

async function actualizar(req, res) {
  try {
    const { fecha_produccion, producto, cantidad_producida, unidad_medida, estado } = req.body;
    if (!fecha_produccion || !producto) {
      return res.status(400).json({ error: 'fecha_produccion y producto son obligatorios' });
    }
    if (estado && !['en_proceso', 'finalizado'].includes(estado)) {
      return res.status(400).json({ error: "estado debe ser 'en_proceso' o 'finalizado'" });
    }
    const actualizado = await loteModel.update(req.params.id, {
      fecha_produccion, producto, cantidad_producida, unidad_medida, estado: estado || 'en_proceso'
    });
    if (!actualizado) {
      return res.status(404).json({ error: 'Lote no encontrado o inactivo' });
    }
    res.json({ mensaje: 'Lote actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el lote' });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await loteModel.darDeBaja(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }
    res.json({ mensaje: 'Lote dado de baja correctamente (se conserva para trazabilidad)' });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja el lote' });
  }
}

module.exports = { listar, obtenerPorId, obtenerTrazabilidad, crear, actualizar, eliminar };
