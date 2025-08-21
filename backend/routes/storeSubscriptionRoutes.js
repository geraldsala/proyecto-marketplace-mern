const express = require('express');
const router = express.Router();
const {
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
} = require('../controllers/storeSubscriptionController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// --- Rutas para Compradores ---

// POST /api/storesubscriptions/toggle -> Suscribirse/desuscribirse de una tienda
router.post('/toggle', protect, authorize('comprador'), toggleSubscription);

// GET /api/storesubscriptions/mystores -> Ver las tiendas a las que está suscrito
router.get('/mystores', protect, authorize('comprador'), getMySubscriptions);


// --- Ruta para Tiendas ---

// GET /api/storesubscriptions/mysubscribers -> Ver los usuarios que están suscritos a su tienda
router.get('/mysubscribers', protect, authorize('tienda'), getMySubscribers);

module.exports = router;