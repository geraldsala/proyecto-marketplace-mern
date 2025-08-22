// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');
const { luhnCheck } = require('../utils/validation.js');

/**
 * POST /api/users/login
 * Autenticar usuario y obtener token
 */
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

/**
 * POST /api/users/register
 * Registrar un nuevo usuario
 */
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

/**
 * GET /api/users/profile
 * Obtener perfil de usuario (con compatibilidad de campos antiguos)
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const u = user.toObject();

  // Normaliza arrays inexistentes a []
  if (!Array.isArray(u.addresses)) u.addresses = [];
  if (!Array.isArray(u.paymentMethods)) u.paymentMethods = [];
  if (!Array.isArray(u.direccionesEnvio)) u.direccionesEnvio = [];
  if (!Array.isArray(u.formasPago)) u.formasPago = [];

  // Backfill para compatibilidad
  if (u.addresses.length === 0 && u.direccionesEnvio.length > 0) {
    u.addresses = u.direccionesEnvio;
  }
  if (u.paymentMethods.length === 0 && u.formasPago.length > 0) {
    u.paymentMethods = u.formasPago;
  }

  res.json(u);
});

/**
 * POST /api/users/addresses
 * Agregar dirección de envío (acepta campos del formulario actual)
 */
const addShippingAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  // Asegura arrays
  if (!Array.isArray(user.addresses)) user.addresses = [];
  if (!Array.isArray(user.direccionesEnvio)) user.direccionesEnvio = [];

  const {
    titulo,
    pais,
    provincia,
    direccion,
    casillero,
    codigoPostal,
    observaciones,
    isDefault
  } = req.body;

  const direccionFinal = direccion || casillero;
  if (!provincia || !direccionFinal) {
    res.status(400);
    throw new Error('Faltan campos requeridos de la dirección');
  }

  const totalPrevio = (user.addresses?.length || 0) + (user.direccionesEnvio?.length || 0);
  const willBeDefault = !!isDefault || totalPrevio === 0;

  if (willBeDefault) {
    (user.addresses || []).forEach(a => (a.isDefault = false));
    (user.direccionesEnvio || []).forEach(a => (a.isDefault = false));
  }

  const doc = {
    nombre: titulo || 'Principal',
    receptor: user.nombre || '',
    telefono: user.telefono || '',
    pais: pais || user.pais || '',
    provincia,
    canton: '',
    distrito: '',
    direccion: direccionFinal,
    zip: codigoPostal || '',
    observaciones: observaciones || '',
    isDefault: willBeDefault
  };

  user.addresses.push(doc);
  user.direccionesEnvio.push(doc);

  await user.save();
  return res.status(201).json({ addresses: user.addresses });
});

/**
 * DELETE /api/users/addresses/:addressId
 * Eliminar dirección de envío (borra en ambos arrays; re-asigna default si aplica)
 */
const deleteShippingAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  if (!Array.isArray(user.addresses)) user.addresses = [];
  if (!Array.isArray(user.direccionesEnvio)) user.direccionesEnvio = [];

  let idxNew = user.addresses.findIndex(a => String(a._id) === String(addressId));
  let idxOld = user.direccionesEnvio.findIndex(a => String(a._id) === String(addressId));

  if (idxNew === -1 && idxOld !== -1) {
    const target = user.direccionesEnvio[idxOld];
    idxNew = user.addresses.findIndex(a => a.direccion === target.direccion && a.provincia === target.provincia);
  }
  if (idxOld === -1 && idxNew !== -1) {
    const target = user.addresses[idxNew];
    idxOld = user.direccionesEnvio.findIndex(a => a.direccion === target.direccion && a.provincia === target.provincia);
  }

  const wasDefault =
    (idxNew !== -1 && user.addresses[idxNew]?.isDefault) ||
    (idxOld !== -1 && user.direccionesEnvio[idxOld]?.isDefault);

  if (idxNew !== -1) user.addresses.splice(idxNew, 1);
  if (idxOld !== -1) user.direccionesEnvio.splice(idxOld, 1);

  if (wasDefault) {
    if (user.addresses.length > 0) user.addresses[0].isDefault = true;
    if (user.direccionesEnvio.length > 0) user.direccionesEnvio[0].isDefault = true;
  }

  await user.save();
  return res.json({ addresses: user.addresses });
});

/**
 * POST /api/users/paymentmethods
 * Agregar método de pago, VALIDANDO con Luhn antes de guardar.
 */
const addPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  // 1. Recibimos el número de tarjeta COMPLETO del frontend, además de los otros datos.
  const { numeroTarjeta, brand, holderName, expMonth, expYear, isDefault } = req.body;

  // 2. Validamos con el algoritmo de Luhn.
  if (!numeroTarjeta || !luhnCheck(numeroTarjeta)) {
    res.status(400);
    throw new Error('El número de tarjeta no es válido.');
  }
  
  // 3. Si pasa, guardamos SOLO los datos seguros. NUNCA el número completo.
  if (!Array.isArray(user.paymentMethods)) user.paymentMethods = [];
  if (!Array.isArray(user.formasPago)) user.formasPago = [];

  const willBeDefault = !!isDefault || user.paymentMethods.length === 0;

  if (willBeDefault) {
    user.paymentMethods.forEach(m => (m.isDefault = false));
    user.formasPago.forEach(m => (m.isDefault = false));
  }

  const doc = { 
    brand, 
    holderName, 
    expMonth, 
    expYear,
    isDefault: willBeDefault,
    last4: numeroTarjeta.slice(-4) // <-- Extraemos los últimos 4 dígitos
  };

  user.paymentMethods.push(doc);
  user.formasPago.push(doc); // Mantenemos la retrocompatibilidad

  await user.save();
  
  // 4. Devolvemos la lista COMPLETA y actualizada de métodos de pago.
  res.status(201).json(user.paymentMethods);
});

/**
 * DELETE /api/users/paymentmethods/:methodId
 * Eliminar método de pago (borra en ambos arrays; re-asigna default si aplica)
 */
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  // Tu lógica de borrado para retrocompatibilidad es buena, la mantenemos.
  user.paymentMethods.pull({ _id: methodId });
  user.formasPago.pull({ _id: methodId });

  // Reasignar default si es necesario...
  const wasDefault = !user.paymentMethods.some(m => m.isDefault);
  if (wasDefault && user.paymentMethods.length > 0) {
    user.paymentMethods[0].isDefault = true;
    // También actualiza el campo antiguo si lo usas
    const oldDefaultId = user.paymentMethods[0]._id;
    const oldMethod = user.formasPago.id(oldDefaultId);
    if(oldMethod) oldMethod.isDefault = true;
  }
  
  await user.save();
  
  // Devolvemos la lista COMPLETA y actualizada.
  res.json(user.paymentMethods);
});

// Asegúrate de que tu exportación esté completa
module.exports = {
  // ...
  addPaymentMethod,
  deletePaymentMethod,
  // ...
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
};
