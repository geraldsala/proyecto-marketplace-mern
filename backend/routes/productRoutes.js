// backend/routes/productRoutes.js
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

const { protect, authorize } = require('../middlewares/authMiddleware.js');

// pública / crear
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('tienda', 'admin'), createProduct);

// específicas (antes de :id)
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);

// ⚠️ RESEÑAS PRIMERO para que nada las “sombree”
router
  .route('/:id/reviews')
  .post(protect, authorize('comprador', 'tienda', 'admin'), createProductReview);

// por id
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;
