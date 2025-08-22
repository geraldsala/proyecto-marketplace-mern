// frontend/src/services/orderService.js

import api from './api';

const API_URL = '/api/orders';

/**
 * Crea una nueva orden en el backend.
 * @param {object} orderData - Datos completos de la orden.
 */
const createOrder = async (orderData) => {
  const { data } = await api.post(API_URL, orderData);
  return data;
};

export default {
  createOrder,
};