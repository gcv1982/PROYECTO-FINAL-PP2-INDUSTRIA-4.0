const usuarioModel = require('../models/usuarioModel');

async function listar(req, res) {
  try {
    const usuarios = await usuarioModel.getAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

async function obtenerPorId(req, res) {
  try {
    const usuario = await usuarioModel.getById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
}

// Nota: en la Semana 4 esto se reemplaza por un registro con bcrypt para el hash real.
async function crear(req, res) {
  try {
    const { nombre, email, password_hash, rol } = req.body;
    if (!nombre || !email || !password_hash || !rol) {
      return res.status(400).json({
        error: 'nombre, email, password_hash y rol son obligatorios'
      });
    }
    const id = await usuarioModel.create({ nombre, email, password_hash, rol });
    res.status(201).json({ id_usuario: id, nombre, email, rol });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

module.exports = { listar, obtenerPorId, crear };
