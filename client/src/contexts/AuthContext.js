import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configuration axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tombola-backend-api.onrender.com/api';

// Instance axios avec intercepteurs
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// État initial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
};

// Actions
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
    case authActions.REGISTER_START:
    case authActions.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
      };

    case authActions.LOGIN_SUCCESS:
    case authActions.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: action.payload.user.role === 'admin',
        isLoading: false,
      };

    case authActions.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isAdmin: action.payload.user.role === 'admin',
        isLoading: false,
      };

    case authActions.LOGIN_FAILURE:
    case authActions.REGISTER_FAILURE:
    case authActions.LOAD_USER_FAILURE:
    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      };

    case authActions.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: authActions.LOAD_USER_SUCCESS,
          payload: { user: userData }
        });
      } catch (error) {
        console.error('Erreur de parsing des données utilisateur:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: authActions.LOAD_USER_FAILURE });
      }
    } else {
      dispatch({ type: authActions.LOAD_USER_FAILURE });
    }
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: authActions.LOGIN_START });
      
      console.log('🔐 Tentative de connexion avec:', credentials);
      console.log('🌐 URL API:', API_BASE_URL);
      
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Réponse de connexion:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { token, user }
      });
      
      toast.success('Connexion réussie !');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      const message = error.response?.data?.message || 'Erreur de connexion';
      dispatch({ type: authActions.LOGIN_FAILURE });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      dispatch({ type: authActions.REGISTER_START });
      
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: authActions.REGISTER_SUCCESS,
        payload: { token, user }
      });
      
      toast.success('Inscription réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur d\'inscription';
      dispatch({ type: authActions.REGISTER_FAILURE });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: authActions.LOGOUT });
    toast.success('Déconnexion réussie');
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({
        type: authActions.UPDATE_USER,
        payload: updatedUser
      });
      
      toast.success('Profil mis à jour !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de mise à jour';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (passwordData) => {
    try {
      await api.put('/users/change-password', passwordData);
      toast.success('Mot de passe modifié !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de changement de mot de passe';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    api, // Exposer l'instance axios configurée
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
