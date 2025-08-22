// backend/controllers/storeSubscriptionController.js

const asyncHandler = require('express-async-handler');

exports.getAllSubscriptions = asyncHandler(async (req, res) => {
  res.json({ message: 'Obteniendo todas las suscripciones' });
});

exports.getSubscriptionByUserId = asyncHandler(async (req, res) => {
  res.json({ message: 'Obteniendo suscripción por ID de usuario' });
});

exports.createSubscription = asyncHandler(async (req, res) => {
  res.json({ message: 'Creando una nueva suscripción' });
});

exports.updateSubscriptionStatus = asyncHandler(async (req, res) => {
  res.json({ message: 'Actualizando estado de suscripción' });
});

exports.deleteSubscription = asyncHandler(async (req, res) => {
  res.json({ message: 'Eliminando suscripción' });
});