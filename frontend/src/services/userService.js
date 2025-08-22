// frontend/src/services/userService.js

import api from './api';

const API_URL = '/api/users';

// --- Autenticación ---
const register = async (userData) => {
  const { data } = await api.post(`${API_URL}/register`, userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};
const login = async (userData) => {
  const { data } = await api.post(`${API_URL}/login`, userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};
const logout = () => {
  localStorage.removeItem('userInfo');
};

// --- Perfil ---
const getProfile = async () => {
  const { data } = await api.get(`${API_URL}/profile`);
  return data;
};
const updateProfile = async (profileData) => {
  const { data } = await api.put(`${API_URL}/profile`, profileData);
  // Actualizamos también el localStorage con la nueva info
  const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
  const updatedUserInfo = { ...storedUserInfo, ...data };
  localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
  return updatedUserInfo;
};

// --- Direcciones ---
const addShippingAddress = async (addressData) => {
  const { data } = await api.post(`${API_URL}/addresses`, addressData);
  return data;
};
const deleteShippingAddress = async (addressId) => {
  const { data } = await api.delete(`${API_URL}/addresses/${addressId}`);
  return data;
};

// --- Métodos de Pago ---
const addPaymentMethod = async (paymentData) => {
  const { data } = await api.post(`${API_URL}/paymentmethods`, paymentData);
  return data;
};
const deletePaymentMethod = async (methodId) => {
  const { data } = await api.delete(`${API_URL}/paymentmethods/${methodId}`);
  return data;
};

// --- Wishlist ---
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
  return data.inWishlist; // Devuelve true o false
};

// --- Suscripciones a Tiendas ---
const getMySubscriptions = async () => {
    // Suponiendo que la ruta existe en el backend, por ejemplo en storeSubscriptionRoutes
    const { data } = await api.get('/api/storesubscriptions/mystores');
    return data;
};
const toggleSubscription = async (storeId) => {
    // Suponiendo que la ruta existe
    const { data } = await api.post('/api/storesubscriptions/toggle', { storeId });
    return data;
};


// --- Administrador ---
const getUsers = async () => {
  const { data } = await api.get(API_URL);
  return data;
};
const updateUserRole = async (id, roleData) => {
  const { data } = await api.put(`${API_URL}/${id}/role`, roleData);
  return data;
};


// --- Exportación Final ---
export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  addShippingAddress,
  deleteShippingAddress,
  addPaymentMethod,
  deletePaymentMethod,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getMySubscriptions,
  toggleSubscription,
  getUsers,
  updateUserRole
};