const asyncHandler = require('express-async-handler');
const StoreSubscription = require('../models/StoreSubscription.js');
const User = require('../models/User.js');

const toggleSubscription = asyncHandler(async (req, res) => {
  const { storeId } = req.body;
  const subscriberId = req.user._id;

  if (!storeId) {
    res.status(400);
    throw new Error('Se requiere el ID de la tienda');
  }

  const storeExists = await User.findOne({ _id: storeId, tipoUsuario: 'tienda' });
  if (!storeExists) {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }

  const existingSubscription = await StoreSubscription.findOne({
    subscriber: subscriberId,
    store: storeId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    res.json({ message: 'Suscripción eliminada' });
  } else {
    await StoreSubscription.create({ subscriber: subscriberId, store: storeId });
    res.status(201).json({ message: 'Suscrito a la tienda exitosamente' });
  }
});

const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await StoreSubscription.find({ subscriber: req.user._id })
    .populate('store', 'nombreTienda fotoLogo');
  res.json(subscriptions.map(sub => sub.store));
});

const getMySubscribers = asyncHandler(async (req, res) => {
  const subscriptions = await StoreSubscription.find({ store: req.user._id })
    .populate('subscriber', 'nombre fotoLogo');
  res.json(subscriptions.map(sub => sub.subscriber));
});

module.exports = {
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
};