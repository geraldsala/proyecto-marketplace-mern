// frontend/src/services/userService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// --- Funciones de Autenticación ---
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('userInfo');
};

// --- Funciones de Perfil ---
const getProfile = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get(`${API_URL}/profile`, config);
  return data;
};

const updateProfile = async (profileData, token) => {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const { data } = await axios.put(`${API_URL}/profile`, profileData, config);
    return data;
}

// --- Funciones de Direcciones ---
const addShippingAddress = async (addressData, token) => {
  const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const { data } = await axios.post(`${API_URL}/addresses`, addressData, config);
  return data;
};

const deleteShippingAddress = async (addressId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.delete(`${API_URL}/addresses/${addressId}`, config);
  return data;
};

// --- Funciones de Métodos de Pago ---
const addPaymentMethod = async (paymentData, token) => {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${API_URL}/paymentmethods`, paymentData, config);
    return data;
};

const deletePaymentMethod = async (methodId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.delete(`${API_URL}/paymentmethods/${methodId}`, config);
    return data;
};

// --- Funciones de Admin ---
const getUsers = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(API_URL, config);
    return data;
};

const updateUserRole = async (id, roleData, token) => {
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
    const { data } = await axios.put(`${API_URL}/${id}/role`, roleData, config);
    return data;
};

// --- Objeto de Servicio Unificado ---
const userService = {
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

export default userService;