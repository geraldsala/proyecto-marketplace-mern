// frontend/src/services/api.js
import axios from 'axios';

/**
 * CRA/Webpack con proxy:
 * - En desarrollo, las rutas que empiecen con /api se mandan al backend
 *   en http://localhost:5000 automáticamente gracias al proxy.
 * - En producción, puedes usar REACT_APP_API_URL (ej. https://tu-backend.com).
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

// Inyecta el token automáticamente en cada request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // no-op si el JSON está corrupto
    }
  }
  config.headers.Accept = 'application/json';
  return config;
});

export default api;
