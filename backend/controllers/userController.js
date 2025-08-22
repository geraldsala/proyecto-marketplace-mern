// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

// ====== Auth existentes ======
const authUser = asyncHandler(async (req, res) => {
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

const registerUser = asyncHandler(async (req, res) => {
  const { nombre, email, password, tipoUsuario } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({ nombre, email, password, tipoUsuario });

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

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  res.json(user);
});

// ====== NUEVO: Direcciones ======
const addShippingAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const {
    nombre, receptor, telefono, provincia, canton, distrito, direccion, zip, isDefault
  } = req.body;

  if (!nombre || !receptor || !telefono || !provincia || !canton || !distrito || !direccion) {
    res.status(400);
    throw new Error('Faltan campos requeridos de la dirección');
  }

  const willBeDefault = isDefault || user.addresses.length === 0;
  if (willBeDefault) user.addresses.forEach(a => (a.isDefault = false));

  user.addresses.push({
    nombre, receptor, telefono, provincia, canton, distrito, direccion, zip,
    isDefault: willBeDefault
  });

  await user.save();
  const newAddress = user.addresses[user.addresses.length - 1];
  res.status(201).json(newAddress);
});

const deleteShippingAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const idx = user.addresses.findIndex(a => String(a._id) === String(addressId));
  if (idx === -1) { res.status(404); throw new Error('Dirección no encontrada'); }

  const wasDefault = user.addresses[idx].isDefault;
  user.addresses.splice(idx, 1);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json({ message: 'Dirección eliminada' });
});

// ====== NUEVO: Métodos de pago ======
const addPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const { brand, last4, holderName, expMonth, expYear, providerId, isDefault } = req.body;
  if (!brand || !last4 || !holderName || !expMonth || !expYear) {
    res.status(400);
    throw new Error('Faltan campos requeridos del método de pago');
  }

  const willBeDefault = isDefault || user.paymentMethods.length === 0;
  if (willBeDefault) user.paymentMethods.forEach(m => (m.isDefault = false));

  user.paymentMethods.push({
    brand, last4, holderName, expMonth, expYear, providerId, isDefault: willBeDefault
  });

  await user.save();
  const newMethod = user.paymentMethods[user.paymentMethods.length - 1];
  res.status(201).json(newMethod);
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const idx = user.paymentMethods.findIndex(m => String(m._id) === String(methodId));
  if (idx === -1) { res.status(404); throw new Error('Método de pago no encontrado'); }

  const wasDefault = user.paymentMethods[idx].isDefault;
  user.paymentMethods.splice(idx, 1);

  if (wasDefault && user.paymentMethods.length > 0) {
    user.paymentMethods[0].isDefault = true;
  }

  await user.save();
  res.json({ message: 'Método de pago eliminado' });
});

module.exports = {
  // existentes
  authUser,
  registerUser,
  getUserProfile,

  // nuevos
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
};
