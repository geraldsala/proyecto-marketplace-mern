// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      cedula,
      nombre,
      email,
      password,
      tipoUsuario,
      pais,
      direccion,
      fotoLogo,
      telefono,
      redesSociales,
      nombreTienda,
      direccionesEnvio,
      formasPago,
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { cedula }] });

    if (userExists) {
      res.status(400).json({ message: 'El usuario con este correo o cédula ya existe' });
      return;
    }

    const user = await User.create({
      cedula,
      nombre,
      email,
      password,
      tipoUsuario,
      pais,
      direccion,
      fotoLogo,
      telefono,
      redesSociales,
      nombreTienda,
      direccionesEnvio,
      formasPago,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario no válidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  }
});

// @desc    Autenticar un usuario y obtener un token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña no válidos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
  }
});

module.exports = router;