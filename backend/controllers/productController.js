const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const Category = require('../models/categoryModel.js');

// ... (todas tus funciones existentes como getProducts, getProductById, etc. se mantienen aquí)

// @desc    Obtener todos los productos (con filtros opcionales)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;
  const query = {};

  if (keyword) {
    query.nombre = { $regex: keyword, $options: 'i' };
  }

  if (category) {
    const categoryFound = await Category.findOne({ nombre: { $regex: category, $options: 'i' } });
    if (categoryFound) {
      query.categoria = categoryFound._id;
    } else {
      return res.json([]);
    }
  }

  const products = await Product.find(query)
    .populate('tienda', 'nombreTienda fotoLogo')
    .populate('categoria', 'nombre');

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
  const { nombre, precio, descripcion, categoria, stock, estado, imagenes } = req.body;

  const product = new Product({
    tienda: req.user._id,
    nombre: nombre || 'Producto de Ejemplo',
    precio: precio || 0,
    descripcion: descripcion || 'Descripción de ejemplo',
    categoria,
    stock: stock || 0,
    estado: estado || 'nuevo',
    imagenes: imagenes || ['/images/sample.jpg'],
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
    res.status(404); throw new Error('Producto no encontrado');
  }

  if (product.tienda.toString() !== req.user._id.toString() && req.user.tipoUsuario !== 'admin') {
    res.status(401); throw new Error('No autorizado para modificar este producto');
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
  });

  res.json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Tienda-Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404); throw new Error('Producto no encontrado');
  }

  if (product.tienda.toString() !== req.user._id.toString() && req.user.tipoUsuario !== 'admin') {
    res.status(401); throw new Error('No autorizado para eliminar este producto');
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


// --- NUEVA FUNCIÓN ---
// @desc    Crear una nueva calificación/comentario para un producto
// @route   POST /api/products/:id/reviews
// @access  Private/Comprador
const createProductReview = asyncHandler(async (req, res) => {
  const { calificacion, comentario } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Verificamos si el usuario ya ha calificado este producto
    const alreadyReviewed = product.calificaciones.find(
      (r) => r.usuario.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Ya has calificado este producto');
    }

    const review = {
      nombre: req.user.nombreCompleto,
      calificacion: Number(calificacion),
      comentario,
      usuario: req.user._id,
    };

    product.calificaciones.push(review);
    product.numCalificaciones = product.calificaciones.length;
    product.calificacionPromedio =
      product.calificaciones.reduce((acc, item) => item.calificacion + acc, 0) /
      product.calificaciones.length;

    await product.save();
    res.status(201).json({ message: 'Calificación agregada' });
  } else {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
});


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  createProductReview, // <-- Exportamos la nueva función
};