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
const userRoutes = require('./routes/userRoutes'); // Importado correctamente
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Cargar variables de entorno del archivo .env
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
app.use('/api/users', userRoutes); // Usando la ruta correctamente

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API está corriendo...');
});

// --- Middleware para manejar errores ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));