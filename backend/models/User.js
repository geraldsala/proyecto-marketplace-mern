// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- SUB-ESQUEMA para Direcciones de Envío ---
const direccionSchema = new mongoose.Schema({
  pais: { type: String, required: true },
  provincia: { type: String, required: true },
  direccionExacta: { type: String, required: true }, // O número de casillero
  codigoPostal: { type: String },
  observaciones: { type: String },
});

// --- SUB-ESQUEMA para Formas de Pago ---
const formaPagoSchema = new mongoose.Schema({
  nombreTitular: { type: String, required: true },
  numeroTarjeta: { type: String, required: true }, // Considera cifrar este dato
  cvv: { type: String, required: true },           // ¡Definitivamente cifrar este dato!
  fechaVencimiento: { type: String, required: true }, // ej: "12/28"
  saldo: { type: Number, default: 0 },             // Simulación de saldo
});

// --- ESQUEMA PRINCIPAL de Usuario ---
const userSchema = mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true },
    nombreUsuario: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },
    pais: { type: String, required: true },
    direccionPrincipal: { type: String, required: true },
    fotoLogo: { type: String, default: 'placeholder.jpg' },
    telefono: { type: String, required: true },

    // Objeto estructurado para Redes Sociales
    redesSociales: {
      website: { type: String },
      facebook: { type: String },
      instagram: { type: String },
    },

    // Campo específico para tiendas
    nombreTienda: {
      type: String,
      required: function () { return this.tipoUsuario === 'tienda'; },
    },

    // Arrays con esquemas definidos
    direccionesEnvio: [direccionSchema],
    formasPago: [formaPagoSchema],

    // ---- NUEVO: Wishlist del usuario ----
    // Guarda los _id de los productos marcados como favoritos
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  { timestamps: true }
);

// Hash de contraseña (evita re-hash si no se modificó)
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
