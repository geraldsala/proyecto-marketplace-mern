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
  cvv: { type: String, required: true }, // ¡Definitivamente cifrar este dato!
  fechaVencimiento: { type: String, required: true }, // ej: "12/28"
  saldo: { type: Number, default: 0 } // Simulación de saldo
});


// --- ESQUEMA PRINCIPAL de Usuario ---
const userSchema = mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true }, // Renombrado para claridad
    nombreUsuario: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },
    pais: { type: String, required: true },
    direccionPrincipal: { type: String, required: true }, // Mantenemos la dirección de registro
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
      required: function() { return this.tipoUsuario === 'tienda'; },
    },

    // Arrays con esquemas definidos
    direccionesEnvio: [direccionSchema],
    formasPago: [formaPagoSchema],
  },
  { timestamps: true }
);

// El middleware de bcrypt y el método matchPassword se mantienen igual (¡están perfectos!)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;