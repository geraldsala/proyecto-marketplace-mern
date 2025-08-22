const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');

/**
 * @desc    Middleware para proteger rutas (requiere token)
 * @route   N/A - Se usa en rutas que necesitan autenticación
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // El token se envía en los headers como "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Obtener el usuario del token y adjuntarlo al objeto 'req'
      // Excluimos la contraseña del objeto de usuario
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }

      next(); // Continuar a la siguiente función de middleware
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token fallido');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

/**
 * @desc    Middleware para autorizar rutas basadas en roles de usuario
 * @param   {...string} roles - Lista de roles permitidos (ej: 'admin', 'tienda')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Se asume que este middleware se ejecuta DESPUÉS de 'protect'
    if (!req.user || !roles.includes(req.user.tipoUsuario)) {
      res.status(403); // 403 Forbidden: El servidor entendió la solicitud, pero se niega a autorizarla.
      throw new Error(
        `El rol de usuario (${req.user.tipoUsuario}) no está autorizado para acceder a este recurso`
      );
    }
    next(); // El usuario tiene el rol correcto, continuar
  };
};

module.exports = { protect, authorize };