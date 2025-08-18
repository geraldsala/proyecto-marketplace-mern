const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    nombreUsuario: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipoUsuario: { type: String, required: true, enum: ['comprador', 'tienda', 'admin'] },
    pais: { type: String, required: true },
    direccion: { type: String, required: true },
    fotoLogo: { type: String, default: 'placeholder.jpg' },
    telefono: { type: String, required: true },
    redesSociales: { type: [String] },
    nombreTienda: {
      type: String,
      required: function() { return this.tipoUsuario === 'tienda'; },
    },
    direccionesEnvio: [{}],
    formasPago: [{}],
  },
  { timestamps: true }
);

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