// backend/models/Product.js
const mongoose = require('mongoose');

// Nota: Este esquema define cómo se ven las calificaciones y comentarios
const reviewSchema = mongoose.Schema(
  {
    nombre: { type: String, required: true },
    calificacion: { type: Number, required: true },
    comentario: { type: String, required: true },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al modelo de Usuario
    },
  },
  {
    timestamps: true,
  }
);

// Nota: Este es el esquema principal del producto.
// Incluye campos específicos para un marketplace de tecnología.
const productSchema = mongoose.Schema(
  {
    // Campo para la tienda (vendedor) que publica el producto
    tienda: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al modelo de Usuario
    },
    nombre: {
      type: String,
      required: true,
    },
    imagenes: {
      type: [String], // Un array de URLs de imágenes
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    categoria: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    // Campos específicos para productos de tecnología (Grupo 4)
    especificacionesTecnicas: {
      modelo: { type: String },
      ram: { type: String },
      compatibilidad: { type: String },
    },
    serviciosAdicionales: {
      soporteTecnico: { type: Boolean, default: false },
      instalacion: { type: Boolean, default: false },
    },
    archivosAdjuntos: {
      type: [String], // URLs de manuales, drivers, etc.
    },
    estado: {
      type: String,
      required: true,
      enum: ['nuevo', 'usado', 'reacondicionado'],
      default: 'nuevo',
    },
    // Fin de campos específicos
    tiempoEnvio: {
      type: String,
      default: 'variable',
    },
    costoEnvio: {
      type: Number,
      required: true,
      default: 0,
    },
    ubicacion: {
      type: String,
      required: true,
    },
    // Calificaciones y comentarios
    calificaciones: [reviewSchema], // Array que usa el esquema de calificaciones
    calificacionPromedio: {
      type: Number,
      required: true,
      default: 0,
    },
    numCalificaciones: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;