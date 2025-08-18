const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    cedula,
    nombre,
    nombreUsuario,
    email,
    password,
    tipoUsuario,
    pais,
    direccion,
    telefono,
    nombreTienda, // Este campo es clave para el registro de tiendas
  } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { cedula }] });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario con este correo o cédula ya existe');
  }

  const user = await User.create({
    cedula,
    nombre,
    nombreUsuario,
    email,
    password,
    tipoUsuario,
    pais,
    direccion,
    telefono,
    nombreTienda,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario no válidos');
  }
});

// @desc    Autenticar un usuario y obtener un token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña no válidos');
  }
});

module.exports = { registerUser, loginUser };