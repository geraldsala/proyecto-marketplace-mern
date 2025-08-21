const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// --- Ruta Pública ---
// Cualquiera puede ver la lista de categorías para filtrar productos
router.route('/').get(getCategories);

// --- Rutas de Administrador y Tienda ---
// AHORA: Tanto un admin como una tienda pueden crear, actualizar o eliminar categorías
router.route('/').post(protect, authorize('admin', 'tienda'), createCategory);
router
  .route('/:id')
  .put(protect, authorize('admin', 'tienda'), updateCategory)
  .delete(protect, authorize('admin', 'tienda'), deleteCategory);

module.exports = router;