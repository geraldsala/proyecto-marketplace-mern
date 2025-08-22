// backend/routes/userAdminRoutes.js (nuevo archivo opcional)
const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/admin/users?search=geral&page=1&limit=10
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const q = search
    ? { $or: [{ nombre: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(q).select('_id nombre email tipoUsuario').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(q),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

module.exports = router;
