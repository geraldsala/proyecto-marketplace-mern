const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.js');
<<<<<<< HEAD
const Category = require('../models/categoryModel.js'); // Importamos el modelo de Categoría
=======
const Category = require('../models/categoryModel.js');
>>>>>>> 059cde66c3216e2912a1691e2a40bf15e4554a34

// @desc    Obtener todos los productos (con filtros opcionales y diagnóstico)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  console.log("\n--- INICIANDO PETICIÓN A /api/products ---");

  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  const queryFilter = {};

  if (req.query.keyword) {
    queryFilter.name = {
      $regex: req.query.keyword,
      $options: "i",
    };
    console.log(`[FILTRO] Palabra clave recibida: "${req.query.keyword}"`);
  }

  if (req.query.category) {
    const categoryName = req.query.category;
    console.log(`[FILTRO] Categoría solicitada: "${categoryName}"`);

    console.log(`   -> Buscando en la colección 'categories' un documento con nombre: "${categoryName}"`);
    const categoryDoc = await Category.findOne({
      nombre: {
        $regex: `^${categoryName}$`,
        $options: "i",
      },
    });

    // ESTE ES EL LOG MÁS IMPORTANTE
    console.log("   -> Resultado de la búsqueda de categoría:", categoryDoc);

    if (categoryDoc) {
      console.log(`   -> ÉXITO: Categoría encontrada. ID: ${categoryDoc._id}`);
      queryFilter.categoria = categoryDoc._id; // Campo 'categoria' del modelo Product
    } else {
      console.log("   -> FALLO: No se encontró ningún documento para esa categoría.");
      console.log("--- PETICIÓN FINALIZADA (Sin resultados) ---\n");
      return res.json({ products: [], page: 1, pages: 0 });
    }
  }

  console.log("[CONSULTA FINAL] Buscando productos con este filtro:", JSON.stringify(queryFilter));
  const count = await Product.countDocuments(queryFilter);
  console.log(`[RESULTADO] Se encontraron ${count} productos en total.`);
  
  const products = await Product.find(queryFilter)
    .populate('categoria', 'nombre')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  console.log(`   -> Devolviendo ${products.length} productos para la página actual.`);
  console.log("--- PETICIÓN FINALIZADA ---\n");

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
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

// @desc    Crear una nueva calificación/comentario para un producto
// @route   POST /api/products/:id/reviews
// @access  Private/Comprador
const createProductReview = asyncHandler(async (req, res) => {
  const { calificacion, comentario } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
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
  createProductReview,
};