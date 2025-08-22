// frontend/src/services/orderService.js
import api from './api';

const createOrder = async (payload) => {
  const { data } = await api.post('/api/orders', payload);
  // data = { orderId, orderNumber }
  return data;
};

const getOrderById = async (id) => {
  const { data } = await api.get(`/api/orders/${id}`);
  return data;
};

export default { createOrder, getOrderById };