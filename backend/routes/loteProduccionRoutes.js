const express = require('express');
const router = express.Router();
const loteController = require('../controllers/loteProduccionController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Consulta y trazabilidad: cualquier rol autenticado
router.get('/', verificarToken, loteController.listar);
router.get('/:id', verificarToken, loteController.obtenerPorId);
router.get('/:id/trazabilidad', verificarToken, loteController.obtenerTrazabilidad);

// Gestión de lotes: Logística y Supervisión
router.post('/', verificarToken, verificarRol(['logistica', 'supervision']), loteController.crear);
router.put('/:id', verificarToken, verificarRol(['logistica', 'supervision']), loteController.actualizar);
router.delete('/:id', verificarToken, verificarRol(['logistica', 'supervision']), loteController.eliminar);

module.exports = router;
