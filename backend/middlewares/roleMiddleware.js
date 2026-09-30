// Middleware de autorización por rol.
// Uso: router.post('/', verificarToken, verificarRol(['calidad', 'supervision']), controller.crear)
// Debe usarse siempre DESPUÉS de verificarToken, porque depende de req.usuario.rol
function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Rol '${req.usuario.rol}' no autorizado para esta acción.`,
        roles_permitidos: rolesPermitidos
      });
    }

    next();
  };
}

module.exports = { verificarRol };
