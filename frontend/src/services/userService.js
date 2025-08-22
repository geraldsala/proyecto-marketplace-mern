// frontend/src/services/userService.js

import api from './api';

const API_URL = '/api/users';

/**
 * Registra un nuevo usuario con todos los datos del formulario.
 * @param {object} userData - Datos completos del usuario.
 */
const register = async (userData) => {
  const { data } = await api.post(`${API_URL}/register`, userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};

/**
 * Inicia sesión de un usuario.
 * @param {object} userData - { email, password }.
 */
const login = async (userData) => {
  const { data } = await api.post(`${API_URL}/login`, userData);
  if (data) {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }
  return data;
};

/**
 * Cierra la sesión del usuario.
 */
const logout = () => {
  localStorage.removeItem('userInfo');
};

/**
 * Obtiene el perfil del usuario logueado.
 */
const getProfile = async () => {
  const { data } = await api.get(`${API_URL}/profile`);
  return data;
};

/**
 * Actualiza el perfil del usuario logueado.
 * @param {object} profileData - Datos a actualizar.
 */
const updateProfile = async (profileData) => {
  const { data } = await api.put(`${API_URL}/profile`, profileData);
  return data;
};

/**
 * Añade una nueva dirección de envío.
 * @param {object} addressData - Datos de la dirección.
 */
const addShippingAddress = async (addressData) => {
  const { data } = await api.post(`${API_URL}/addresses`, addressData);
  return data;
};

/**
 * Elimina una dirección de envío.
 * @param {string} addressId - ID de la dirección a eliminar.
 */
const deleteShippingAddress = async (addressId) => {
  const { data } = await api.delete(`${API_URL}/addresses/${addressId}`);
  return data;
};

/**
 * Añade un nuevo método de pago.
 * @param {object} paymentData - Datos del método de pago.
 */
const addPaymentMethod = async (paymentData) => {
  const { data } = await api.post(`${API_URL}/paymentmethods`, paymentData);
  return data;
};

/**
 * Elimina un método de pago.
 * @param {string} methodId - ID del método de pago a eliminar.
 */
const deletePaymentMethod = async (methodId) => {
  const { data } = await api.delete(`${API_URL}/paymentmethods/${methodId}`);
  return data;
};

// --- Funciones de Administrador ---

/**
 * Obtiene la lista de todos los usuarios (solo Admin).
 */
const getUsers = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

/**
 * Actualiza el rol de un usuario (solo Admin).
 * @param {string} id - ID del usuario a actualizar.
 * @param {object} roleData - El nuevo rol.
 */
const updateUserRole = async (id, roleData) => {
  const { data } = await api.put(`${API_URL}/${id}/role`, roleData);
  return data;
};

// Exportamos todas las funciones para ser usadas en la aplicación.
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