const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const Product = require('../models/Product.js');
const generateToken = require('../utils/generateToken.js');

// --- AUTH & PROFILE ---
const registerUser = asyncHandler(async (req, res) => {
  // Tu código de registro está bien, se mantiene igual
  const { cedula, nombre, nombreUsuario, email, password, tipoUsuario, pais, direccion, telefono, nombreTienda } = req.body;
  const userExists = await User.findOne({ $or: [{ email }, { cedula }] });
  if (userExists) {
    res.status(400); throw new Error('El usuario con ese email o cédula ya existe');
  }
  const user = await User.create({ cedula, nombre, nombreUsuario, email, password, tipoUsuario, pais, direccion, telefono, nombreTienda });
  if (user) {
    res.status(201).json({ _id: user._id, nombre: user.nombre, email: user.email, tipoUsuario: user.tipoUsuario, token: generateToken(user._id) });
  } else {
    res.status(400); throw new Error('Datos de usuario inválidos');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // Tu código de login está bien, se mantiene igual
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ _id: user._id, nombre: user.nombre, email: user.email, tipoUsuario: user.tipoUsuario, token: generateToken(user._id) });
  } else {
    res.status(401); throw new Error('Email o contraseña inválidos');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  // Tu código de perfil está bien, se mantiene igual
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, nombre: user.nombre, email: user.email, direccionesEnvio: user.direccionesEnvio, formasPago: user.formasPago });
  } else {
    res.status(404); throw new Error('Usuario no encontrado');
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    // Tu código de actualizar perfil está bien, se mantiene igual
  const user = await User.findById(req.user._id);
  if (user) {
    user.nombre = req.body.nombre || user.nombre;
    user.email = req.body.email || user.email;
    if (req.body.password) { user.password = req.body.password; }
    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, nombre: updatedUser.nombre, email: updatedUser.email, tipoUsuario: updatedUser.tipoUsuario, token: generateToken(updatedUser._id) });
  } else {
    res.status(404); throw new Error('Usuario no encontrado');
  }
});

// --- ADDRESS & PAYMENTS (VERSIÓN CORREGIDA Y ALINEADA) ---
const addShippingAddress = asyncHandler(async (req, res) => {
    const { pais, provincia, casillero, codigoPostal, observaciones } = req.body;
    const newAddress = { pais, provincia, casillero, codigoPostal, observaciones };
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { direccionesEnvio: newAddress } }, { new: true, runValidators: true });
    if (user) { res.status(201).json(user.direccionesEnvio); } 
    else { res.status(404); throw new Error('Usuario no encontrado'); }
});

const deleteShippingAddress = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { direccionesEnvio: { _id: req.params.addressId } } }, { new: true });
    if (user) { res.json(user.direccionesEnvio); } 
    else { res.status(404); throw new Error('Usuario no encontrado'); }
});

const addPaymentMethod = asyncHandler(async (req, res) => {
    const { nombreTitular, numeroTarjeta, cvv, vencimiento } = req.body;
    const newPaymentMethod = { nombreTitular, numeroTarjeta, cvv, vencimiento };
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { formasPago: newPaymentMethod } }, { new: true, runValidators: true });
    if (user) { res.status(201).json(user.formasPago); } 
    else { res.status(404); throw new Error('Usuario no encontrado'); }
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { formasPago: { _id: req.params.methodId } } }, { new: true });
    if (user) { res.json(user.formasPago); } 
    else { res.status(404); throw new Error('Usuario no encontrado'); }
});

// ... (El resto de tus funciones como wishlist y admin se mantienen igual)
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: 'wishlist',
        select: 'nombre precio imagenes tienda',
        populate: { path: 'tienda', select: 'nombreTienda' }
    });
    if (user) { res.json(user.wishlist); } 
    else { res.status(404); throw new Error('Usuario no encontrado'); }
});
const toggleWishlistProduct = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) { res.status(400); throw new Error('Se requiere el ID del producto'); }
    const user = await User.findById(req.user._id);
    const product = await Product.findById(productId);
    if (!product) { res.status(404); throw new Error('Producto no encontrado'); }
    const productIndex = user.wishlist.indexOf(productId);
    if (productIndex > -1) {
        user.wishlist.splice(productIndex, 1);
        await user.save();
        res.json({ message: 'Producto eliminado de la lista de deseos' });
    } else {
        user.wishlist.push(productId);
        await user.save();
        res.json({ message: 'Producto agregado a la lista de deseos' });
    }
});
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.tipoUsuario = req.body.tipoUsuario || user.tipoUsuario;
        user.nombreTienda = req.body.nombreTienda || user.nombreTienda;
        const updatedUser = await user.save();
        res.json({ _id: updatedUser._id, nombre: updatedUser.nombre, email: updatedUser.email, tipoUsuario: updatedUser.tipoUsuario });
    } else {
        res.status(404); throw new Error('Usuario no encontrado');
    }
});


module.exports = {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  addShippingAddress, deleteShippingAddress,
  addPaymentMethod, deletePaymentMethod,
  getUsers, updateUserRole,
  toggleWishlistProduct, getWishlist, 
};