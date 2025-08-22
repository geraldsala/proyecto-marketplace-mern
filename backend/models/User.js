// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Dirección de envío (adaptado a tu form)
const addressSchema = new mongoose.Schema(
  {
    nombre:     { type: String, default: 'Principal' }, // titulo en el form
    receptor:   { type: String, default: '' },           // lo rellenamos en el controlador
    telefono:   { type: String, default: '' },           // idem
    pais:       { type: String, default: '' },           // <-- tu form lo envía
    provincia:  { type: String, required: true },
    canton:     { type: String, default: '' },           // ahora opcional
    distrito:   { type: String, default: '' },           // ahora opcional
    direccion:  { type: String, required: true },        // viene de "Dirección o Casillero"
    zip:        { type: String, default: '' },           // viene de "Código Postal"
    observaciones: { type: String, default: '' },
    isDefault:  { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    last4: { type: String, required: true },
    holderName: { type: String, required: true },
    expMonth: { type: Number, required: true },
    expYear: { type: Number, required: true },
    providerId: { type: String },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    cedula: { type: String, unique: true, sparse: true },
    nombre: { type: String, required: true },
    nombreUsuario: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },

    pais: { type: String },
    direccion: { type: String },
    telefono: { type: String },

    fotoLogo: { type: String, default: 'placeholder.jpg' },
    redesSociales: { type: [String], default: [] },
    nombreTienda: {
      type: String,
      required: function () { return this.tipoUsuario === 'tienda'; },
    },

    addresses: { type: [addressSchema], default: [] },
    paymentMethods: { type: [paymentMethodSchema], default: [] },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

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

