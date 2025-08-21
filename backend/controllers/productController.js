const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel.js'); // Asegúrate que la ruta sea correcta
const Category = require('../models/categoryModel.js'); // Importamos el modelo de Categoría

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
  // Ya no necesitamos verificar el rol aquí, el middleware 'authorize' ya lo hizo.
  const {
    nombre,
    precio,
    descripcion,
    categoria, // Ahora recibimos el ID de la categoría
    stock,
    estado,
    imagenes,
    // ...otros campos que vienen del frontend
  } = req.body;

  const product = new Product({
    tienda: req.user._id, // El ID del usuario logueado (la tienda)
    nombre: nombre || 'Producto de Ejemplo',
    precio: precio || 0,
    descripcion: descripcion || 'Descripción de ejemplo',
    categoria, // Asignamos el ID de la categoría
    stock: stock || 0,
    estado: estado || 'nuevo',
    imagenes: imagenes || ['/images/sample.jpg'],
    // Inicializamos otros campos según el modelo
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
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