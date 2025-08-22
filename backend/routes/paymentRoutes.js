// backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.route('/process').post(protect, processPayment);

module.exports = router;