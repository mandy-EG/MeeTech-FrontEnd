import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

/**
 * TurnoGuard
 * Envuelve módulos operativos (Mesas, Cocina, Caja).
 * Si no hay turno activo, bloquea la vista con un mensaje amigable.
 * Si el usuario es admin (rol 1), le da un botón para ir al módulo de turnos.
 */
const TurnoGuard = ({ children, isAdminDashboard, setActiveSection }) => {
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) setRol(jwtDecode(token).rol);
    } catch {}

    const checkTurno = async () => {
      try {
        const { data } = await axios.get('/turnos/activo');
        setTurnoActivo(data);
      } catch (err) {
        console.error('Error al verificar turno:', err);
      } finally {
        setLoading(false);
      }
    };

    checkTurno();
    const interval = setInterval(checkTurno, 30_000); // Revisa cada 30 seg
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 size={40} className="text-[#0066FF] animate-spin mb-3" />
        <p className="text-gray-500 font-medium">Verificando estado del turno...</p>
      </div>
    );
  }

  // Si hay turno activo, renderiza el contenido (mesas, cocina, caja)
  if (turnoActivo) {
    return <>{children}</>;
  }

  // Si NO hay turno activo, muestra la pantalla de bloqueo
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-2xl mx-auto my-8">
      <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
        <Clock size={48} className="text-amber-500" />
      </div>
      
      <h2 className="text-2xl font-black text-gray-900 mb-2">Turno Cerrado</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Actualmente no hay ningún turno operativo abierto. Las funciones de meseros, cocina y caja están deshabilitadas hasta que el administrador inicie la jornada.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-left w-full">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900">Acción requerida</h4>
          <p className="text-sm text-amber-700 mt-1">
            Si eres cajero o mesero, por favor contacta a tu administrador para que abra el turno en el sistema.
          </p>
        </div>
      </div>

      {(rol === 1 || rol === '1') && isAdminDashboard && (
        <button
          onClick={() => setActiveSection('turnos')}
          className="mt-8 px-6 py-3 bg-[#0066FF] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
        >
          Ir a Gestión de Turnos
        </button>
      )}
    </div>
  );
};

export default TurnoGuard;
