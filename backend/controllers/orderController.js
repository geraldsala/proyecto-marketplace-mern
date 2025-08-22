const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod, paymentResult,
    itemsPrice, taxPrice, shippingPrice, totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400); throw new Error('No hay artículos en la orden');
  } else {
    const order = new Order({
      user: req.user._id, orderItems, shippingAddress, paymentMethod, paymentResult,
      itemsPrice, taxPrice, shippingPrice, totalPrice,
      isPaid: true, paidAt: Date.now(),
    });
    const createdOrder = await order.save();
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock -= item.qty;
            await product.save();
        }
    }
    res.status(201).json(createdOrder);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
    console.log('[ORDER CONTROLLER] Ejecutando la función getOrderById...');
    const order = await Order.findById(req.params.id).populate('user', 'nombre email');
    console.log('[ORDER CONTROLLER] Resultado de la búsqueda en BD:', order);

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Orden no encontrada');
    }
});

module.exports = {
  createOrder,
  getOrderById,
};