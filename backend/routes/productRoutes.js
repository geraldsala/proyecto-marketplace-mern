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

router.route('/').get(getProducts);
router.route('/:id').get(getProductById);
router.route('/:id/reviews').post(protect, authorize('comprador'), createProductReview);
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);
router.route('/').post(protect, authorize('tienda', 'admin'), createProduct);
router
  .route('/:id')
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;