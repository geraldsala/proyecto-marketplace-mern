// frontend/src/context/AuthContext.js

// 1. AÑADIMOS 'useContext' a la línea de importación
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// 2. AÑADIMOS Y EXPORTAMOS LA FUNCIÓN 'useAuth'
//    Esto es lo que solucionará el error de compilación.
export const useAuth = () => {
  return useContext(AuthContext);
};

// De aquí en adelante, su código original se mantiene intacto
const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        '/api/auth/login',
        { email, password },
        config
      );
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      console.error('Error en el login:', error.response.data.message);
      throw error;
    }
  };

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

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };