const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
// --- LA CORRECCIÓN ESTÁ AQUÍ ---
// Desestructuramos para obtener la función 'protect' directamente
const { protect } = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// @desc    Reporte de Ventas por Producto
// @route   GET /api/reports/sales
// @access  Private/Tienda
router.get(
  '/sales',
  protect, // Ahora 'protect' es una función válida
  asyncHandler(async (req, res) => {
    if (req.user.tipoUsuario !== 'tienda') {
      res.status(401);
      throw new Error('No autorizado, solo las tiendas pueden ver este reporte');
    }

    const { startDate, endDate } = req.query;
    const tiendaId = req.user._id;

    const query = {
      tienda: tiendaId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const orders = await Order.find(query);

    const report = orders.reduce((acc, order) => {
      order.productosComprados.forEach(item => {
        const productId = item.producto.toString();
        if (!acc[productId]) {
          acc[productId] = {
            nombre: item.nombre,
            cantidadVendida: 0,
            ingresos: 0,
          };
        }
        acc[productId].cantidadVendida += item.cantidad;
        acc[productId].ingresos += item.precio * item.cantidad;
      });
      return acc;
    }, {});

    const totalIngresos = orders.reduce((total, order) => total + order.totalPrecio, 0);

    res.json({
      reportePorProducto: Object.values(report),
      totalIngresos,
      cantidadPedidos: orders.length,
    });
  })
);

// @desc    Historial de Compras y Consumo
// @route   GET /api/reports/purchase-history
// @access  Private/Comprador
router.get(
  '/purchase-history',
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.tipoUsuario !== 'comprador') {
      res.status(401);
      throw new Error('No autorizado, solo los compradores pueden ver este reporte');
    }

    const userId = req.user._id;
    const { startDate, endDate, tienda } = req.query;

    const query = { usuario: userId };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (tienda) {
      query.tienda = new mongoose.Types.ObjectId(tienda);
    }
    
    const orders = await Order.find(query);

    const report = {
      compras: [],
      totalGastado: 0,
    };
    
    orders.forEach(order => {
        report.compras.push({
            idPedido: order._id,
            fecha: order.createdAt,
            total: order.totalPrecio,
            productos: order.productosComprados,
        });
        report.totalGastado += order.totalPrecio;
    });

    res.json(report);
  })
);

// @desc    Ranking de Productos Populares (mejor calificados)
// @route   GET /api/reports/top-products
// @access  Public
router.get(
  '/top-products',
  asyncHandler(async (req, res) => {
    const products = await Product.find({})
      .sort({ calificacionPromedio: -1 })
      .limit(10);

    res.json(products);
  })
);

// @desc    Generar factura de compra en PDF
// @route   GET /api/reports/invoice/:orderId
// @access  Private
router.get(
  '/invoice/:orderId',
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId)
      .populate('usuario', 'nombre')
      .populate('tienda', 'nombreTienda');

    if (!order) {
      res.status(404);
      throw new Error('Orden no encontrada');
    }

    if (order.usuario._id.toString() !== req.user._id.toString() && order.tienda._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('No autorizado, solo el comprador o la tienda pueden descargar esta factura');
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura_${order._id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(20).text('Factura de Compra', { align: 'center' });
    doc.fontSize(12).moveDown();
    doc.text(`Número de Pedido: ${order._id}`);
    doc.text(`Comprador: ${order.usuario.nombre}`);
    doc.text(`Tienda: ${order.tienda.nombreTienda}`);
    doc.text(`Fecha de Pedido: ${order.createdAt.toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Productos:', { underline: true });
    doc.moveDown();
    order.productosComprados.forEach(item => {
      doc.text(`- ${item.nombre} x${item.cantidad} - ₡${item.precio.toLocaleString('es-CR')}`);
    });
    doc.moveDown();

    doc.text(`Total Productos: ₡${(order.totalPrecio - order.precioEnvio).toLocaleString('es-CR')}`);
    doc.text(`Costo de Envío: ₡${order.precioEnvio.toLocaleString('es-CR')}`);
    doc.text(`Total Final: ₡${order.totalPrecio.toLocaleString('es-CR')}`);

    doc.end();
  })
);

module.exports = router;