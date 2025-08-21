const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require('../controllers/productController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// --- Rutas Públicas ---
router.route('/').get(getProducts);

// --- Rutas Protegidas (Requieren Login) ---
router.route('/').post(protect, createProduct);
router.route('/myproducts').get(protect, getMyProducts);

// --- Rutas con ID (deben ir al final) ---
router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;