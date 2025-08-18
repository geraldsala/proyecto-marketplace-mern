// frontend/src/context/AuthContext.js
import React, { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        userInfo: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        userInfo: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [state.userInfo]);

  const login = (userInfo) => {
    dispatch({ type: 'LOGIN', payload: userInfo });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;