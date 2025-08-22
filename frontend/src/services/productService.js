// frontend/src/services/productService.js
import axios from 'axios';

const API_URL = '/api/products';       // URL base para productos
const WL_URL  = '/api/users/wishlist'; // URL base para wishlist

// ------- Helpers de Autenticación (sin cambios) -------
function getToken() {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return '';
    const { token } = JSON.parse(raw) || {};
    return token || '';
  } catch {
    return '';
  }
}

function authConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// ================== Productos ==================

/**
 * ✨ NUEVA FUNCIÓN UNIFICADA ✨
 * Obtiene productos desde la API, con filtros opcionales.
 * @param {object} options - Un objeto con los filtros.
 * @param {string} [options.keyword] - Palabra clave para buscar.
 * @param {string} [options.category] - Categoría para filtrar.
 * @returns {Promise<object>} - El objeto de respuesta de la API (ej. { products, page, pages }).
 */
const getProducts = async (options = {}) => {
  // URLSearchParams maneja de forma segura y automática la creación de URLs con parámetros
  const params = new URLSearchParams();

  if (options.keyword) {
    params.append('keyword', options.keyword);
  }
  if (options.category) {
    params.append('category', options.category);
  }
  
  // Hacemos la petición GET con los parámetros construidos
  const { data } = await axios.get(`${API_URL}?${params.toString()}`);
  
  // Devolvemos el objeto completo de la API { products, page, pages }
  return data;
};

const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

const getMyProducts = async () => {
  const config = authConfig();
  const { data } = await axios.get(`${API_URL}/myproducts`, config);
  return Array.isArray(data) ? data : [];
};

const createProduct = async () => {
  const config = authConfig();
  const { data } = await axios.post(API_URL, {}, config);
  return data;
};

const updateProduct = async (id, productData) => {
  const base = authConfig();
  const config = { ...base, headers: { ...(base.headers || {}), 'Content-Type': 'application/json' } };
  const { data } = await axios.put(`${API_URL}/${id}`, productData, config);
  return data;
};

const deleteProduct = async (id) => {
  const config = authConfig();
  await axios.delete(`${API_URL}/${id}`, config);
};

// ================== Wishlist (sin cambios) ==================
const toggleWishlist = async (productId) => {
  const config = authConfig();
  const { data } = await axios.post(WL_URL, { productId }, config);
  return data;
};

const getWishlist = async () => {
  const config = authConfig();
  const { data } = await axios.get(WL_URL, config);
  return Array.isArray(data) ? data : [];
};


// ================== Objeto Exportado ==================
const productService = {
  // Productos
  getProducts, // 🚀 Usamos la nueva función unificada
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // Wishlist
  toggleWishlist,
  getWishlist,
};

export default productService;