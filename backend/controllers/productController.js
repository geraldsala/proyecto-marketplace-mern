// backend/controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');

/** GET /api/products */
const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({});
  res.json(products);
});

/** GET /api/products/:id */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('tienda', 'nombre nombreTienda storeName fotoLogo logo logoURL email');
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(product); // incluye virtual "reviews"
});

/** POST /api/products  (borrador de producto) */
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    nombre: 'Producto de Muestra (Editar)',
    precio: 0,
    tienda: req.user._id,
    imagenes: ['/images/sample.jpg'],
    categoria: '68a7b7b872eae1ed4d977b24', // ajusta a tu categoría real
    stock: 0,
    descripcion: 'Descripción de muestra para editar.',
    ubicacionFisica: 'Ubicación Pendiente',
    costoEnvio: 0,
  });
  const created = await product.save();
  res.status(201).json(created);
});

/** PUT /api/products/:id */
const updateProduct = asyncHandler(async (_req, res) => {
  res.json({ message: 'Producto actualizado (lógica pendiente)' });
});

/** DELETE /api/products/:id */
const deleteProduct = asyncHandler(async (_req, res) => {
  res.json({ message: 'Producto eliminado (lógica pendiente)' });
});

/** GET /api/products/myproducts */
const getMyProducts = asyncHandler(async (_req, res) => {
  res.json([]);
});

/** POST /api/products/:id/reviews  (crear/actualizar reseña) */
const createProductReview = asyncHandler(async (req, res) => {
  console.log('POST /api/products/:id/reviews', {
    id: req.params.id,
    user: req.user && { id: req.user._id, role: req.user.role },
    body: req.body,
  });

  const product = await Product.findById(req.params.id);
  if (!product) {
    console.error('Producto no encontrado');
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  const rating = Number(req.body.rating);
  const comment = (req.body.comentario ?? req.body.comment ?? '').toString();

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Calificación inválida (1–5)');
  }

  // Trabajamos con "calificaciones"
  const list = Array.isArray(product.calificaciones) ? product.calificaciones : [];

  // 1 reseña por usuario -> actualiza si existe
  const idx = list.findIndex((r) => String(r.usuario) === String(req.user._id));
  if (idx >= 0) {
    list[idx].calificacion = rating;
    list[idx].comentario = comment;
    list[idx].nombre =
      req.user?.name || req.user?.nombre || req.user?.email || 'Usuario';
  } else {
    list.unshift({
      usuario: req.user._id,
      nombre: req.user?.name || req.user?.nombre || req.user?.email || 'Usuario',
      calificacion: rating,
      comentario: comment,
    });
  }

  product.calificaciones = list;
  product.numCalificaciones = list.length;
  const sum = list.reduce((a, r) => a + Number(r.calificacion || 0), 0);
  product.calificacionPromedio =
    Math.round((sum / (product.numCalificaciones || 1)) * 100) / 100;

  await product.save();

  const updated = await Product.findById(product._id)
    .populate('tienda', 'nombre nombreTienda storeName fotoLogo logo logoURL email');

  console.log(
    'Review OK -> promedio:',
    updated.calificacionPromedio,
    'total:',
    updated.numCalificaciones
  );

  res.status(201).json(updated); // incluye virtual "reviews"
});

/** POST /api/products/:id/report  (incrementa reportes; inhabilita al llegar a 10) */
const reportProduct = asyncHandler(async (req, res) => {
  console.log('POST /api/products/:id/report', {
    id: req.params.id,
    user: req.user && { id: req.user._id, role: req.user.role },
  });

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Solo contamos; no guardamos categoría ni detalle
  product.reportes = (product.reportes || 0) + 1;

  // Inhabilitar al llegar a 10
  if (product.reportes >= 10) {
    product.deshabilitado = true;
  }

  await product.save();

  const updated = await Product.findById(product._id)
    .populate('tienda', 'nombre nombreTienda storeName fotoLogo logo logoURL email');

  console.log('Reporte OK -> reportes:', updated.reportes, 'deshabilitado:', updated.deshabilitado);
  res.status(201).json(updated);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview,
  reportProduct,              // <-- exportado
};
