// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tienda: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    productosComprados: [
      {
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true },
        imagen: { type: String, required: true },
        precio: { type: Number, required: true },
        producto: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    direccionEnvio: {
      pais: { type: String, required: true },
      provincia: { type: String, required: true },
      casillero: { type: String },
      codigoPostal: { type: String },
    },
    metodoPago: {
      type: String,
      required: true,
    },
    precioEnvio: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrecio: {
      type: Number,
      required: true,
      default: 0.0,
    },
    pagado: {
      type: Boolean,
      required: true,
      default: false,
    },
    fechaPago: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;