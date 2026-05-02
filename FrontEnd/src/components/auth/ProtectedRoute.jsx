/**
 * ProtectedRoute.jsx
 * Componente que protege rutas que requieren autenticación.
 * Redirige al login si no hay token válido.
 */

import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Verificar si el token ha expirado
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // Token expirado, limpiar y redirigir
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      delete axios.defaults.headers.common.Authorization;
      return <Navigate to="/login" replace />;
    }

    // Token válido, renderizar el componente
    return children;
  } catch (error) {
    console.error('Error validando token:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
