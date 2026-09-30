const materiaPrimaModel = require('../models/materiaPrimaModel');

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
    const filas = await materiaPrimaModel.asociarALote(req.params.id, id_lote_produccion);
    if (filas === 0) {
      return res.status(404).json({ error: 'Materia prima no encontrada o inactiva' });
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

module.exports = { listar, obtenerPorId, crear, actualizar, asociarALote, eliminar };
