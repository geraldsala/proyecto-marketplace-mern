// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile, // <-- Importado para actualizar perfil
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
  getWishlist,          // <-- Importado para la wishlist
  addToWishlist,        // <-- Importado para la wishlist
  removeFromWishlist,   // <-- Importado para la wishlist
  checkWishlistStatus,
  toggleSubscription, // 
  getSubscriptions, 
  getStorePublicProfile, 
  listPublicStores, // 
} = require('../controllers/userController.js');

const { protect, authorize } = require('../middlewares/authMiddleware.js');

// --- Rutas de Autenticación y Perfil ---
router.post('/login', authUser);
router.post('/register', registerUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // <-- Añadida la ruta PUT

// --- Rutas de Direcciones (solo compradores) ---
router.post('/addresses', protect, authorize('comprador'), addShippingAddress);
router.delete('/addresses/:addressId', protect, authorize('comprador'), deleteShippingAddress);

// --- Rutas de Métodos de Pago (solo compradores) ---
router.post('/paymentmethods', protect, authorize('comprador'), addPaymentMethod);
router.delete('/paymentmethods/:methodId', protect, authorize('comprador'), deletePaymentMethod);

// --- Rutas de Wishlist (solo compradores) ---
router
  .route('/wishlist')
  .get(protect, authorize('comprador'), getWishlist)
  .post(protect, authorize('comprador'), addToWishlist);

router
  .route('/wishlist/:productId')
  .delete(protect, authorize('comprador'), removeFromWishlist);

router
  .route('/wishlist/:productId/status')
  .get(protect, authorize('comprador'), checkWishlistStatus);  


router
  .route('/subscriptions')
  .get(protect, authorize('comprador'), getSubscriptions)
  .post(protect, authorize('comprador'), toggleSubscription);

router.route('/store/:id').get(getStorePublicProfile);

router.route('/stores').get(listPublicStores); // público

module.exports = router;
