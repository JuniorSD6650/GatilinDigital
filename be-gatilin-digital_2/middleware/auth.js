const jwt = require('jsonwebtoken');

// Middleware para proteger rutas
const protect = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado, token no encontrado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = protect;
