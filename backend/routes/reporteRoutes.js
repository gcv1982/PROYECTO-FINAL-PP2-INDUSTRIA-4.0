const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Consulta: cualquier rol autenticado (igual que el resto de las pantallas de consulta)
router.get('/resumen', verificarToken, reporteController.resumen);

module.exports = router;
