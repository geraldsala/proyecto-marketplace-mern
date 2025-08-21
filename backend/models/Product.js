// backend/models/Product.js
const mongoose = require('mongoose');

// El reviewSchema está bien, lo mantenemos igual
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
  
  // --- MEJORA: Referencia a un modelo de Categoría ---
  categoria: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
  
  precio: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  estado: { type: String, required: true, enum: ['nuevo', 'usado', 'reacondicionado'], default: 'nuevo' },
  
  // --- MEJORA: Estructura flexible para Especificaciones ---
  especificacionesTecnicas: {
    type: Map,
    of: String, // Permite clave-valor dinámicos. Ej: { "RAM": "16GB", "Pantalla": "OLED" }
  },

  // --- MEJORA: Estructura flexible para Servicios ---
  serviciosAdicionales: [{
    nombre: String,
    descripcion: String,
    precio: Number,
  }],

  // --- MEJORA: Estructura flexible para Archivos ---
  archivosAdjuntos: [{
      nombreArchivo: String,
      urlArchivo: String,
  }],
  
  // --- Logística ---
  tiempoEnvio: { type: String, default: 'variable' },
  costoEnvio: { type: Number, required: true, default: 0 },
  ubicacion: { type: String, required: true },
  
  // --- Calificaciones y Reviews ---
  calificaciones: [reviewSchema],
  calificacionPromedio: { type: Number, required: true, default: 0 },
  numCalificaciones: { type: Number, required: true, default: 0 },

  // --- AÑADIDO: Campos para reportes y estado ---
  reportes: { type: Number, default: 0 },
  deshabilitado: { type: Boolean, default: false },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;