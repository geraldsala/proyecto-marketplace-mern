// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Nota: Esta función es un middleware que protege las rutas.
// Se ejecuta antes de que la petición llegue a la lógica de la ruta.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Verificar si hay un token en el header de la petición.
  // Un token JWT se envía en el header 'Authorization' con el formato 'Bearer TOKEN_AQUI'.
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Extraer el token.
      token = req.headers.authorization.split(' ')[1];

      // 3. Verificar el token usando la clave secreta.
      // Si el token es válido, nos devuelve el 'payload' (el ID del usuario).
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Buscar el usuario en la base de datos y adjuntarlo al objeto de la petición.
      // Así, todas las rutas protegidas tendrán acceso a 'req.user'.
      req.user = await User.findById(decoded.id).select('-password'); // '-password' para no incluir la contraseña

      next(); // Continuar con la siguiente función (la lógica de la ruta)
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('No autorizado, token fallido');
    }
  }

  // Si no hay un token, el usuario no está autorizado.
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }
});

module.exports = protect;