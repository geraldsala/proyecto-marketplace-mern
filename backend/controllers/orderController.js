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
    const order = await Order.findById(req.params.id).populate('user', 'nombre email');
    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Orden no encontrada');
    }
});


// Dentro de la lógica cuando confirmas el pago:
const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }

  // Marca como pagada (ajusta a tus campos reales)
  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();

  // 🔼 Incrementa soldCount por cada ítem
  // Asumiendo order.orderItems = [{ product: <ObjectId>, qty: Number }, ...]
    const ops = order.orderItems.map(item => ({
    updateOne: {
        filter: { _id: item.product },
        update: { $inc: { soldCount: item.qty || 1 } },
    }
    }));
    if (ops.length) await Product.bulkWrite(ops);

  res.json({ message: 'Orden pagada', orderId: order._id });
});

module.exports = {
  createOrder,
  getOrderById,
};