const express = require('express');
const router = express.Router();
const materiaPrimaController = require('../controllers/materiaPrimaController');

router.get('/', materiaPrimaController.listar);
router.get('/:id', materiaPrimaController.obtenerPorId);
router.post('/', materiaPrimaController.crear);
router.put('/:id/asociar-lote', materiaPrimaController.asociarALote);

module.exports = router;
