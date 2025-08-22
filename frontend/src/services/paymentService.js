// frontend/src/services/paymentService.js

import api from './api';

const API_URL = '/api/payments';

/**
 * Llama a la API de pago ficticia para procesar un pago.
 * @param {object} paymentData - Datos del pago (monto, método, detalles de tarjeta, etc.)
 */
const processPayment = async (paymentData) => {
  const { data } = await api.post(`${API_URL}/process`, paymentData);
  return data; // Devuelve { success: true/false, message: '...', ... }
};

export default {
  processPayment,
};