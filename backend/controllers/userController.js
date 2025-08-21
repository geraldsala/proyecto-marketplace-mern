const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { cedula, nombre, nombreUsuario, email, password, tipoUsuario, pais, direccion, telefono, nombreTienda } = req.body;
  const userExists = await User.findOne({ $or: [{ email }, { cedula }] });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario con ese email o cédula ya existe');
  }

  const user = await User.create({
    cedula, nombre, nombreUsuario, email, password, tipoUsuario, pais, direccion, telefono, nombreTienda
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
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Autenticar (loguear) un usuario
// @route   POST /api/users/login
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
    throw new Error('Email o contraseña inválidos');
  }
});

// --- NUEVAS FUNCIONES AÑADIDAS ---

// @desc    Obtener el perfil del usuario autenticado
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      direccionesEnvio: user.direccionesEnvio,
      formasPago: user.formasPago,
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Actualizar el perfil del usuario (datos básicos)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.nombre = req.body.nombre || user.nombre;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      tipoUsuario: updatedUser.tipoUsuario,
      token: generateToken(updatedUser._id), // Se genera un nuevo token con la info actualizada
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

// @desc    Añadir una nueva dirección de envío
// @route   POST /api/users/addresses
// @access  Private/Comprador
const addShippingAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { pais, provincia, casillero, codigoPostal, observaciones } = req.body;
        const newAddress = { pais, provincia, casillero, codigoPostal, observaciones };
        user.direccionesEnvio.push(newAddress);
        await user.save();
        res.status(201).json(user.direccionesEnvio);
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

// @desc    Eliminar una dirección de envío
// @route   DELETE /api/users/addresses/:addressId
// @access  Private/Comprador
const deleteShippingAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.direccionesEnvio = user.direccionesEnvio.filter(
            (address) => address._id.toString() !== req.params.addressId
        );
        await user.save();
        res.json(user.direccionesEnvio);
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addShippingAddress,
  deleteShippingAddress
};