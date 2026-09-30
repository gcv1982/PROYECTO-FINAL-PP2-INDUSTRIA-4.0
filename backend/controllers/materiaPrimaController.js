const materiaPrimaModel = require('../models/materiaPrimaModel');
const loteModel = require('../models/loteProduccionModel');

async function listar(req, res) {
  try {
    const materias = await materiaPrimaModel.getAll();
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias primas' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const materia = await materiaPrimaModel.getById(req.params.id);
    if (!materia) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json(materia);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la materia prima' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, codigo_qr, fecha_ingreso, id_proveedor } = req.body;
    if (!nombre || !fecha_ingreso || !id_proveedor) {
      return res.status(400).json({
        error: 'nombre, fecha_ingreso e id_proveedor son obligatorios'
      });
    }
    const id = await materiaPrimaModel.create({
      nombre, codigo_qr, fecha_ingreso, id_proveedor
    });
    res.status(201).json({ id_materia_prima: id, nombre, estado: 'disponible' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la materia prima' });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, codigo_qr, fecha_ingreso, id_proveedor } = req.body;
    if (!nombre || !fecha_ingreso || !id_proveedor) {
      return res.status(400).json({
        error: 'nombre, fecha_ingreso e id_proveedor son obligatorios'
      });
    }
    const actualizado = await materiaPrimaModel.update(req.params.id, {
      nombre, codigo_qr, fecha_ingreso, id_proveedor
    });
    if (!actualizado) {
      return res.status(404).json({ error: 'Materia prima no encontrada o inactiva' });
    }
    res.json({ mensaje: 'Materia prima actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la materia prima' });
  }
}

async function asociarALote(req, res) {
  try {
    const { id_lote_produccion } = req.body;
    if (!id_lote_produccion) {
      return res.status(400).json({ error: 'id_lote_produccion es obligatorio' });
    }

    // H2 (S6): una MP ya utilizada no puede reasignarse a otro lote,
    // porque se perdería la trazabilidad hacia atrás del lote original.
    const materia = await materiaPrimaModel.getById(req.params.id);
    if (!materia || !materia.activo) {
      return res.status(404).json({ error: 'Materia prima no encontrada o inactiva' });
    }
    if (materia.estado !== 'disponible') {
      return res.status(409).json({
        error: 'La materia prima ya fue utilizada en otro lote y no puede reasignarse',
        id_lote_actual: materia.id_lote_produccion
      });
    }

    const lote = await loteModel.getById(id_lote_produccion);
    if (!lote || !lote.activo) {
      return res.status(404).json({ error: 'Lote de producción no encontrado o inactivo' });
    }
    if (lote.estado === 'finalizado') {
      return res.status(409).json({ error: 'No se puede asociar materia prima a un lote finalizado' });
    }

    const filas = await materiaPrimaModel.asociarALote(req.params.id, id_lote_produccion);
    if (filas === 0) {
      // Otra operación la asoció entre la verificación y el UPDATE
      return res.status(409).json({ error: 'La materia prima ya no está disponible' });
    }
    res.json({ mensaje: 'Materia prima asociada al lote correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al asociar la materia prima al lote' });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await materiaPrimaModel.darDeBaja(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json({ mensaje: 'Materia prima dada de baja correctamente (se conserva para trazabilidad)' });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja la materia prima' });
  }
}

// Trazabilidad hacia adelante (S6): la pantalla ya la consumía, pero el endpoint no existía
async function obtenerTrazabilidad(req, res) {
  try {
    const resultado = await materiaPrimaModel.getTrazabilidad(req.params.id);
    if (!resultado) {
      return res.status(404).json({ error: 'Materia prima no encontrada' });
    }
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la trazabilidad de la materia prima' });
  }
}

module.exports = { listar, obtenerPorId, obtenerTrazabilidad, crear, actualizar, asociarALote, eliminar };
