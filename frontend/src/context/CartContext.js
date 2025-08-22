// frontend/src/context/CartContext.js

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
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty) => {
    const exist = cartItems.find((x) => x._id === product._id);

    if (exist) {
      setCartItems(
        cartItems.map((x) =>
          x._id === product._id ? { ...exist, qty: exist.qty + qty } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty }]);
    }
    alert('¡Producto agregado al carrito!');
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};