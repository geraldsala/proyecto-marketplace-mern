import axios from 'axios';

const API_URL = '/api/products'; // Usamos rutas relativas para que el proxy funcione
const WL_URL  = '/api/users/wishlist'; // Apuntamos a la ruta de wishlist correcta

// ------- helpers auth -------
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
const getProducts = async (keyword = '') => {
  const { data } = await axios.get(`${API_URL}?keyword=${encodeURIComponent(keyword)}`);
  return data;
};

// --- FUNCIÓN AÑADIDA ---
// Pide al backend solo los productos de una categoría específica
const getProductsByCategory = async (categoryName) => {
  const { data } = await axios.get(`${API_URL}?category=${encodeURIComponent(categoryName)}`);
  return data;
};

const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

const getMyProducts = async () => {
  const config = authConfig();
  const { data } = await axios.get(`${API_URL}/myproducts`, config);
  return data;
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

// ================== Wishlist ==================
// (Tu lógica de wishlist se mantiene, pero apuntando a la ruta correcta)

// Añade o quita un producto de la wishlist
const toggleWishlist = async (productId) => {
    const config = authConfig();
    const { data } = await axios.post(WL_URL, { productId }, config);
    return data;
};

// Devuelve la lista de productos en wishlist
const getWishlist = async () => {
  const config = authConfig();
  const { data } = await axios.get(WL_URL, config);
  return Array.isArray(data) ? data : [];
};

const productService = {
  // productos
  getProducts,
  getProductsByCategory, // <-- Exportamos la nueva función
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // wishlist
  toggleWishlist,
  getWishlist,
};

export default productService;
