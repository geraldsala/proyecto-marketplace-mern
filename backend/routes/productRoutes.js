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
  reportProduct,            // <-- importado
} = require('../controllers/productController.js');

const { protect, authorize } = require('../middlewares/authMiddleware.js');

// pública / crear
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('tienda', 'admin'), createProduct);

// específicas (antes de :id)
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);

// ⚠️ Subrutas primero (para que no las sombreen)
router
  .route('/:id/reviews')
  .post(protect, authorize('comprador', 'tienda', 'admin'), createProductReview);

router
  .route('/:id/report')
  .post(protect, authorize('comprador', 'tienda', 'admin'), reportProduct);

// por id
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;
