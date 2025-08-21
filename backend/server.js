// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Importar rutas ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes'); // Para el boletín de noticias
const categoryRoutes = require('./routes/categoryRoutes');
const storeSubscriptionRoutes = require('./routes/storeSubscriptionRoutes'); // <-- 1. IMPORTAMOS LAS NUEVAS RUTAS

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- Definir rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/test', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscribe', subscribeRoutes); // Para el boletín de noticias
app.use('/api/categories', categoryRoutes);
app.use('/api/storesubscriptions', storeSubscriptionRoutes); // <-- 2. USAMOS LAS NUEVAS RUTAS

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API está corriendo...');
});

// --- Middleware para manejar errores ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
