const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
// --- LA CORRECCIÓN ESTÁ AQUÍ ---
// Desestructuramos para obtener la función 'protect' directamente
const { protect } = require('../middlewares/authMiddleware');
const Order = require('../models/Order');

// @desc    Ruta de prueba para simular una compra
// @route   POST /api/test/order
// @access  Private/Comprador
router.post(
  '/order',
  protect, // Ahora 'protect' es una función válida
  asyncHandler(async (req, res) => {
    // Si eres un comprador, crea una orden de prueba
    if (req.user.tipoUsuario !== 'comprador') {
      res.status(401);
      throw new Error('Solo los compradores pueden simular una compra');
    }

    // Nota: Aquí necesitarás el ID del producto y el ID de la tienda
    // que se deben pasar en el body de la petición.
    const { productoId, tiendaId } = req.body;

    const order = await Order.create({
      usuario: req.user._id,
      tienda: tiendaId,
      productosComprados: [
        {
          nombre: 'Monitor de 24 pulgadas', // Debes reemplazar estos datos con un producto que hayas creado
          cantidad: 1,
          imagen: 'url-de-imagen.jpg',
          precio: 250,
          producto: productoId,
        },
      ],
      direccionEnvio: {
        pais: 'Costa Rica',
        provincia: 'San José',
        casillero: '001',
        codigoPostal: '10101',
      },
      metodoPago: 'Tarjeta',
      precioEnvio: 10,
      totalPrecio: 260,
      pagado: true,
      fechaPago: Date.now(),
    });

    res.status(201).json(order);
  })
);

module.exports = router;
