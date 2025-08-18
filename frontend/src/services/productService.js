// frontend/src/services/productService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products/';

// Función para obtener todos los productos
const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

// Función para obtener un producto por su ID
const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    throw error;
  }
};

const productService = {
  getProducts,
  getProductById,
};

export default productService;