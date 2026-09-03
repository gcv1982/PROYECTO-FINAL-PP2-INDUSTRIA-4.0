const proveedorModel = require('../models/proveedorModel');

async function listar(req, res) {
  try {
    const proveedores = await proveedorModel.getAll();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const proveedor = await proveedorModel.getById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el proveedor' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, contacto, telefono } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const id = await proveedorModel.create({ nombre, contacto, telefono });
    res.status(201).json({ id_proveedor: id, nombre, contacto, telefono });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el proveedor' });
  }
}

module.exports = { listar, obtenerPorId, crear };
