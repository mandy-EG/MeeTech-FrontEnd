import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const completeGoogleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const message = searchParams.get('message');

      if (error) {
        toast.error(message || 'No fue posible iniciar sesion con Google');
        navigate('/login', { replace: true });
        return;
      }

      if (token) {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      try {
        const response = await axios.get('/auth/me', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });

        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        toast.success('Autenticacion con Google completada');
        navigate('/admin', { replace: true });
      } catch (requestError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        delete axios.defaults.headers.common.Authorization;

        const errorMessage = requestError.response?.data?.message || 'No fue posible validar la sesion';
        toast.error(errorMessage);
        navigate('/login', { replace: true });
      }
    };

    completeGoogleAuth();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-blue-400">Procesando autenticacion</h1>
        <p className="text-gray-300 mt-3">Estamos validando tu cuenta de Google...</p>
        <div className="mt-6">
          <Link to="/login" className="text-blue-400 hover:underline">Volver al login</Link>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
