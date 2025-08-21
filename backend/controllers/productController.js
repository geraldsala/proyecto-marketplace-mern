const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Obtener todos los productos O filtrar por palabra clave
// @route   GET /api/products?keyword=...
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // --- INICIO DE LA MODIFICACIÓN ---
  // 1. Verificamos si hay una 'keyword' en la URL (ej: /api/products?keyword=laptop)
  const keyword = req.query.keyword
    ? {
        // 2. Si hay keyword, creamos un objeto de búsqueda para MongoDB
        // Usamos $or para buscar en múltiples campos
        $or: [
          { nombre: { $regex: req.query.keyword, $options: 'i' } }, // Busca en el nombre
          { brand: { $regex: req.query.keyword, $options: 'i' } },  // Busca en la marca
          { categoria: { $regex: req.query.keyword, $options: 'i' } } // Busca en la categoría
        ],
      }
    : {}; // 3. Si no hay keyword, el objeto de búsqueda está vacío (devuelve todo)

  // 4. Pasamos el objeto de búsqueda a la consulta de la base de datos
  const products = await Product.find({ ...keyword }).populate('tienda', 'nombreTienda');
  // --- FIN DE LA MODIFICACIÓN ---
  
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

// @desc    Crear un nuevo producto
const createProduct = asyncHandler(async (req, res) => {
  if (req.user.tipoUsuario !== 'tienda') {
    res.status(401);
    throw new Error('No autorizado.');
  }
  const product = new Product({
    tienda: req.user._id,
    nombre: 'Nuevo Producto',
    brand: 'Sin Marca',
    imagenes: ['/images/sample.jpg'],
    descripcion: 'Añade una descripción detallada aquí.',
    categoria: '',
    precio: 0,
    stock: 0,
    estado: 'nuevo',
    especificacionesTecnicas: { modelo: '', ram: '', compatibilidad: '' },
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Actualizar un producto
const updateProduct = asyncHandler(async (req, res) => {
  const { nombre, brand, precio, descripcion, imagenes, categoria, stock, estado, especificacionesTecnicas } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.tienda.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('No autorizado.');
    }
    product.nombre = nombre;
    product.brand = brand;
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