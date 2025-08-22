// backend/models/Product.js
const mongoose = require('mongoose');

// El reviewSchema está bien
const reviewSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  calificacion: { type: Number, required: true },
  comentario: { type: String, required: true },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, { timestamps: true });

const productSchema = mongoose.Schema({
  tienda: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  nombre: { type: String, required: true },
  imagenes: { type: [String], required: true },
  descripcion: { type: String, required: true },
  categoria: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  precio: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  estado: { type: String, required: true, enum: ['nuevo', 'usado', 'reacondicionado'], default: 'nuevo' },
  
  // --- CAMPO AÑADIDO ---
  fechaPublicacion: { type: Date, default: Date.now },

  especificacionesTecnicas: { type: Map, of: String },
  serviciosAdicionales: [{ nombre: String, descripcion: String, precio: Number }],
  archivosAdjuntos: [{ nombreArchivo: String, urlArchivo: String }],
  
  // --- Logística (Campos renombrados por claridad) ---
  tiempoPromedioEnvio: { type: String, default: 'variable' },
  costoEnvio: { type: Number, required: true, default: 0 },
  ubicacionFisica: { type: String, required: true },
  
  // --- Calificaciones y Reviews (Campo renombrado) ---
  reviews: [reviewSchema],
  calificacionPromedio: { type: Number, required: true, default: 0 },
  numCalificaciones: { type: Number, required: true, default: 0 },

  reportes: { type: Number, default: 0 },
  deshabilitado: { type: Boolean, default: false },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;