// backend/routes/storeRoutes.js
const express = require('express');
const Store = require('../models/Store');
const Product = require('../models/Product'); // <- asegúrate de que exista
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * Público: listar tiendas activas para Home
 * GET /api/users/stores?limit=12
 */
router.get('/users/stores', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 48);
  const stores = await Store.find({ isActive: true })
    .select('name slug logoUrl')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(stores);
});

/**
 * ADMIN: listar con paginación/búsqueda
 * GET /api/admin/stores?search=&page=&limit=
 */
router.get('/admin/stores', protect, authorize('admin'), async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const q = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { slug: new RegExp(search, 'i') }] }
    : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Store.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Store.countDocuments(q),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// POST /api/admin/stores
router.post('/admin/stores', protect, authorize('admin'), async (req, res) => {
  const { name, slug, logoUrl, isActive = true, ownerUser } = req.body;

  if (!name || !slug) {
    res.status(400);
    throw new Error('name y slug son requeridos');
  }

  if (!ownerUser) {
    res.status(400);
    throw new Error('ownerUser es requerido');
  }

  const exists = await Store.findOne({ slug });
  if (exists) {
    res.status(409);
    throw new Error('Slug ya existe');
  }

  const store = await Store.create({
    name,
    slug: slug.toLowerCase().trim(),
    logoUrl,
    isActive,
    ownerUser,
  });

  res.status(201).json(store);
});

/**
 * ADMIN: actualizar
 * PUT /api/admin/stores/:id
 */
router.put('/admin/stores/:id', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, slug, logoUrl, isActive } = req.body;
  const store = await Store.findById(id);
  if (!store) {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }
  if (slug && slug !== store.slug) {
    const sExists = await Store.findOne({ slug });
    if (sExists) {
      res.status(409);
      throw new Error('Slug ya existe');
    }
    store.slug = slug.toLowerCase().trim();
  }
  if (name !== undefined) store.name = name;
  if (logoUrl !== undefined) store.logoUrl = logoUrl;
  if (typeof isActive === 'boolean') store.isActive = isActive;

  await store.save();
  res.json(store);
});

/**
 * ADMIN: deshabilitar/habilitar (soft)
 * PATCH /api/admin/stores/:id/disable
 * body: { isActive: true|false }
 */
router.patch('/admin/stores/:id/disable', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const store = await Store.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!store) {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }
  res.json(store);
});

/**
 * ADMIN: eliminar (hard delete)
 * DELETE /api/admin/stores/:id
 */
router.delete('/admin/stores/:id', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const store = await Store.findById(id);
  if (!store) {
    res.status(404);
    throw new Error('Tienda no encontrada');
  }
  await store.deleteOne();
  res.json({ message: 'Tienda eliminada' });
});

// backend/routes/storeRoutes.js  (añade estos dos si faltan)
router.get('/stores/:slug', async (req, res) => {
  const { slug } = req.params;
  const store = await Store.findOne({ slug, isActive: true }).select('-__v -updatedAt');
  if (!store) { res.status(404); throw new Error('Tienda no encontrada o inactiva'); }
  res.json(store);
});

router.get('/stores/:slug/products', async (req, res) => {
  const { slug } = req.params;
  const { search = '', page = 1, limit = 12, sort = 'latest' } = req.query;

  const store = await Store.findOne({ slug, isActive: true }).select('_id ownerUser');
  if (!store) { res.status(404); throw new Error('Tienda no encontrada o inactiva'); }
  if (!store.ownerUser) { res.status(409); throw new Error('La tienda no tiene ownerUser asignado'); }

  const q = {
    deshabilitado: { $ne: true },
    $or: [
      { tienda: store.ownerUser }, // tu esquema actual apunta a User
      { tienda: store._id },       // compat futuro si migras a Store
    ],
  };

  if (search) q.$or.push({ nombre: new RegExp(search, 'i') }, { descripcion: new RegExp(search, 'i') });

  const sortMap = { latest: { createdAt: -1 }, price_asc: { precio: 1 }, price_desc: { precio: -1 }, alpha: { nombre: 1 } };
  const sortBy = sortMap[sort] || sortMap.latest;

  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || 12, 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Product.find(q).sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(q),
  ]);

  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});




module.exports = router;
