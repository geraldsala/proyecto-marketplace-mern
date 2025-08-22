const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: "Soporte Correo" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);