const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// Consulta: cualquier rol autenticado
router.get('/', verificarToken, proveedorController.listar);
router.get('/:id', verificarToken, proveedorController.obtenerPorId);

// Gestión: solo Calidad y Supervisión (matriz de permisos definida en S4)
router.post('/', verificarToken, verificarRol(['calidad', 'supervision']), proveedorController.crear);
router.put('/:id', verificarToken, verificarRol(['calidad', 'supervision']), proveedorController.actualizar);
router.delete('/:id', verificarToken, verificarRol(['calidad', 'supervision']), proveedorController.eliminar);

module.exports = router;
