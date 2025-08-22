// backend/models/orderModel.js

const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        nombre: { type: String, required: true },
        qty: { type: Number, required: true },
        imagen: { type: String, required: true },
        precio: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      // Copiamos la dirección aquí para que no cambie si el usuario la actualiza en su perfil.
      direccion: { type: String, required: true },
      ciudad: { type: String, required: true }, // Asumimos 'ciudad' o 'provincia'
      codigoPostal: { type: String, required: true },
      pais: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      // Para resultados de un pago simulado
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: { // Impuestos
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: { // Costo de envío
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { // Precio final
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Para createdAt y updatedAt
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;