const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Nota: Definimos el esquema (el "plano") para el modelo de usuario.
// Esto nos permite tener un control estricto sobre la forma de los datos.
const userSchema = mongoose.Schema(
  {
    cedula: {
      type: String,
      required: true,
      unique: true,
    },
    nombre: { // Nombre completo de la persona o Razón Social de la tienda
      type: String,
      required: true,
    },
    nombreUsuario: { // Alias único para el login
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tipoUsuario: {
      type: String,
      required: true,
      enum: ['comprador', 'tienda', 'admin'],
    },
    pais: {
      type: String,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    fotoLogo: {
      type: String,
      default: 'placeholder.jpg',
    },
    telefono: {
      type: String,
      required: true,
    },
    redesSociales: {
      type: [String], // Array de strings para varias redes
    },
    // Campos específicos para tiendas
    nombreTienda: { // Nombre comercial de la tienda
      type: String,
      required: function() {
        return this.tipoUsuario === 'tienda';
      },
    },
    // Campos específicos para compradores
    direccionesEnvio: [
      {
        pais: String,
        provincia: String,
        casillero: String,
        codigoPostal: String,
        observaciones: String,
      },
    ],
    formasPago: [
      {
        nombreTitular: String,
        numeroTarjeta: String,
        cvv: String,
        vencimiento: String,
        saldo: Number,
      },
    ],
  },
  {
    timestamps: true, // Agrega campos 'createdAt' y 'updatedAt' automáticamente
  }
);

// Nota: Este middleware de Mongoose se ejecuta antes de guardar un usuario.
// Su propósito es cifrar la contraseña para no guardarla en texto plano, lo que mejora la seguridad.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Nota: Agregamos un método al esquema para comparar la contraseña
// que se ingresa con la que está cifrada en la base de datos.
// Esto nos permite verificar la contraseña en la ruta de login.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;