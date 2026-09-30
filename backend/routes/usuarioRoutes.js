const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');

// S4: inicialmente solo se exigía estar autenticado para gestionar usuarios.
// S6 (30/09/2026): corregido tras el hallazgo H1 (escalada de privilegios detectada
// con la colección Postman: un usuario de Logística podía cambiarse el rol a Supervisión).
// La escritura de usuarios queda restringida a 'supervision'. Los GET siguen abiertos
// a usuarios autenticados (se usan para elegir el responsable al crear un lote).
router.get('/', verificarToken, usuarioController.listar);
router.get('/:id', verificarToken, usuarioController.obtenerPorId);
router.post('/', verificarToken, verificarRol(['supervision']), usuarioController.crear);
router.put('/:id', verificarToken, verificarRol(['supervision']), usuarioController.actualizar);
router.delete('/:id', verificarToken, verificarRol(['supervision']), usuarioController.eliminar);

module.exports = router;
