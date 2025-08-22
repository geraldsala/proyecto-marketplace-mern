// backend/controllers/orderController.js

const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel.js');
const Product = require('../models/Product.js'); // Necesario para actualizar el stock

/**
 * @desc    Crear una nueva orden
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  // El frontend nos enviará toda la información necesaria en el body
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay artículos en la orden');
    return;
  } else {
    // Creamos la nueva orden con el modelo
    const order = new Order({
      user: req.user._id, // El usuario viene del middleware 'protect'
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Guardamos la orden en la base de datos
    const createdOrder = await order.save();

    // Lógica para actualizar el stock de los productos
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

module.exports = {
  createOrder,
};