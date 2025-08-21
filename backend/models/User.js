// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- SUB-ESQUEMA para Direcciones de Envío ---
const direccionSchema = new mongoose.Schema({
  pais: { type: String, required: true },
  provincia: { type: String, required: true },
  // --- CORRECCIÓN: Alineado con el controlador y el frontend ---
  casillero: { type: String, required: true }, 
  codigoPostal: { type: String },
  observaciones: { type: String },
});

// --- SUB-ESQUEMA para Formas de Pago ---
const formaPagoSchema = new mongoose.Schema({
  nombreTitular: { type: String, required: true },
  numeroTarjeta: { type: String, required: true },
  cvv: { type: String, required: true },
  // --- CORRECCIÓN: Alineado con el controlador y el frontend ---
  vencimiento: { type: String, required: true }, 
  saldo: { type: Number, default: 0 },
});

// --- ESQUEMA PRINCIPAL de Usuario ---
const userSchema = mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre: { type: String, required: true }, // Mantenemos 'nombre' como en tu controlador
    nombreUsuario: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },
    pais: { type: String, required: true },
    direccion: { type: String, required: true }, // Mantenemos 'direccion' como en tu controlador
    fotoLogo: { type: String, default: 'placeholder.jpg' },
    telefono: { type: String, required: true },
    redesSociales: { type: [String] },
    nombreTienda: {
      type: String,
      required: function () { return this.tipoUsuario === 'tienda'; },
    },
    direccionesEnvio: [direccionSchema],
    formasPago: [formaPagoSchema],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
