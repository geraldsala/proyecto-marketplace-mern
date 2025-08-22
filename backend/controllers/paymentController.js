// backend/controllers/paymentController.js

const asyncHandler = require('express-async-handler');
const processPayment = asyncHandler(async (req, res) => {
  const { cardDetails } = req.body;
  setTimeout(() => {
    if (cardDetails && cardDetails.cvv && cardDetails.cvv.endsWith('7')) {
      res.status(400).json({ success: false, message: `Pago rechazado (CVV inválido - Simulado)` });
    } else {
      res.status(200).json({ success: true, transactionId: `txn_${Date.now()}` });
    }
  }, 2000);
});
module.exports = { processPayment };