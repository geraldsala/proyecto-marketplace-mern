import axios from 'axios';

// La URL base de tu API de autenticación
const API_URL = 'http://localhost:5000/api/auth';

// Función para registrar un nuevo usuario
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);

  if (response.data) {
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  return response.data;
};

// Función para iniciar sesión
const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);

    if (response.data) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data;
};

// Función para cerrar sesión
const logout = () => {
    localStorage.removeItem('userInfo');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;