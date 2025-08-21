import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

// @desc    Obtener todos los productos
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate('tienda', 'nombreTienda');
  res.json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('tienda', 'nombreTienda');
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Tienda
const createProduct = asyncHandler(async (req, res) => {
  // Verificamos que el usuario logueado sea una tienda
  if (req.user.tipoUsuario !== 'tienda') {
    res.status(401);
    throw new Error('No autorizado. Solo las tiendas pueden crear productos.');
  }

  const product = new Product({
    tienda: req.user._id, // Asignamos la tienda del usuario logueado
    nombre: 'Producto de Ejemplo',
    imagenes: ['/images/sample.jpg'],
    descripcion: 'Descripción de ejemplo',
    categoria: 'Categoría de ejemplo',
    precio: 0,
    stock: 0,
    // ... puedes añadir más campos por defecto o tomarlos del req.body
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Tienda
const updateProduct = asyncHandler(async (req, res) => {
  const { nombre, precio, descripcion, imagenes, categoria, stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Verificación de propiedad: el ID de la tienda del producto debe coincidir con el ID del usuario logueado
    if (product.tienda.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No estás autorizado para editar este producto.');
    }

    product.nombre = nombre || product.nombre;
    product.precio = precio || product.precio;
    product.descripcion = descripcion || product.descripcion;
    product.imagenes = imagenes || product.imagenes;
    product.categoria = categoria || product.categoria;
    product.stock = stock === undefined ? product.stock : stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Tienda
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
     // Verificación de propiedad
    if (product.tienda.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No estás autorizado para eliminar este producto.');
    }
    
    await product.deleteOne();
    res.json({ message: 'Producto eliminado' });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});


export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };