// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');
const { luhnCheck } = require('../utils/validation.js');
const Product = require('../models/Product.js');

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/users/login
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
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/users/register
 */
const registerUser = asyncHandler(async (req, res) => {
  const { 
    nombre, 
    email, 
    password, 
    tipoUsuario,
    cedula,
    nombreUsuario,
    pais,
    direccion,
    telefono,
    fotoLogo,
    redesSociales,
    nombreTienda
  } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const user = await User.create({ 
    nombre, 
    email, 
    password, 
    tipoUsuario,
    cedula,
    nombreUsuario,
    pais,
    direccion,
    telefono,
    fotoLogo,
    redesSociales,
    nombreTienda: tipoUsuario === 'tienda' ? nombreTienda : undefined,
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

/**
 * @desc    Obtener perfil de usuario
 * @route   GET /api/users/profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const u = user.toObject();

  if (!Array.isArray(u.addresses)) u.addresses = [];
  if (!Array.isArray(u.paymentMethods)) u.paymentMethods = [];
  if (u.addresses.length === 0 && u.direccionesEnvio?.length > 0) {
    u.addresses = u.direccionesEnvio;
  }
  if (u.paymentMethods.length === 0 && u.formasPago?.length > 0) {
    u.paymentMethods = u.formasPago;
  }

  res.json(u);
});


/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 */
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
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});


/**
 * @desc    Agregar dirección de envío
 * @route   POST /api/users/addresses
 */
const addShippingAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  if (!Array.isArray(user.addresses)) user.addresses = [];
  
  const newAddressData = req.body; // Suponiendo que el frontend envía los datos correctos
  user.addresses.push(newAddressData);

  // Lógica de compatibilidad si aún la usas
  if (!Array.isArray(user.direccionesEnvio)) user.direccionesEnvio = [];
  user.direccionesEnvio.push(newAddressData);
  
  await user.save();
  return res.status(201).json({ addresses: user.addresses });
});


/**
 * @desc    Eliminar dirección de envío
 * @route   DELETE /api/users/addresses/:addressId
 */
const deleteShippingAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  user.addresses.pull({ _id: addressId });
  // Lógica de compatibilidad
  if(user.direccionesEnvio) user.direccionesEnvio.pull({ _id: addressId });

  await user.save();
  return res.json({ addresses: user.addresses });
});


/**
 * @desc    Agregar método de pago
 * @route   POST /api/users/paymentmethods
 */
const addPaymentMethod = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  const { numeroTarjeta, brand, holderName, expMonth, expYear, isDefault } = req.body;

  if (!numeroTarjeta || !luhnCheck(numeroTarjeta)) {
    res.status(400);
    throw new Error('El número de tarjeta no es válido.');
  }
  
  if (!Array.isArray(user.paymentMethods)) user.paymentMethods = [];
  
  const willBeDefault = !!isDefault || user.paymentMethods.length === 0;

  if (willBeDefault) {
    user.paymentMethods.forEach(m => (m.isDefault = false));
  }

  const doc = { 
    brand, 
    holderName, 
    expMonth, 
    expYear,
    isDefault: willBeDefault,
    last4: numeroTarjeta.slice(-4)
  };

  user.paymentMethods.push(doc);
  // Lógica de compatibilidad
  if (!Array.isArray(user.formasPago)) user.formasPago = [];
  user.formasPago.push(doc);

  await user.save();
  res.status(201).json(user.paymentMethods);
});


/**
 * @desc    Eliminar método de pago
 * @route   DELETE /api/users/paymentmethods/:methodId
 */
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('Usuario no encontrado'); }

  user.paymentMethods.pull({ _id: methodId });
  // Lógica de compatibilidad
  if (user.formasPago) user.formasPago.pull({ _id: methodId });
  
  await user.save();
  res.json(user.paymentMethods);
});


/**
 * @desc    Obtener la wishlist del usuario
 * @route   GET /api/users/wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});


/**
 * @desc    Añadir un producto a la wishlist
 * @route   POST /api/users/wishlist
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } },
    { new: true }
  );
  if (user) {
    res.status(201).json({ message: 'Producto añadido a la wishlist' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});


/**
 * @desc    Eliminar un producto de la wishlist
 * @route   DELETE /api/users/wishlist/:productId
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  );
  if (user) {
    res.json({ message: 'Producto eliminado de la wishlist' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});


/**
 * @desc    Comprobar si un producto está en la wishlist
 * @route   GET /api/users/wishlist/:productId/status
 */
const checkWishlistStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (user) {
        const inWishlist = user.wishlist.some(pId => pId.equals(productId));
        res.json({ inWishlist });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});


/**
 * @desc    Alternar la suscripción a una tienda
 * @route   POST /api/users/subscriptions
 */
const toggleSubscription = asyncHandler(async (req, res) => {
  const { storeId } = req.body;
  const buyer = await User.findById(req.user._id);
  const store = await User.findById(storeId);

  if (!buyer || !store || store.tipoUsuario !== 'tienda') {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }

  const isSubscribed = buyer.subscriptions.some(subId => subId.equals(storeId));

  if (isSubscribed) {
    // Dejar de seguir
    await User.updateOne({ _id: buyer._id }, { $pull: { subscriptions: storeId } });
    await User.updateOne({ _id: storeId }, { $pull: { subscribers: buyer._id } });
    res.json({ message: 'Suscripción eliminada' });
  } else {
    // Seguir
    await User.updateOne({ _id: buyer._id }, { $addToSet: { subscriptions: storeId } });
    await User.updateOne({ _id: storeId }, { $addToSet: { subscribers: buyer._id } });
    res.status(201).json({ message: 'Suscripción añadida' });
  }
});


/**
 * @desc    Obtener las suscripciones de un usuario
 * @route   GET /api/users/subscriptions
 */
const getSubscriptions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('subscriptions', 'nombreTienda fotoLogo');
  if (user) {
    res.json(user.subscriptions);
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

module.exports = {
  // ... (tus otras exportaciones)
  checkWishlistStatus,
  // --- AÑADE ESTAS DOS LÍNEAS ---
  toggleSubscription,
  getSubscriptions,
};


/**
 * @desc    Obtener el perfil público de una tienda y sus productos
 * @route   GET /api/users/store/:id
 * @access  Public
 */
const getStorePublicProfile = asyncHandler(async (req, res) => {
  // Buscamos a la tienda por su ID
  const store = await User.findById(req.params.id).select('-password -wishlist -subscriptions -subscribers');

  if (store && store.tipoUsuario === 'tienda') {
    // Si la encontramos y es una tienda, buscamos sus productos activos
    const products = await Product.find({ 
      tienda: req.params.id,
      deshabilitado: { $ne: true } // Excluimos productos inhabilitados
    });

    res.json({
      store,
      products
    });

  } else {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }
});


module.exports = {
  // ... (tus otras exportaciones)
  toggleSubscription,
  getSubscriptions,
  // --- AÑADE ESTA LÍNEA AL FINAL ---
  getStorePublicProfile,
};




module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  toggleSubscription,
  getSubscriptions,
  getStorePublicProfile,
};