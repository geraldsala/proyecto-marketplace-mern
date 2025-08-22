const asyncHandler = require('express-async-handler');
const StoreSubscription = require('../models/StoreSubscription.js');
const User = require('../models/User.js');

/**
 * @desc     Suscribirse o desuscribirse de una tienda
 * @route    POST /api/storesubscriptions/toggle
 * @access   Private/Comprador
 */
const toggleSubscription = asyncHandler(async (req, res) => {
  const { storeId } = req.body;
  const subscriberId = req.user._id;

  if (!storeId) {
    res.status(400); throw new Error('Se requiere el ID de la tienda');
  }

  // Verificamos que la tienda a la que se intenta suscribir realmente exista y sea una tienda
  const storeExists = await User.findOne({ _id: storeId, tipoUsuario: 'tienda' });
  if (!storeExists) {
    res.status(404); throw new Error('Tienda no encontrada');
  }

  // Buscamos si ya existe una suscripción
  const existingSubscription = await StoreSubscription.findOne({
    subscriber: subscriberId,
    store: storeId,
  });

  if (existingSubscription) {
    // Si ya existe, la eliminamos (el usuario se desuscribe)
    await existingSubscription.deleteOne();
    res.json({ message: 'Suscripción eliminada' });
  } else {
    // Si no existe, la creamos (el usuario se suscribe)
    await StoreSubscription.create({ subscriber: subscriberId, store: storeId });
    res.status(201).json({ message: 'Suscrito a la tienda exitosamente' });
  }
});

/**
 * @desc     Obtener las tiendas a las que un comprador está suscrito
 * @route    GET /api/storesubscriptions/mystores
 * @access   Private/Comprador
 */
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await StoreSubscription.find({ subscriber: req.user._id })
    .populate('store', 'nombreTienda fotoLogo'); // Traemos datos útiles de la tienda
  
  // Mapeamos el resultado para devolver solo la información de las tiendas
  res.json(subscriptions.map(sub => sub.store));
});

/**
 * @desc     Obtener los suscriptores de la tienda logueada
 * @route    GET /api/storesubscriptions/mysubscribers
 * @access   Private/Tienda
 */
const getMySubscribers = asyncHandler(async (req, res) => {
  const subscriptions = await StoreSubscription.find({ store: req.user._id })
    .populate('subscriber', 'nombreUsuario fotoLogo'); // Traemos datos útiles del suscriptor
  
  res.json(subscriptions.map(sub => sub.subscriber));
});

module.exports = {
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
};