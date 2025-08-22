// frontend/src/context/CartContext.js (Versión Corregida y Completa)

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error al cargar el carrito desde localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty) => {
    const exist = cartItems.find((x) => x._id === product._id);

    if (exist) {
      // Si el producto ya existe, actualizamos la cantidad
      // Nota: Tu lógica suma la cantidad, lo cual está bien. 
      // Si quieres que la reemplace, sería qty: qty
      setCartItems(
        cartItems.map((x) =>
          x._id === product._id ? { ...exist, qty: exist.qty + qty } : x
        )
      );
    } else {
      // Si no existe, lo agregamos
      setCartItems([...cartItems, { ...product, qty }]);
    }
    // Podemos quitar el alert para una mejor experiencia de usuario, ya que redirigimos a /cart
    // alert('¡Producto agregado al carrito!'); 
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };
  
  // --- FUNCIÓN AÑADIDA ---
  const clearCart = () => {
    setCartItems([]); // Vaciamos el estado
    // También limpiamos el localStorage para que el carrito quede vacío al recargar
    localStorage.removeItem('cart'); 
  };

  // --- VALOR DEL CONTEXTO (INCLUYENDO clearCart) ---
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart, // <-- Añadido aquí
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};