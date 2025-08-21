import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor del Contexto
const AuthProvider = ({ children }) => {
  // Estado para guardar la información del usuario
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar la información del usuario desde localStorage al iniciar la app
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    setLoading(false);
  }, []);

  // Función para manejar el login
  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        '/api/auth/login', // Llama a tu endpoint de login del backend
        { email, password },
        config
      );
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      // Manejar el error (ej: mostrar un mensaje al usuario)
      console.error('Error en el login:', error.response.data.message);
      throw error;
    }
  };

  // Función para manejar el registro
  const register = async (userData) => {
    try {
        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const { data } = await axios.post('/api/auth/register', userData, config);
        setUserInfo(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
        console.error('Error en el registro:', error.response.data.message);
        throw error;
    }
  };

  // Función para manejar el logout
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  // 3. Proveer el estado y las funciones a los componentes hijos
  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };