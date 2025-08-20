// frontend/src/services/productService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// --------------------- axios con token (si existe) ---------------------
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (_) {}
  return config;
});

// ---------------------- Productos (lo que ya tenías) --------------------
const PRODUCTS_URL = `${API_BASE}/products/`;

async function getProducts() {
  const { data } = await api.get(PRODUCTS_URL);
  return data;
}

async function getProductById(id) {
  const { data } = await api.get(`${PRODUCTS_URL}${id}`);
  return data;
}

 

const WL_KEY = 'wishlist:ids';

function wlGetSet() {
  try { return new Set(JSON.parse(localStorage.getItem(WL_KEY) || '[]')); }
  catch { return new Set(); }
}
function wlSave(set) {
  localStorage.setItem(WL_KEY, JSON.stringify([...set]));
}

// --------- Util para saber si intentar server-side o no ----------
function hasAuthToken() {
  try {
    const u = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return !!u?.token;
  } catch {
    return false;
  }
}

// --------- Obtener wishlist ----------
async function getWishlist() {
  // 1) Intento server-side si hay token
  if (hasAuthToken()) {
    try {
      const { data } = await api.get('/users/wishlist');
      // data debe ser array de productos completos; si tu backend devuelve solo IDs,
      // acá puedes mapear a productos llamando a getProductById por cada id.
      return Array.isArray(data) ? data : [];
    } catch (_) {
      // cae al fallback
    }
  }

  // 2) Fallback localStorage (IDs)
  const ids = [...wlGetSet()];
  // Trae productos individuales; si son muchos, optimiza con endpoint batch cuando lo tengas
  const prods = [];
  for (const id of ids) {
    try {
      const p = await getProductById(id);
      if (p) prods.push(p);
    } catch (_) {}
  }
  return prods;
}

// --------- Agregar ----------
async function addToWishlist(productId) {
  // 1) Intento server-side
  if (hasAuthToken()) {
    try {
      await api.post(`/users/wishlist/${productId}`);
      return { ok: true, mode: 'server' };
    } catch (_) {
      // cae al fallback
    }
  }

  // 2) Fallback localStorage
  const set = wlGetSet();
  set.add(String(productId));
  wlSave(set);
  return { ok: true, mode: 'local' };
}

// --------- Quitar ----------
async function removeFromWishlist(productId) {
  // 1) Intento server-side
  if (hasAuthToken()) {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      return { ok: true, mode: 'server' };
    } catch (_) {
      // cae al fallback
    }
  }

  // 2) Fallback localStorage
  const set = wlGetSet();
  set.delete(String(productId));
  wlSave(set);
  return { ok: true, mode: 'local' };
}

// --------- Verificar si un producto está en wishlist ----------
async function isInWishlist(productId) {
  // 1) Intento server-side
  if (hasAuthToken()) {
    try {
      const { data } = await api.get(`/users/wishlist`);
      // si tu backend devuelve IDs, ajusta aquí:
      // return Array.isArray(data) && data.includes(String(productId));
      if (Array.isArray(data)) {
        return data.some((p) => String(p._id || p.id) === String(productId));
      }
    } catch (_) {
      // cae al fallback
    }
  }

  // 2) Fallback localStorage
  const set = wlGetSet();
  return set.has(String(productId));
}

const productService = {
  // productos
  getProducts,
  getProductById,
  // wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
};

export default productService;
