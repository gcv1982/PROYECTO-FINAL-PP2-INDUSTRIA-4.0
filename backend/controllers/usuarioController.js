const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');

const SALT_ROUNDS = 10;
const ROLES_VALIDOS = ['calidad', 'logistica', 'supervision'];

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

async function crear(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        error: 'nombre, email, password y rol son obligatorios'
      });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `rol inválido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}` });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = await usuarioModel.create({ nombre, email, password_hash, rol });
    res.status(201).json({ id_usuario: id, nombre, email, rol });
  } catch (error) {
    // El email es UNIQUE en la BD; el código 23505 de Postgres indica violación de unicidad
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, email, rol } = req.body;
    if (!nombre || !email || !rol) {
      return res.status(400).json({ error: 'nombre, email y rol son obligatorios' });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `rol inválido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}` });
    }

    const actualizado = await usuarioModel.update(req.params.id, { nombre, email, rol });
    if (!actualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
    }
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await usuarioModel.darDeBaja(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario dado de baja correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de baja el usuario' });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
