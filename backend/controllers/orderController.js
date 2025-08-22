// backend/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/orderModel.js');
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const Counter = require('../models/Counter.js'); // NUEVO

// Util para generar el número legible
const buildOrderNumber = (seq) => {
  const year = new Date().getFullYear();
  return `MKP-${year}-${String(seq).padStart(6, '0')}`;
};

const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,         // [{ product, nombre, price, qty, ... }]
    shippingAddress,
    paymentMethod,
    paymentResult,      // opcional en la simulación
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('No hay artículos en la orden');
  }

  // 1) Generar consecutivo seguro
  const c = await Counter.findOneAndUpdate(
    { key: 'order' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const orderNumber = buildOrderNumber(c.seq);

  // 2) Crear orden (pagada simulada)
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: true,                 // Simulación: pagada al crear
    paidAt: Date.now(),
    orderNumber,                  // NUEVO
  });

  const createdOrder = await order.save();

  // 3) Descontar stock en bulk (más seguro/performante)
  const ops = orderItems
    .filter(it => it.product && it.qty > 0)
    .map(it => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(it.product) },
        update: { $inc: { stock: -Number(it.qty || 0), soldCount: Number(it.qty || 0) } }, // si prefieres incrementar soldCount solo al confirmar pago, quítalo de aquí
      }
    }));

  if (ops.length) {
    await Product.bulkWrite(ops);
  }

  // 4) Responder lo que necesita el Front
  //    -> así puedes toast + redirigir a /orden/:id/exito
  res.status(201).json({ orderId: createdOrder._id, orderNumber });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'nombre email')
    .populate('orderItems.product', 'nombre imagenes precio'); // opcional para detallar ítems

  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }

  res.json(order);
});

// Si más adelante dejas la confirmación de pago real, mantenlo:
const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Orden no encontrada');
  }

  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();

    // Incrementar soldCount al confirmar pago (si NO lo hiciste en createOrder)
    const ops = order.orderItems.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { soldCount: item.qty || 1 } },
      }
    }));
    if (ops.length) await Product.bulkWrite(ops);
  }

  res.json({ message: 'Orden pagada', orderId: order._id, orderNumber: order.orderNumber });
});

module.exports = {
  createOrder,
  getOrderById,
  markOrderPaid, 
};
