// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');

/**
 * @desc    Obtener todas las categorías
 * @route   GET /api/categories
 * @access  Público
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Buscar todas las categorías en la base de datos
    const categories = await Category.find({});

    // Enviar las categorías como una respuesta JSON
    res.json(categories);
  })
);

module.exports = router;