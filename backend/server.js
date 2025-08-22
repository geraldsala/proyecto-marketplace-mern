// backend/server.js

const path = require('path'); // <-- 1. AÑADIDO: Módulo 'path' para manejar rutas de archivos
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeSubscriptionRoutes = require('./routes/storeSubscriptionRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // <-- 2. AÑADIDO: Importamos la nueva ruta de subida

const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/storesubscriptions', storeSubscriptionRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/upload', uploadRoutes); // <-- 3. AÑADIDO: Usamos la nueva ruta

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// --- 4. AÑADIDO: Hacemos la carpeta 'uploads' estática/pública ---
// __dirname apunta al directorio actual (en este caso, la carpeta 'backend')
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// ----------------------------------------------------------------

// Middlewares de manejo de errores (deben ir al final)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
