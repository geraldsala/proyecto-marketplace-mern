const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');

// @desc    Crear un nuevo producto
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.tipoUsuario !== 'tienda') {
    res.status(401);
    throw new Error('No autorizado.');
  }
  // CORRECCIÓN: Se crea un producto con todos los campos requeridos por el modelo
  const product = new Product({
    tienda: req.user._id,
    nombre: 'Nuevo Producto (Editar)',
    imagenes: ['/images/sample.jpg'],
    descripcion: 'Añade una descripción detallada aquí.',
    categoria: 'Sin Categoria', // Campo requerido
    precio: 0,
    stock: 0,
    estado: 'nuevo',
    tiempoEnvio: 'A convenir', // Campo requerido
    costoEnvio: 0,
    ubicacion: req.user.direccion, // Campo requerido
    especificacionesTecnicas: { modelo: '', ram: '', compatibilidad: '' },
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Actualizar un producto
const updateProduct = asyncHandler(async (req, res) => {
  const { nombre, precio, descripcion, imagenes, categoria, stock, estado, especificacionesTecnicas } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.tienda.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No autorizado.');
    }
    product.nombre = nombre;
    product.precio = precio;
    product.descripcion = descripcion;
    product.imagenes = imagenes;
    product.categoria = categoria;
    product.stock = stock;
    product.estado = estado;
    product.especificacionesTecnicas = especificacionesTecnicas;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Obtener todos los productos
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('tienda', 'nombreTienda');
  res.json(products);
});

// @desc    Obtener un solo producto por ID
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('tienda', 'nombreTienda');
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Eliminar un producto
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.tienda.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No autorizado.');
    }
    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Obtener los productos de la tienda logueada
const getMyProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ tienda: req.user._id });
    res.json(products);
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getMyProducts };