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
  reportProduct,
  listTopProducts, // 👈 añadida
} = require('../controllers/productController.js');

const { protect, authorize } = require('../middlewares/authMiddleware.js');

// --- RUTA PÚBLICA ESPECIAL ---
// ⚠️ importante: declarar /top antes de /:id para que no lo “sombree”
router.get('/top', listTopProducts);

// --- COLECCIÓN ---
// GET /api/products   → listado público
// POST /api/products  → crear (solo tienda/admin)
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('tienda', 'admin'), createProduct);

// --- SUBRUTAS ESPECÍFICAS (antes de /:id) ---
// GET /api/products/myproducts → productos de la tienda actual
router.get('/myproducts', protect, authorize('tienda'), getMyProducts);

// POST /api/products/:id/reviews → crear review
router.post(
  '/:id/reviews',
  protect,
  authorize('comprador', 'tienda', 'admin'),
  createProductReview
);

// POST /api/products/:id/report → reportar producto
router.post(
  '/:id/report',
  protect,
  authorize('comprador', 'tienda', 'admin'),
  reportProduct
);

// --- POR ID (detalle / update / delete) ---
// GET /api/products/:id
// PUT /api/products/:id
// DELETE /api/products/:id
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;

