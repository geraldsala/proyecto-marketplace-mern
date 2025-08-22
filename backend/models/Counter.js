// backend/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // ej: 'order'
  seq: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
