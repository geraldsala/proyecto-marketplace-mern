const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
// --- LA CORRECCIÓN ESTÁ AQUÍ ---
// Desestructuramos para obtener la función 'protect' directamente
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Obtener y actualizar el perfil del usuario autenticado
// @route   GET /api/users/profile
// @route   PUT /api/users/profile
// @access  Private
router
  .route('/profile')
  .get(
    protect, // Ahora 'protect' es una función válida
    asyncHandler(async (req, res) => {
      const user = await User.findById(req.user._id);

      if (user) {
        res.json({
          _id: user._id,
          nombre: user.nombre,
          email: user.email,
          cedula: user.cedula,
          tipoUsuario: user.tipoUsuario,
          pais: user.pais,
          direccion: user.direccion,
          fotoLogo: user.fotoLogo,
          telefono: user.telefono,
          redesSociales: user.redesSociales,
          nombreTienda: user.nombreTienda,
          direccionesEnvio: user.direccionesEnvio,
          formasPago: user.formasPago,
        });
      } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
      }
    })
  )
  .put(
    protect,
    asyncHandler(async (req, res) => {
      const user = await User.findById(req.user._id);

      if (user) {
        user.nombre = req.body.nombre || user.nombre;
        user.email = req.body.email || user.email;
        user.pais = req.body.pais || user.pais;
        user.direccion = req.body.direccion || user.direccion;
        user.fotoLogo = req.body.fotoLogo || user.fotoLogo;
        user.telefono = req.body.telefono || user.telefono;
        user.redesSociales = req.body.redesSociales || user.redesSociales;

        if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(req.body.password, salt);
        }
        
        if (user.tipoUsuario === 'tienda') {
          user.nombreTienda = req.body.nombreTienda || user.nombreTienda;
        }

        if (user.tipoUsuario === 'comprador') {
          user.direccionesEnvio = req.body.direccionesEnvio || user.direccionesEnvio;
          user.formasPago = req.body.formasPago || user.formasPago;
        }

        const updatedUser = await user.save();

        res.json({
          _id: updatedUser._id,
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          tipoUsuario: updatedUser.tipoUsuario,
        });
      } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
      }
    })
  );

// @desc    Obtener todos los usuarios (Solo para admins)
// @route   GET /api/users
// @access  Private/Admin
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.tipoUsuario !== 'admin') {
      res.status(401);
      throw new Error('No autorizado, solo los administradores pueden ver los usuarios');
    }

    const users = await User.find({}).select('-password');
    res.json(users);
  })
);

// @desc    Actualizar el rol de un usuario (Solo para admins)
// @route   PUT /api/users/update-role/:id
// @access  Private/Admin
router.put(
  '/update-role/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.tipoUsuario !== 'admin') {
      res.status(401);
      throw new Error('No autorizado, solo los administradores pueden cambiar roles');
    }

    const user = await User.findById(req.params.id);

    if (user) {
      user.tipoUsuario = req.body.tipoUsuario || user.tipoUsuario;
      user.nombreTienda = req.body.nombreTienda || user.nombreTienda;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        tipoUsuario: updatedUser.tipoUsuario,
        nombreTienda: updatedUser.nombreTienda,
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  })
);

module.exports = router;