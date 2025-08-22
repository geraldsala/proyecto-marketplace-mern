const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  markOrderPaid,
  getMyOrders,
} = require('../controllers/orderController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// Crear orden
router.post('/', protect, createOrder);

// 💡 IMPORTANTE: esta va ANTES de '/:id'
router.get('/myorders', protect, getMyOrders);

// Obtener detalle por id
router.get('/:id', protect, getOrderById);

// (opcional) Marcar pagada
router.put('/:id/pay', protect, markOrderPaid);

module.exports = router;
