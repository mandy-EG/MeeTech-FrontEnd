import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem('authToken');

  const loadCurrentUser = async () => {
    try {
      const response = await axios.get('/auth/me', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      setUser(response.data.user || null);
      localStorage.setItem('authUser', JSON.stringify(response.data.user || null));
    } catch (error) {
      setUser(null);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo cerrar sesion en el servidor';
      toast.error(message);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      delete axios.defaults.headers.common.Authorization;
      toast.success('Sesion cerrada correctamente');
      navigate('/login');
    }
  };

  const handleProtectedExample = async () => {
    try {
      const response = await axios.get('/auth/protected-example', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      toast.success(response.data.message || 'Acceso a ruta protegida exitoso');
    } catch (error) {
      const message = error.response?.data?.message || 'No autorizado para acceder a la ruta protegida';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <p>Verificando sesion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 flex items-center justify-center">
      <section className="max-w-xl w-full bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-blue-400">Estado de autenticacion</h1>

        {user ? (
          <div className="mt-5 space-y-2">
            <p><strong>Estado:</strong> Logueado</p>
            <p><strong>Nombre:</strong> {user.nombre || 'Sin nombre'}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Google ID:</strong> {user.googleId || 'Cuenta local'}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleProtectedExample}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-300"
              >
                Probar Ruta Protegida
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-300"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p><strong>Estado:</strong> No autenticado</p>
            <p className="mt-2">Inicia sesion para continuar.</p>
            <Link to="/login" className="text-blue-400 hover:underline mt-4 inline-block">Ir al login</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
