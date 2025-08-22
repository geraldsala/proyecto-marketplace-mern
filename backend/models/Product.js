// backend/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    nombre: { type: String, required: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    tienda: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    nombre: { type: String, required: true },
    imagenes: { type: [String], required: true },
    descripcion: { type: String, required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    precio: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    estado: {
      type: String,
      required: true,
      enum: ['nuevo', 'usado', 'reacondicionado'],
      default: 'nuevo',
    },

    // Publicación
    fechaPublicacion: { type: Date, default: Date.now },

    // Especificaciones / anexos
    especificacionesTecnicas: { type: Map, of: String },
    serviciosAdicionales: [{ nombre: String, descripcion: String, precio: Number }],
    archivosAdjuntos: [{ nombreArchivo: String, urlArchivo: String }],

    // Logística
    tiempoPromedioEnvio: { type: String, default: 'variable' },
    costoEnvio: { type: Number, required: true, default: 0 },
    ubicacionFisica: { type: String },

    // En tu BD se llama "calificaciones"
    calificaciones: { type: [reviewSchema], default: [] },

    calificacionPromedio: { type: Number, required: true, default: 0 },
    numCalificaciones: { type: Number, required: true, default: 0 },

    // Moderación
    reportes: { type: Number, default: 0 },
    deshabilitado: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual "reviews" para compatibilidad en el front
productSchema
  .virtual('reviews')
  .get(function () { return this.calificaciones; })
  .set(function (v) { this.calificaciones = v; });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
