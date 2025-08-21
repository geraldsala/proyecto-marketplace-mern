// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('No autorizado, usuario no encontrado');
      }

      next();
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

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.tipoUsuario)) {
      res.status(403);
      throw new Error(
        `El rol de usuario (${req.user.tipoUsuario}) no está autorizado para acceder a este recurso`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };