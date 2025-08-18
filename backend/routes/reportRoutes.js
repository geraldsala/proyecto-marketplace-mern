// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const protect = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit'); // Importamos la librería para PDF

// @desc    Reporte de Ventas por Producto
// @route   GET /api/reports/sales
// @access  Private/Tienda
router.get(
  '/sales',
  protect,
  asyncHandler(async (req, res) => {
    // Nota: Verificamos que el usuario sea una tienda
    if (req.user.tipoUsuario !== 'tienda') {
      res.status(401);
      throw new Error('No autorizado, solo las tiendas pueden ver este reporte');
    }

    const { startDate, endDate } = req.query;
    const tiendaId = req.user._id;

    // Nota: Construimos la consulta para la base de datos
    const query = {
      tienda: tiendaId,
      createdAt: {
        $gte: new Date(startDate), // Desde la fecha de inicio
        $lte: new Date(endDate), // Hasta la fecha de fin
      },
    };

    const orders = await Order.find(query);

    // Nota: Procesamos los datos para agrupar las ventas por producto
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
    // Nota: Verificamos que el usuario sea un comprador
    if (req.user.tipoUsuario !== 'comprador') {
      res.status(401);
      throw new Error('No autorizado, solo los compradores pueden ver este reporte');
    }

    const userId = req.user._id;
    const { startDate, endDate, categoria, tienda } = req.query;

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
    
    // Aquí puedes agregar lógica para filtrar por categoría si es necesario
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
    // Nota: La consulta ordena los productos por calificación promedio de forma descendente.
    // Usamos el límite de 10 para mostrar solo los 10 mejores.
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

    // Nota: Verificamos que el usuario que pide la factura sea el dueño de la orden o la tienda
    if (order.usuario._id.toString() !== req.user._id.toString() && order.tienda._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('No autorizado, solo el comprador o la tienda pueden descargar esta factura');
    }

    // Configurar la respuesta para que sea un PDF descargable
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factura_${order._id}.pdf"`);

    doc.pipe(res);

    // Lógica para crear el contenido del PDF
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
      doc.text(`- ${item.nombre} x${item.cantidad} - $${item.precio.toFixed(2)}`);
    });
    doc.moveDown();

    doc.text(`Total Productos: $${(order.totalPrecio - order.precioEnvio).toFixed(2)}`);
    doc.text(`Costo de Envío: $${order.precioEnvio.toFixed(2)}`);
    doc.text(`Total Final: $${order.totalPrecio.toFixed(2)}`);

    doc.end();
  })
);

module.exports = router;