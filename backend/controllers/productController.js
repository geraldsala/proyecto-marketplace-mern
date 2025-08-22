const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Category = require('../models/categoryModel.js'); 

// @desc    Obtener todos los productos (con filtros opcionales)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;
  const query = {};

  if (keyword) {
    // Búsqueda por nombre o descripción del producto
    query.nombre = { $regex: keyword, $options: 'i' };
  }

  if (category) {
    // Búsqueda por nombre de categoría para encontrar su ID
    const categoryFound = await Category.findOne({ nombre: { $regex: category, $options: 'i' } });
    if (categoryFound) {
      query.categoria = categoryFound._id;
    } else {
      // Si la categoría no existe, no devolvemos productos
      return res.json([]);
    }
  }

  // Usamos .populate() para traer información de los modelos referenciados
  const products = await Product.find(query)
    .populate('tienda', 'nombreTienda fotoLogo') // Trae el nombre y logo de la tienda
    .populate('categoria', 'nombre'); // Trae el nombre de la categoría

  res.json(products);
});

// @desc    Obtener un solo producto por ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('tienda', 'nombreTienda fotoLogo calificacionPromedio')
    .populate('categoria', 'nombre');
    
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Tienda-Admin
const createProduct = asyncHandler(async (req, res) => {
  try {
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
      categoria: defaultCategory._id,
      stock: 0,
      descripcion: 'Descripción de ejemplo',
      ubicacion: 'Ubicación de ejemplo',
      // ¡OJO! Faltaba el campo 'estado' que es requerido
      estado: 'nuevo', 
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {

    console.error('ERROR DETALLADO AL CREAR PRODUCTO:', error); 
    
    res.status(400).json({ message: error.message });
  }
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Tienda-Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Verificamos que la tienda que actualiza sea la dueña del producto
  // O que el usuario sea un admin
  if (product.tienda.toString() !== req.user._id.toString() && req.user.tipoUsuario !== 'admin') {
    res.status(401);
    throw new Error('No autorizado para modificar este producto');
  }

  // Actualizamos todos los campos que vengan en el body
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Devuelve el documento modificado
      runValidators: true, // Corre las validaciones del esquema
  });

  res.json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Tienda-Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }

  // Misma verificación de propiedad que en update
  if (product.tienda.toString() !== req.user._id.toString() && req.user.tipoUsuario !== 'admin') {
    res.status(401);
    throw new Error('No autorizado para eliminar este producto');
  }

  await product.deleteOne();
  res.json({ message: 'Producto eliminado exitosamente' });
});

// @desc    Obtener los productos de la tienda logueada
// @route   GET /api/products/myproducts
// @access  Private/Tienda
const getMyProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ tienda: req.user._id });
  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};