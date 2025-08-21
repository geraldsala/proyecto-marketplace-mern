const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel.js');

// @desc    Obtener todas las categorías
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Crear una nueva categoría
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { nombre, descripcion } = req.body;

  const categoryExists = await Category.findOne({ nombre });

  if (categoryExists) {
    res.status(400);
    throw new Error('La categoría ya existe');
  }

  const category = new Category({
    nombre,
    descripcion,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Actualizar una categoría
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { nombre, descripcion } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.nombre = nombre || category.nombre;
    category.descripcion = descripcion || category.descripcion;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
});

// @desc    Eliminar una categoría
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Opcional: Verificar si algún producto usa esta categoría antes de borrar.
    // Por ahora, la eliminaremos directamente.
    await category.deleteOne();
    res.json({ message: 'Categoría eliminada' });
  } else {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
});


module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};