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

// --- Rutas Públicas y de Creación ---
// Unificamos el GET (para todos) y el POST (para tiendas) en la misma ruta
router.route('/')
  .get(getProducts)
  .post(protect, authorize('tienda', 'admin'), createProduct);

// --- Rutas Específicas de Tienda ---
// IMPORTANTE: Rutas específicas como '/myproducts' deben ir ANTES de rutas dinámicas como '/:id'
// para que Express no confunda "myproducts" con un ID de producto.
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);

// --- Rutas por ID de Producto ---
// Unificamos GET, PUT y DELETE para un producto específico por su ID
router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

// --- Ruta para Crear Reviews ---
// Un comprador puede hacer un POST a una review para un producto específico
router.route('/:id/reviews').post(protect, authorize('comprador'), createProductReview);


module.exports = router;