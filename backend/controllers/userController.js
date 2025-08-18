const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Importamos nuestro modelo de usuario
const generateToken = require('../utils/generateToken'); // Crearemos este archivo a continuación

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { cedula, nombre, nombreUsuario, email, password, tipoUsuario, pais, direccion, telefono } = req.body;

  // 1. Verificamos si el usuario ya existe por email o cédula
  const userExists = await User.findOne({ $or: [{ email }, { cedula }] });

  if (userExists) {
    res.status(400); // 400 = Bad Request
    throw new Error('El usuario con ese email o cédula ya existe');
  }

  // 2. Si no existe, creamos el nuevo usuario en la base de datos
  const user = await User.create({
    cedula,
    nombre,
    nombreUsuario,
    email,
    password, // La contraseña se cifra automáticamente gracias al middleware en el modelo
    tipoUsuario,
    pais,
    direccion,
    telefono,
    // Dejamos el nombreTienda vacío por ahora, se podría agregar en el perfil
  });

  // 3. Si el usuario se creó con éxito, le enviamos sus datos y un token
  if (user) {
    res.status(201).json({ // 201 = Created
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      token: generateToken(user._id), // Generamos un token para que inicie sesión automáticamente
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar (loguear) un usuario
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Buscamos al usuario por su email
  const user = await User.findOne({ email });

  // 2. Si encontramos al usuario Y la contraseña coincide (usando nuestro método `matchPassword`)
  if (user && (await user.matchPassword(password))) {
    // 3. Le enviamos sus datos y un nuevo token
    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // 401 = Unauthorized
    throw new Error('Email o contraseña inválidos');
  }
});

module.exports = { registerUser, loginUser };