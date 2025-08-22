// backend/controllers/productController.js (Versión Completa y Corregida)

const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');

/**
 * @desc    Obtener todos los productos
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

/**
 * @desc    Obtener un solo producto por ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

/**
 * @desc    Crear un nuevo producto (como borrador)
 * @route   POST /api/products
 * @access  Private/Tienda
 */
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        nombre: 'Producto de Muestra (Editar)',
        precio: 0,
        tienda: req.user._id,
        imagenes: ['/images/sample.jpg'],
        // Usando un ID de categoría real que me proporcionaste
        categoria: '68a7b7b872eae1ed4d977b24', 
        stock: 0,
        descripcion: 'Descripción de muestra para editar.',
        ubicacionFisica: 'Ubicación Pendiente', // <-- Se incluye el campo requerido
        costoEnvio: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

/**
 * @desc    Actualizar un producto
 * @route   PUT /api/products/:id
 * @access  Private/Tienda
 */
const updateProduct = asyncHandler(async (req, res) => {
    // (Lógica para actualizar un producto irá aquí en el futuro)
    res.json({ message: 'Producto actualizado (lógica pendiente)'});
});

/**
 * @desc    Eliminar un producto
 * @route   DELETE /api/products/:id
 * @access  Private/Tienda
 */
const deleteProduct = asyncHandler(async (req, res) => {
    // (Lógica para eliminar un producto irá aquí en el futuro)
    res.json({ message: 'Producto eliminado (lógica pendiente)'});
});

/**
 * @desc    Obtener los productos de una tienda
 * @route   GET /api/products/myproducts
 * @access  Private/Tienda
 */
const getMyProducts = asyncHandler(async (req, res) => {
    // (Lógica para obtener los productos de la tienda logueada irá aquí)
    res.json([]);
});

/**
 * @desc    Crear una nueva reseña de producto
 * @route   POST /api/products/:id/reviews
 * @access  Private/Comprador
 */
const createProductReview = asyncHandler(async (req, res) => {
    // (Lógica para crear una reseña irá aquí en el futuro)
    res.status(201).json({ message: 'Reseña añadida (lógica pendiente)'});
});


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview,
};