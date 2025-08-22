// frontend/src/services/productService.js
import api from './api';

const getProducts = async (q = '', category = '') => {
  const params = {};
  if (q) { params.q = q; params.search = q; }
  if (category) { params.category = category; params.categoria = category; }
  const { data } = await api.get('/api/products', { params });
  return data;
};

const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

// ===== Reseñas =====
const addReview = async (id, { rating, comment }) => {
  // Token manual + no-cache por si tu instancia api no lo añade sola
  let headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  };
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      const { token } = JSON.parse(raw) || {};
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch {}

  const { data } = await api.post(
    `/api/products/${id}/reviews`,
    { rating, comment },
    { headers }
  );
  return data; // producto actualizado
};

// ===== Reportes =====
const reportProduct = async (id, { category, detail }) => {
  // En backend solo se incrementa el contador; enviamos category/detail por si en el futuro los usas
  let headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  };
  try {
    const raw = localStorage.getItem('userInfo');
    if (raw) {
      const { token } = JSON.parse(raw) || {};
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch {}

  const { data } = await api.post(
    `/api/products/${id}/report`,
    { category, detail },
    { headers }
  );
  return data; // producto actualizado
};

// ===== Wishlist =====
const isInWishlist = async (productId) => {
  const { data } = await api.get(`/api/users/wishlist/${productId}/status`);
  return !!data?.inWishlist;
};
const addToWishlist = async (productId) => {
  const { data } = await api.post('/api/users/wishlist', { productId });
  return data;
};
const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/api/users/wishlist/${productId}`);
  return data;
};

// ===== Suscripciones =====
const toggleSubscription = async (storeId) => {
  const { data } = await api.post('/api/storesubscriptions/toggle', { storeId });
  return data;
};
const getMySubscriptions = async () => {
  const { data } = await api.get('/api/storesubscriptions/mystores');
  return data;
};
const getMySubscribers = async () => {
  const { data } = await api.get('/api/storesubscriptions/mysubscribers');
  return data;
};

// ===== Newsletter / Crear muestra =====
const subscribeToNewsletter = async (email) => {
  const { data } = await api.post('/api/subscribe/newsletter', { email });
  return data;
};
const createProduct = async () => {
  const { data } = await api.post('/api/products', {});
  return data;
};

export default {
  getProducts,
  getProductById,
  addReview,          // <-- reseñas
  reportProduct,      // <-- NUEVO: reportes
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
  subscribeToNewsletter,
  createProduct,
};
