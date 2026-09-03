const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtenerPorId);
router.post('/', usuarioController.crear);

module.exports = router;
