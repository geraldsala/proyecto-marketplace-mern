const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Category = require('../models/categoryModel.js');

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('categoria', 'nombre');
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const defaultCategory = await Category.findOne();
  if (!defaultCategory) {
    res.status(400);
    throw new Error('No hay categorías en la BD. Crea una primero.');
  }
  const product = new Product({
    nombre: 'Producto de Ejemplo (Editar)',
    precio: 0,
    tienda: req.user._id,
    imagenes: ['/images/sample.jpg'],
    descripcion: 'Añade una descripción.',
    categoria: defaultCategory._id,
    stock: 0,
    estado: 'nuevo',
    ubicacion: 'Añade una ubicación.',
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
    // Implementar lógica de actualización si es necesario
    res.json({ message: 'Producto actualizado' });
});

const deleteProduct = asyncHandler(async (req, res) => {
    // Implementar lógica de eliminación si es necesario
    res.json({ message: 'Producto eliminado' });
});

const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ tienda: req.user._id });
    res.json(products);
});

const createProductReview = asyncHandler(async (req, res) => {
    res.status(201).json({ message: 'Reseña añadida' });
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