const express = require('express');
const router = express.Router();
const { createOrder, getOrderById } = require('../controllers/orderController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// Ruta para crear una nueva orden
router.route('/').post(protect, createOrder);

// Ruta para obtener una orden por su ID
router.route('/:id').get(protect, getOrderById);

router.use('/:id', (req, res, next) => {
  console.log(`[ORDER ROUTES] La petición llegó a las rutas de órdenes para el ID: ${req.params.id}`);
  next();
});

module.exports = router;