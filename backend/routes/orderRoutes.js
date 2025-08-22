// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// La ruta principal para las órdenes.
// POST a /api/orders creará una nueva orden.
router.route('/').post(protect, createOrder);

module.exports = router;