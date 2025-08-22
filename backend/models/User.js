// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Dirección de envío (recomendada)
const addressSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },                  // "Casa", "Trabajo"
    receptor: { type: String, required: true },                // Nombre de quien recibe
    telefono: { type: String, required: true },
    provincia: { type: String, required: true },
    canton: { type: String, required: true },
    distrito: { type: String, required: true },
    direccion: { type: String, required: true },               // Calle/avenida/barrio
    zip: { type: String },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true, timestamps: true }
);

// Método de pago (sin datos sensibles)
const paymentMethodSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },                   // visa/mastercard
    last4: { type: String, required: true },                   // "4242"
    holderName: { type: String, required: true },
    expMonth: { type: Number, required: true },
    expYear: { type: Number, required: true },
    providerId: { type: String },                              // id en Stripe/PSP (opcional)
    isDefault: { type: Boolean, default: false }
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    // ⚠️ Dejo estos campos como opcionales para no romper tu register actual
    cedula: { type: String, unique: true, sparse: true },
    nombre: { type: String, required: true },
    nombreUsuario: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },

    // Los dejo opcionales para que no fallen registros existentes
    pais: { type: String },
    direccion: { type: String },
    telefono: { type: String },

    fotoLogo: { type: String, default: 'placeholder.jpg' },
    redesSociales: { type: [String], default: [] },

    nombreTienda: {
      type: String,
      required: function () { return this.tipoUsuario === 'tienda'; },
    },

    // NUEVO: nombres en inglés para claridad (usa estos en el controller)
    addresses: { type: [addressSchema], default: [] },
    paymentMethods: { type: [paymentMethodSchema], default: [] },

    // Mantén tu wishlist
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// Hash de password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
