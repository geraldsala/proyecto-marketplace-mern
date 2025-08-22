import api from './api';

const API = '/api/users';

// Auth
const register = async (userData) => {
  const { data } = await api.post(`${API}/register`, userData);
  if (data) localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const login = async (userData) => {
  const { data } = await api.post(`${API}/login`, userData);
  if (data) localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
};

const logout = () => {
  localStorage.removeItem('userInfo');
};

// Perfil
const getProfile = async () => {
  const { data } = await api.get(`${API}/profile`);
  return data;
};

const updateProfile = async (profileData) => {
  const { data } = await api.put(`${API}/profile`, profileData);
  return data;
};

// Direcciones
const addShippingAddress = async (addressData) => {
  const { data } = await api.post(`${API}/addresses`, addressData);
  return data;
};

const deleteShippingAddress = async (addressId) => {
  const { data } = await api.delete(`${API}/addresses/${addressId}`);
  return data;
};

// Métodos de pago
const addPaymentMethod = async (paymentData) => {
  const { data } = await api.post(`${API}/paymentmethods`, paymentData);
  return data;
};

const deletePaymentMethod = async (methodId) => {
  const { data } = await api.delete(`${API}/paymentmethods/${methodId}`);
  return data;
};

// Admin
const getUsers = async () => {
  const { data } = await api.get(API);
  return data;
};

const updateUserRole = async (id, roleData) => {
  const { data } = await api.put(`${API}/${id}/role`, roleData);
  return data;
};

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
  getUsers,
  updateUserRole
};
