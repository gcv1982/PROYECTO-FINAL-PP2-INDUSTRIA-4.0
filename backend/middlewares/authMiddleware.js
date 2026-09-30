const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Verifica que la request traiga un token JWT válido en el header Authorization.
// Formato esperado: Authorization: Bearer <token>
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    // Se adjunta el usuario decodificado a la request para uso en controllers/middlewares siguientes
    req.usuario = {
      id_usuario: payload.id_usuario,
      email: payload.email,
      rol: payload.rol
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'El token expiró, vuelva a iniciar sesión' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { verificarToken };
