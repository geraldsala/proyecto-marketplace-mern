// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
} = require('../controllers/userController.js');

const { protect, authorize } = require('../middlewares/authMiddleware.js');

// Auth / Perfil
router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);

// Direcciones (solo compradores)
router.post('/addresses', protect, authorize('comprador'), addShippingAddress);
router.delete('/addresses/:addressId', protect, authorize('comprador'), deleteShippingAddress);

// Métodos de pago (solo compradores)
router.post('/paymentmethods', protect, authorize('comprador'), addPaymentMethod);
router.delete('/paymentmethods/:methodId', protect, authorize('comprador'), deletePaymentMethod);

module.exports = router;
