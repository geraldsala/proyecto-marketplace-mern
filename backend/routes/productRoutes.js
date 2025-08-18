// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const protect = require('../middlewares/authMiddleware'); // Importamos el middleware de autenticación

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Tienda
router.post(
  '/',
  protect, // Usamos el middleware para proteger la ruta
  asyncHandler(async (req, res) => {
    // Verificar si el usuario es una tienda
    if (req.user.tipoUsuario !== 'tienda') {
      res.status(401);
      throw new Error('Solo las tiendas pueden crear productos');
    }

    const {
      nombre,
      imagenes,
      descripcion,
      categoria,
      precio,
      stock,
      especificacionesTecnicas,
      serviciosAdicionales,
      archivosAdjuntos,
      estado,
      tiempoEnvio,
      costoEnvio,
      ubicacion,
    } = req.body;

    const product = new Product({
      tienda: req.user._id, // Asignamos el ID de la tienda autenticada
      nombre,
      imagenes,
      descripcion,
      categoria,
      precio,
      stock,
      especificacionesTecnicas,
      serviciosAdicionales,
      archivosAdjuntos,
      estado,
      tiempoEnvio,
      costoEnvio,
      ubicacion,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  })
);

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('tienda', 'nombreTienda');
    res.json(products);
  })
);

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('tienda', 'nombreTienda');
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
  })
);

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Tienda
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const {
      nombre,
      imagenes,
      descripcion,
      categoria,
      precio,
      stock,
      especificacionesTecnicas,
      serviciosAdicionales,
      archivosAdjuntos,
      estado,
      tiempoEnvio,
      costoEnvio,
      ubicacion,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Solo la tienda que creó el producto puede actualizarlo
      if (product.tienda.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('No estás autorizado para actualizar este producto');
      }

      product.nombre = nombre || product.nombre;
      product.imagenes = imagenes || product.imagenes;
      product.descripcion = descripcion || product.descripcion;
      product.categoria = categoria || product.categoria;
      product.precio = precio || product.precio;
      product.stock = stock || product.stock;
      product.especificacionesTecnicas = especificacionesTecnicas || product.especificacionesTecnicas;
      product.serviciosAdicionales = serviciosAdicionales || product.serviciosAdicionales;
      product.archivosAdjuntos = archivosAdjuntos || product.archivosAdjuntos;
      product.estado = estado || product.estado;
      product.tiempoEnvio = tiempoEnvio || product.tiempoEnvio;
      product.costoEnvio = costoEnvio || product.costoEnvio;
      product.ubicacion = ubicacion || product.ubicacion;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
  })
);

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Tienda
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Solo la tienda que creó el producto puede eliminarlo
      if (product.tienda.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('No estás autorizado para eliminar este producto');
      }
      await product.deleteOne();
      res.json({ message: 'Producto eliminado con éxito' });
    } else {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
  })
);

// @desc    Crear una nueva calificación para un producto
// @route   POST /api/products/:id/reviews
// @access  Private/Comprador
router.post(
  '/:id/reviews',
  protect,
  asyncHandler(async (req, res) => {
    const { calificacion, comentario } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Verifica si el usuario ya ha calificado este producto
      const alreadyReviewed = product.calificaciones.find(
        (r) => r.usuario.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Ya has calificado este producto');
      }

      const review = {
        nombre: req.user.nombre,
        calificacion: Number(calificacion),
        comentario,
        usuario: req.user._id,
      };

      // Agrega la nueva calificación
      product.calificaciones.push(review);

      // Actualiza el número de calificaciones
      product.numCalificaciones = product.calificaciones.length;

      // Calcula el nuevo promedio de calificación
      product.calificacionPromedio =
        product.calificaciones.reduce((acc, item) => item.calificacion + acc, 0) /
        product.calificaciones.length;

      await product.save();
      res.status(201).json({ message: 'Calificación agregada' });
    } else {
      res.status(404);
      throw new Error('Producto no encontrado');
    }
  })
);

module.exports = router;