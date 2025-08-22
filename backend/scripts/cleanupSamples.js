require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

(async () => {
  try {
    await connectDB();
    const regex = /muestra|sample|editar/i; // ajusta si quieres
    const res = await Product.deleteMany({ nombre: regex });
    console.log('Eliminados:', res.deletedCount);
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();