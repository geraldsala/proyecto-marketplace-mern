const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');

// Ruta Pública para ver categorías
router.route('/').get(getCategories);

// Rutas de Admin/Tienda para gestionar categorías
router.route('/').post(protect, authorize('admin', 'tienda'), createCategory);
router
  .route('/:id')
  .put(protect, authorize('admin', 'tienda'), updateCategory)
  .delete(protect, authorize('admin', 'tienda'), deleteCategory);

module.exports = router;