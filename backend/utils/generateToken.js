// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

// Nota: Esta es una función de ayuda que crea el token JWT.
// Le pasamos el ID del usuario como "payload" (la información dentro del token).
// El token expira en 30 días y usa un "secreto" para su firma.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;