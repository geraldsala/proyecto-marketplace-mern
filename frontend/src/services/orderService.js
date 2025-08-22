// frontend/src/services/orderService.js
import api from './api';

const createOrder = async (payload) =>
  (await api.post('/api/orders', payload)).data;

const getOrderById = async (id) =>
  (await api.get(`/api/orders/${id}`)).data;

const getMyOrders = async () => (await api.get('/api/orders/myorders')).data;


export default {
  createOrder,
  getOrderById,
  getMyOrders,
};