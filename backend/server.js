// backend/server.js (fragmento)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // <- OK
const categoryRoutes = require('./routes/categoryRoutes');
const storeSubscriptionRoutes = require('./routes/storeSubscriptionRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');

const { notFound, errorHandler } = require('./middlewares/errorMiddleware.js');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // <- OK
app.use('/api/categories', categoryRoutes);
app.use('/api/storesubscriptions', storeSubscriptionRoutes);
app.use('/api/subscribe', subscribeRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
