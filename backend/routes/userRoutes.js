const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
  getUsers,
  updateUserRole,
  toggleWishlistProduct,
  getWishlist,
} = require('../controllers/userController.js');
// --- CORRECCIÓN: Aseguramos que la ruta apunte a 'middlewares' (plural) ---
const { protect, authorize } = require('../middlewares/authMiddleware.js');

// ... (el resto de tus rutas se mantiene igual)
// --- Rutas de Autenticación (públicas) ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Rutas de Perfil (protegidas para cualquier usuario logueado) ---
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- Rutas de Direcciones y Pagos (protegidas para cualquier usuario logueado) ---
router.route('/addresses').post(protect, addShippingAddress);
router.route('/addresses/:addressId').delete(protect, deleteShippingAddress);
router.route('/paymentmethods').post(protect, addPaymentMethod);
router.route('/paymentmethods/:methodId').delete(protect, deletePaymentMethod);

// --- Rutas de Lista de Deseos (protegidas solo para compradores) ---
router.route('/wishlist')
  .get(protect, authorize('comprador'), getWishlist)
  .post(protect, authorize('comprador'), toggleWishlistProduct);

// --- Rutas de Admin (protegidas por login y rol de admin) ---
router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id/role').put(protect, authorize('admin'), updateUserRole);


module.exports = router;