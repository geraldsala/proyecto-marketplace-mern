const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addShippingAddress,
  deleteShippingAddress,
} = require('../controllers/userController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// Rutas de Autenticación (públicas)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas de Perfil (protegidas)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Rutas para Direcciones de Envío (protegidas)
router.route('/addresses')
    .post(protect, addShippingAddress);

router.route('/addresses/:addressId')
    .delete(protect, deleteShippingAddress);

module.exports = router;