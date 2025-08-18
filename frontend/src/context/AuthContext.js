import React, { createContext, useReducer, useEffect, useContext } from 'react';

const AuthContext = createContext();

// Leemos la información inicial del localStorage
const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

// El reducer maneja las acciones de login y logout
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

// El proveedor que envolverá la aplicación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sincronizamos el estado con localStorage
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
    <AuthContext.Provider value={{ userInfo: state.userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
}

export default AuthContext;
