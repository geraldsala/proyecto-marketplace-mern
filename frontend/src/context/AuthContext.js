// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
// 1. Ya no se importa axios aquí. ¡El contexto no debe preocuparse por eso!
import userService from '../services/userService'; // 2. Se importa el servicio centralizado.

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => { // Exportamos AuthProvider aquí
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
    setLoading(false);
  }, []);

  // 3. La función register es ahora mucho más simple y correcta
  const register = async (userData) => {
    try {
      // Delega el trabajo pesado al servicio, que ya tiene la URL correcta ('/api/users/register')
      const data = await userService.register(userData);
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data)); // El servicio ya hace esto, pero por si acaso.
    } catch (error) {
      console.error('Error en el registro:', error);
      // Re-lanzamos el error para que el componente del formulario pueda atraparlo y mostrarlo.
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const data = await userService.login({ email, password });
      setUserInfo(data);
      // El servicio ya guarda en localStorage, pero lo dejamos por consistencia.
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  };

  const logout = () => {
    userService.logout(); // El servicio se encarga de limpiar localStorage
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

// Ya no es necesario exportar AuthContext por separado si usamos el hook 'useAuth'