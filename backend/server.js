// backend/server.js
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeSubscriptionRoutes = require('./routes/storeSubscriptionRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const storeRoutes = require('./routes/storeRoutes');
const userAdminRoutes = require('./routes/userAdminRoutes');

const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

dotenv.config();
connectDB();

const app = express();

// ---- Middlewares base (ANTES de las rutas) ----
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging sencillo
app.use((req, _res, next) => {
  console.log(`[SERVER] ${req.method} ${req.originalUrl}`);
  next();
});

// Evitar caché en llamadas XHR/Fetch
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// ---- Rutas API ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/storesubscriptions', storeSubscriptionRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', storeRoutes);
app.use('/api', userAdminRoutes);

app.get('/api/health', (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// Carpeta pública para archivos subidos
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// ---- Manejo de errores (AL FINAL) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
