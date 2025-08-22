// backend/models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    imagen: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    // Se copia la dirección para “congelarla” al momento de compra
    direccion: { type: String, required: true },
    ciudad: { type: String, required: true },       // o provincia
    codigoPostal: { type: String, required: true },
    pais: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    // Número legible y consecutivo (p. ej. MKP-2025-000123)
    // Lo genera el controlador; aquí sólo se indexa/valida.
    orderNumber: {
      type: String,
      index: true,
      unique: true,   // crea índice único
      sparse: true,   // permite órdenes antiguas sin orderNumber hasta “backfill”
    },

    orderItems: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'La orden debe tener al menos un artículo'],
      required: true,
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    paymentMethod: { type: String, required: true },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    // Totales
    itemsPrice: { type: Number, default: 0.0, min: 0 },   // opcional, útil para desglose
    taxPrice: { type: Number, required: true, default: 0.0, min: 0 },
    shippingPrice: { type: Number, required: true, default: 0.0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0.0, min: 0 },

    // Estado de pago/entrega
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

// Opcional: asegurar valores numéricos a 2 decimales al guardar
function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}
orderSchema.pre('save', function (next) {
  if (this.isModified('itemsPrice')) this.itemsPrice = round2(this.itemsPrice);
  if (this.isModified('taxPrice')) this.taxPrice = round2(this.taxPrice);
  if (this.isModified('shippingPrice')) this.shippingPrice = round2(this.shippingPrice);
  if (this.isModified('totalPrice')) this.totalPrice = round2(this.totalPrice);
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
