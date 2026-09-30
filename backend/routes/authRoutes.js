const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Único endpoint público del sistema: sin verificarToken
router.post('/login', authController.login);

module.exports = router;
