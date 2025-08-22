// backend/routes/storeSubscriptionRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middlewares/authMiddleware.js');
const storeSubscriptionController = require('../controllers/storeSubscriptionController.js');

/**
 * @desc    Obtener todas las suscripciones (solo para administradores)
 * @route   GET /api/store-subscriptions
 * @access  Privado (Admin)
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(storeSubscriptionController.getAllSubscriptions)
);

/**
 * @desc    Obtener la suscripción de un usuario específico
 * @route   GET /api/store-subscriptions/my-subscription
 * @access  Privado (Usuario, Tienda, Admin)
 */
router.get(
  '/my-subscription',
  protect,
  asyncHandler(storeSubscriptionController.getSubscriptionByUserId)
);

/**
 * @desc    Crear una nueva suscripción de tienda
 * @route   POST /api/store-subscriptions
 * @access  Privado (Tienda)
 */
router.post(
  '/',
  protect,
  authorize('tienda'),
  asyncHandler(storeSubscriptionController.createSubscription)
);

/**
 * @desc    Actualizar el estado de una suscripción
 * @route   PUT /api/store-subscriptions/:id
 * @access  Privado (Admin)
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(storeSubscriptionController.updateSubscriptionStatus)
);

/**
 * @desc    Eliminar una suscripción
 * @route   DELETE /api/store-subscriptions/:id
 * @access  Privado (Admin)
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(storeSubscriptionController.deleteSubscription)
);

module.exports = router;