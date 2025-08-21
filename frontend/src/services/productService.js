// frontend/src/services/productService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';
const WL_URL  = 'http://localhost:5000/api/wishlist';

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

// ------- fallback localStorage -------
const WL_KEY = 'wishlist:ids';
function wlGetSet() {
  try { return new Set(JSON.parse(localStorage.getItem(WL_KEY) || '[]')); }
  catch { return new Set(); }
}
function wlSave(set) {
  localStorage.setItem(WL_KEY, JSON.stringify([...set]));
}

// ================== Productos ==================
const getProducts = async (keyword = '') => {
  const { data } = await axios.get(`${API_URL}?keyword=${encodeURIComponent(keyword)}`);
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
// Comprueba si un producto está en la wishlist
const isInWishlist = async (productId) => {
  const config = authConfig();
  try {
    const { data } = await axios.get(`${WL_URL}/has/${productId}`, config);
    return !!data?.inWishlist;
  } catch {
    // Fallback local
    const set = wlGetSet();
    return set.has(String(productId));
  }
};

// Añade un producto a la wishlist
const addToWishlist = async (productId) => {
  const config = authConfig();
  try {
    await axios.post(`${WL_URL}/${productId}`, {}, config);
    return true;
  } catch {
    // Fallback local
    const set = wlGetSet();
    set.add(String(productId));
    wlSave(set);
    return true;
  }
};

// Quita un producto de la wishlist
const removeFromWishlist = async (productId) => {
  const config = authConfig();
  try {
    await axios.delete(`${WL_URL}/${productId}`, config);
    return true;
  } catch {
    // Fallback local
    const set = wlGetSet();
    set.delete(String(productId));
    wlSave(set);
    return true;
  }
};

// Devuelve la lista de productos en wishlist
const getWishlist = async () => {
  const config = authConfig();
  try {
    const { data } = await axios.get(WL_URL, config);
    return Array.isArray(data) ? data : [];
  } catch {
    // Fallback local: tenemos solo IDs, traemos los productos uno a uno
    const set = wlGetSet();
    const ids = [...set];
    const items = await Promise.all(ids.map((id) => getProductById(id).catch(() => null)));
    return items.filter(Boolean);
  }
};

const productService = {
  // productos
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // wishlist
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};

export default productService;
