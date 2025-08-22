// backend/scripts/initSoldCount.js
const mongoose = require('mongoose');
const Product = require('../models/Product');

// 👇 Ajusta la URL de conexión a la misma que usas en server.js
const MONGO_URI = 'mongodb://127.0.0.1:27017/tu_base_de_datos';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const res = await Product.updateMany(
      { soldCount: { $exists: false } },
      { $set: { soldCount: 0 } }
    );

    console.log(`🔄 Productos actualizados: ${res.modifiedCount}`);
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
