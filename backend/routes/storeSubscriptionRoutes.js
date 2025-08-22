const express = require('express');
const router = express.Router();
const {
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
} = require('../controllers/storeSubscriptionController.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');

// Para Compradores
router.post('/toggle', protect, authorize('comprador'), toggleSubscription);
router.get('/mystores', protect, authorize('comprador'), getMySubscriptions);

// Para Tiendas
router.get('/mysubscribers', protect, authorize('tienda'), getMySubscribers);

module.exports = router;