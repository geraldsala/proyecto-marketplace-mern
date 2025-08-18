import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Creamos el contexto
const ThemeContext = createContext();

// 2. Creamos el Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  // Leemos el tema guardado en localStorage o usamos 'light' por defecto
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Este efecto se ejecuta cada vez que el tema cambia
  useEffect(() => {
    // Aplicamos la clase del tema al body del documento
    document.body.setAttribute('data-theme', theme);
    // Guardamos la preferencia del usuario en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// 3. Hook personalizado para usar el contexto fácilmente
export const useTheme = () => {
  return useContext(ThemeContext);
};