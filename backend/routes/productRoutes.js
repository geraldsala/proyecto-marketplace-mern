const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview,
} = require('../controllers/productController.js');
// --- CORRECCIÓN: La ruta ahora apunta a 'middlewares' (plural) ---
const { protect, authorize } = require('../middlewares/authMiddleware.js');

// --- Rutas Públicas ---
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);

// --- Ruta para Calificaciones (solo compradores) ---
router.route('/:id/reviews').post(protect, authorize('comprador'), createProductReview);

// --- Rutas Protegidas para Tiendas/Vendedores ---
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);
router.route('/').post(protect, authorize('tienda', 'admin'), createProduct);
router
  .route('/:id')
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;
