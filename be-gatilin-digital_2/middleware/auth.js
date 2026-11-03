const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../lib/config');

const leerToken = (req) => {
  const authHeader = req.header('Authorization');
  return authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
};

const responder = (res, status, message) => res.status(status).json({ error: message, message });

// Exige un token válido
const protect = (req, res, next) => {
  const token = leerToken(req);
  if (!token) return responder(res, 401, 'Acceso no autorizado, token no encontrado.');
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return responder(res, 401, 'Token inválido o expirado.');
  }
};

// Exige token + uno de los roles indicados
const requireRole = (...roles) => (req, res, next) =>
  protect(req, res, () => {
    if (!roles.includes(req.user.role)) return responder(res, 403, 'No tienes permiso para realizar esta acción.');
    next();
  });

const requireAdmin = requireRole('admin');

// Si hay token válido lo decodifica; si no, continúa como público
const optionalAuth = (req, res, next) => {
  const token = leerToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch {
      req.user = undefined;
    }
  }
  next();
};

const isAdmin = (req) => req.user?.role === 'admin';

module.exports = protect;
module.exports.protect = protect;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireAdmin;
module.exports.optionalAuth = optionalAuth;
module.exports.isAdmin = isAdmin;
