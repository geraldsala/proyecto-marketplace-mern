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

// Importamos ambos middlewares, 'protect' para autenticación y 'authorize' para roles
const { protect, authorize } = require('../middleware/authMiddleware.js');

// --- Rutas Públicas (Cualquier usuario puede acceder) ---
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);


// --- Rutas Protegidas para Tiendas/Vendedores ---

// Para ver "mis productos", debes estar logueado (protect) y ser una tienda (authorize)
router.route('/myproducts').get(protect, authorize('tienda'), getMyProducts);

// Para crear un producto, debes estar logueado (protect) y ser tienda o admin (authorize)
router.route('/').post(protect, authorize('tienda', 'admin'), createProduct);

// Para actualizar o eliminar un producto, debes estar logueado y ser tienda o admin
// La lógica para asegurar que la tienda solo edite SUS PROPIOS productos irá en el controlador.
router
  .route('/:id')
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);

module.exports = router;
