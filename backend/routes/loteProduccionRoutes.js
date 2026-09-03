const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteProduccionController');

router.get('/', loteController.listar);
router.get('/:id', loteController.obtenerPorId);
router.get('/:id/trazabilidad', loteController.obtenerTrazabilidad);
router.post('/', loteController.crear);

module.exports = router;
