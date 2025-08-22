// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview,
  reportProduct,
  listTopProducts, // 👈 añadida
} = require('../controllers/productController.js');

const { protect, authorize } = require('../middlewares/authMiddleware.js');
const Product = require('../models/Product');

// --- RUTA PÚBLICA ESPECIAL ---
// ⚠️ importante: declarar /top antes de /:id para que no lo “sombree”
router.get('/top', listTopProducts);

// --- COLECCIÓN ---
// GET /api/products   → listado público
// POST /api/products  → crear (solo tienda/admin)
router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('tienda', 'admin'), createProduct);

// --- SUBRUTAS ESPECÍFICAS (antes de /:id) ---
// GET /api/products/myproducts → productos de la tienda actual
router.get('/myproducts', protect, authorize('tienda'), getMyProducts);

// POST /api/products/:id/reviews → crear review
router.post(
  '/:id/reviews',
  protect,
  authorize('comprador', 'tienda', 'admin'),
  createProductReview
);

// POST /api/products/:id/report → reportar producto
router.post(
  '/:id/report',
  protect,
  authorize('comprador', 'tienda', 'admin'),
  reportProduct
);

// --- POR ID (detalle / update / delete) ---
// GET /api/products/:id
// PUT /api/products/:id
// DELETE /api/products/:id
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('tienda', 'admin'), updateProduct)
  .delete(protect, authorize('tienda', 'admin'), deleteProduct);




// PATCH /api/admin/products/:id/reassign
// body: { tienda: "<UserId del dueño>" }
router.patch('/admin/products/:id/reassign', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { tienda } = req.body;
  if (!tienda) {
    res.status(400);
    throw new Error('Campo "tienda" es requerido');
  }
  const prod = await Product.findByIdAndUpdate(id, { tienda }, { new: true });
  if (!prod) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(prod);
});  



// ========== ADMIN: Reasignar dueño (campo "tienda") de un producto ==========
// URL FINAL por tu montaje: PATCH /api/products/admin/:id/reassign
router.patch('/admin/:id/reassign', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { tienda } = req.body;

  if (!tienda) {
    res.status(400);
    throw new Error('Campo "tienda" es requerido');
  }

  const prod = await Product.findByIdAndUpdate(id, { tienda }, { new: true });
  if (!prod) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(prod);
});


// ========== PUT /api/products/:id (update real) ==========
router.put('/:id', protect, authorize('admin', 'tienda'), async (req, res) => {
  const { id } = req.params;
  const prod = await Product.findById(id);
  if (!prod) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Si NO es admin, debe ser el dueño del producto
  if (req.user.tipoUsuario !== 'admin' && String(prod.tienda) !== String(req.user._id)) {
    res.status(403);
    throw new Error('No autorizado para editar este producto');
  }

  // Campos permitidos según tu schema
  const allowed = [
    'tienda','nombre','imagenes','descripcion','categoria','precio','stock','estado',
    'tiempoPromedioEnvio','costoEnvio','ubicacionFisica',
    'especificacionesTecnicas','serviciosAdicionales','archivosAdjuntos',
    'deshabilitado'
  ];

  for (const k of allowed) {
    if (k in req.body) prod[k] = req.body[k];
  }

  await prod.save();
  res.json(prod);
});


module.exports = router;

