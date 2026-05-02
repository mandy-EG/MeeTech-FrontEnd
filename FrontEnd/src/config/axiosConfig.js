/**
 * axiosConfig.js
 * Configuración centralizada de axios con interceptores
 * para manejar autenticación y errores
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Configurar base URL y credenciales
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// Interceptor de solicitud para inyectar el token dinámicamente en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meetech_token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Asegurar Content-Type (por regla)
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de respuesta
 * Maneja errores 401 (Unauthorized) limpiando el token y redirigiendo al login
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.warn('Token inválido o expirado');
      localStorage.removeItem('meetech_token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
