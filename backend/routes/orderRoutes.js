// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrderById,
  markOrderPaid,   // opcional: confirmar pago real si lo usas
} = require('../controllers/orderController.js');

const { protect } = require('../middlewares/authMiddleware.js');

// Logger para rutas con :id (útil para depurar)
router.use('/:id', (req, res, next) => {
  console.log(
    `[ORDER ROUTES] La petición llegó a las rutas de órdenes para el ID: ${req.params.id}`
  );
  next();
});

// Crear una nueva orden (pagada simulada en createOrder)
router.post('/', protect, createOrder);

// Obtener una orden por su ID (detalle + user populado)
router.get('/:id', protect, getOrderById);

// (Opcional) Confirmar pago real de una orden existente
// Úsalo si NO marcas como pagada al crear la orden.
router.put('/:id/pay', protect, markOrderPaid);

module.exports = router;