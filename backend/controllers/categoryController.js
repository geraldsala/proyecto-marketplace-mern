const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel.js');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json({ message: 'Funcionalidad de crear categoría pendiente.' });
});

const updateCategory = asyncHandler(async (req, res) => {
  res.json({ message: 'Funcionalidad de actualizar categoría pendiente.' });
});

const deleteCategory = asyncHandler(async (req, res) => {
  res.json({ message: 'Funcionalidad de eliminar categoría pendiente.' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};