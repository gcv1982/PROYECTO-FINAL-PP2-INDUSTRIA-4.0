const express = require('express');
const router = express.Router();
const materiaPrimaController = require('../controllers/materiaPrimaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Consulta: cualquier rol autenticado
router.get('/', verificarToken, materiaPrimaController.listar);
router.get('/:id', verificarToken, materiaPrimaController.obtenerPorId);

// Registrar / editar / dar de baja materia prima: Calidad y Supervisión
router.post('/', verificarToken, verificarRol(['calidad', 'supervision']), materiaPrimaController.crear);
router.put('/:id', verificarToken, verificarRol(['calidad', 'supervision']), materiaPrimaController.actualizar);
router.delete('/:id', verificarToken, verificarRol(['calidad', 'supervision']), materiaPrimaController.eliminar);

// Asociar materia prima a un lote de producción: Logística y Supervisión
router.put('/:id/asociar-lote', verificarToken, verificarRol(['logistica', 'supervision']), materiaPrimaController.asociarALote);

module.exports = router;
