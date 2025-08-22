// frontend/src/services/userService.js

import api from './api';

const API_URL = '/api/users';
const STORES_API = '/api/stores';

// =============== Autenticación ===============
const register = async (userData) => {
  const { data } = await api.post(`${API_URL}/register`, userData);
  if (data) localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const login = async (userData) => {
  const { data } = await api.post(`${API_URL}/login`, userData);
  if (data) localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const logout = () => {
  localStorage.removeItem('userInfo');
};

// =============== Perfil ===============
const getProfile = async () => {
  const { data } = await api.get(`${API_URL}/profile`);
  return data;
};

const updateProfile = async (profileData) => {
  const { data } = await api.put(`${API_URL}/profile`, profileData);
  const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
  const updatedUserInfo = { ...storedUserInfo, ...data };
  localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
  return updatedUserInfo;
};

// =============== Direcciones ===============
const addShippingAddress = async (addressData) => {
  const { data } = await api.post(`${API_URL}/addresses`, addressData);
  return data;
};

const deleteShippingAddress = async (addressId) => {
  const { data } = await api.delete(`${API_URL}/addresses/${addressId}`);
  return data;
};

// =============== Métodos de pago ===============
const addPaymentMethod = async (paymentData) => {
  const { data } = await api.post(`${API_URL}/paymentmethods`, paymentData);
  return data;
};

const deletePaymentMethod = async (methodId) => {
  const { data } = await api.delete(`${API_URL}/paymentmethods/${methodId}`);
  return data;
};

// =============== Wishlist ===============
const getWishlist = async () => {
  const { data } = await api.get(`${API_URL}/wishlist`);
  return data;
};

const addToWishlist = async (productId) => {
  const { data } = await api.post(`${API_URL}/wishlist`, { productId });
  return data;
};

const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`${API_URL}/wishlist/${productId}`);
  return data;
};

const isInWishlist = async (productId) => {
  const { data } = await api.get(`${API_URL}/wishlist/${productId}/status`);
  return data.inWishlist === true;
};

// =============== Tiendas públicas ===============
// --- Listado público de tiendas ---
const getPublicStores = async ({ limit = 12 } = {}) => {
  const { data } = await api.get(`/api/users/stores?limit=${limit}`);
  return (data?.items || []).map(s => ({
    _id: s._id,
    name: s.nombre || s.name,
    slug: s.slug,               // si el backend lo manda
    logoUrl: s.fotoLogo || s.logoUrl || '',
    isActive: s.isActive ?? true,
  }));
};

// 2) Detalle de tienda por SLUG (confirmado: /api/stores/:slug)
const getStoreBySlug = async (slug) => {
  const { data } = await api.get(`${STORES_API}/${slug}`);
  // { _id, name, slug, logoUrl, isActive, ... }
  return data;
};

// 3) (Opcional) Productos de una tienda por SLUG
// GET /api/stores/:slug/products?search=&page=&limit=&sort=
const getStoreProductsBySlug = async (
  slug,
  { search = '', page = 1, limit = 12, sort = 'latest' } = {}
) => {
  const { data } = await api.get(
    `${STORES_API}/${slug}/products?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}&sort=${sort}`
  );
  // { items: [...], total, pages }
  return data;
};

// =============== (Legacy) Tienda pública por id/slug (antiguo) ===============
// Manténlo solo si lo usa código viejo. Recomendado migrar a getStoreBySlug.
const getStorePublicProfile = async (storeIdOrSlug) => {
  const { data } = await api.get(`${STORES_API}/${storeIdOrSlug}`);
  return data;
};

// =============== Suscripciones a tiendas ===============
const getMySubscriptions = async () => {
  const { data } = await api.get(`${API_URL}/subscriptions`);
  return data;
};

const toggleSubscription = async (storeId) => {
  const { data } = await api.post(`${API_URL}/subscriptions`, { storeId });
  return data;
};

// =============== Admin ===============
const getUsers = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

const updateUserRole = async (id, roleData) => {
  const { data } = await api.put(`${API_URL}/${id}/role`, roleData);
  return data;
};





// =============== Exportación ===============
export default {
  // Auth
  register,
  login,
  logout,
  // Perfil
  getProfile,
  updateProfile,
  // Direcciones
  addShippingAddress,
  deleteShippingAddress,
  // Pago
  addPaymentMethod,
  deletePaymentMethod,
  // Wishlist
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  // Tiendas
  getPublicStores,
  getStoreBySlug,
  getStoreProductsBySlug,
  getStorePublicProfile, // legacy
  // Suscripciones
  getMySubscriptions,
  toggleSubscription,
  // Admin
  getUsers,
  updateUserRole,
};
