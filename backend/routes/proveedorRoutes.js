const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/', proveedorController.listar);
router.get('/:id', proveedorController.obtenerPorId);
router.post('/', proveedorController.crear);

module.exports = router;
