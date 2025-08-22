import api from './api';

/**
 * Productos
 * Hacemos flexible los nombres de query por si tu backend usa 'q/category' o 'search/categoria'.
 */
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

/**
 * Wishlist
 * Ajusta las rutas si tu backend usa otras.
 */
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

/**
 * Suscripciones a tiendas (coinciden con tu backend)
 */
const toggleSubscription = async (storeId) => {
  const { data } = await api.post('/api/storesubscriptions/toggle', { storeId });
  return data; // { message: '...' }
};

const getMySubscriptions = async () => {
  const { data } = await api.get('/api/storesubscriptions/mystores');
  return data; // [{ _id, nombreTienda, fotoLogo }]
};

const getMySubscribers = async () => {
  const { data } = await api.get('/api/storesubscriptions/mysubscribers');
  return data; // [{ _id, nombre, fotoLogo }]
};

/**
 * Newsletter
 */
const subscribeToNewsletter = async (email) => {
  const { data } = await api.post('/api/subscribe/newsletter', { email });
  return data; // { message: '...' }
};

export default {
  getProducts,
  getProductById,
  isInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleSubscription,
  getMySubscriptions,
  getMySubscribers,
  subscribeToNewsletter
};
