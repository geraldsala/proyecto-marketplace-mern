// backend/scripts/initSoldCount.js
const path = require('path');

// 👇 Carga el MISMO .env que usa tu servidor.
// Si tu .env está en backend/.env:
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
// Si tu .env está en la RAÍZ del proyecto, usa esta en su lugar:
// require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');      // 👈 usa tu misma función de conexión
const Product = require('../models/Product');

(async () => {
  try {
    console.log('⏳ Conectando a MongoDB con la MISMA config del server...');
    await connectDB();                           // 👈 misma conexión que el server
    console.log('✅ Conectado.');

    const before = await Product.countDocuments({ soldCount: { $exists: false } });
    console.log('📦 Productos sin soldCount:', before);

    if (before > 0) {
      const res = await Product.updateMany(
        { soldCount: { $exists: false } },
        { $set: { soldCount: 0 } }
      );
      console.log('🔄 Actualizados:', res.modifiedCount);
    } else {
      console.log('👌 Nada que actualizar.');
    }

    await mongoose.connection.close();
    console.log('👋 Conexión cerrada. Listo.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();
