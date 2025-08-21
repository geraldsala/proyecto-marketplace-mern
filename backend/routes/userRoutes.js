const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  addShippingAddress, deleteShippingAddress,
  addPaymentMethod, deletePaymentMethod,
  getUsers, updateUserRole
} = require('../controllers/userController.js');
const { protect } = require('../middlewares/authMiddleware.js');

// Middleware de Admin (para proteger rutas específicas)
const admin = (req, res, next) => {
    if (req.user && req.user.tipoUsuario === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('No autorizado, solo para administradores.');
    }
};

// Rutas de Autenticación (públicas)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas de Perfil (protegidas para cualquier usuario logueado)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Rutas de Direcciones y Pagos (protegidas)
router.route('/addresses').post(protect, addShippingAddress);
router.route('/addresses/:addressId').delete(protect, deleteShippingAddress);
router.route('/paymentmethods').post(protect, addPaymentMethod);
router.route('/paymentmethods/:methodId').delete(protect, deletePaymentMethod);

// Rutas de Admin (protegidas por dos middlewares: login y rol de admin)
router.route('/').get(protect, admin, getUsers);
router.route('/:id/role').put(protect, admin, updateUserRole);

module.exports = router;