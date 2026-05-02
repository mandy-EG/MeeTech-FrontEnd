import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Clock, Play, Square, Loader2, AlertCircle,
  RefreshCw, CheckCircle2, History, Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { confirmAlert } from '../../utils/alerts.jsx';

// ─── Formateo ──────────────────────────────────────────────
const fmtCurrency = (val) =>
  `$${Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const fmtDuration = (seconds) => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const getTokenUser = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const d = jwtDecode(token);
    return { id: d.userId, rol: d.rol };
  } catch { return null; }
};

// ─────────────────────────────────────────────────────────────
// Panel de Turnos
// ─────────────────────────────────────────────────────────────
const TurnoPanel = () => {
  const [activo, setActivo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const usuario = getTokenUser();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [resActivo, resHistorial] = await Promise.all([
        axios.get('/turnos/activo'),
        axios.get('/turnos/historial')
      ]);
      setActivo(resActivo.data);
      setHistorial(resHistorial.data || []);
    } catch (err) {
      console.error('Error fetching turnos:', err);
      setError('Error al cargar la información de turnos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const abrirTurno = async () => {
    const confirmed = await confirmAlert('¿Abrir turno?', '¿Deseas ABRIR un nuevo turno?', 'Sí, abrir turno');
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await axios.post('/turnos/abrir', { cajero_id: usuario?.id });
      toast.success('Turno abierto exitosamente.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al abrir el turno');
    } finally {
      setActionLoading(false);
    }
  };

  const cerrarTurno = async () => {
    const confirmed = await confirmAlert('¿Cerrar turno?', '¿Deseas CERRAR el turno actual?', 'Sí, cerrar turno');
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await axios.patch('/turnos/cerrar', { cajero_id: usuario?.id });
      toast.success('Turno cerrado exitosamente.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cerrar el turno');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 size={40} className="text-[#0066FF] animate-spin mb-3" />
        <p className="text-gray-500">Cargando turnos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle size={20} className="text-red-500 shrink-0" />
        <p className="text-red-700 text-sm">{error}</p>
        <button onClick={fetchData} className="ml-auto text-sm text-[#0066FF] font-medium hover:underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h1>
          <p className="text-gray-500 text-sm mt-1">Controla la apertura y cierre de la jornada.</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                     text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF] transition-all shadow-sm">
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Estado del Turno Actual */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            Estado Actual
          </h2>

          {activo ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Turno Abierto</p>
                <p className="text-sm text-gray-500 mt-1">
                  Iniciado: <span className="font-semibold text-gray-700">{fmtDate(activo.fecha_inicio)}</span>
                </p>
                {activo.cajero_nombre && (
                  <p className="text-xs text-gray-400 mt-1">Por: {activo.cajero_nombre}</p>
                )}
              </div>
              
              <div className="w-full mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={cerrarTurno}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                             bg-red-600 hover:bg-red-700 text-white shadow-md transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} fill="currentColor" />}
                  Cerrar Turno
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-gray-100">
                <Square size={32} className="text-gray-400" fill="currentColor" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">Turno Cerrado</p>
                <p className="text-sm text-gray-500 mt-1">No hay ningún turno activo en este momento.</p>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={abrirTurno}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                             bg-green-600 hover:bg-green-700 text-white shadow-md transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                  Abrir Turno
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Historial de Turnos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
           <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
               <History size={18} className="text-gray-500" />
               Historial Reciente
             </h2>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2">
             {historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <History size={40} className="mb-3 text-gray-300" />
                  <p className="text-sm">No hay turnos registrados</p>
                </div>
             ) : (
               <div className="space-y-2">
                 {historial.map((t) => (
                   <div key={t.id_turno} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Turno #{t.id_turno} {t.fecha_fin === null && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {fmtDate(t.fecha_inicio)} — {t.fecha_fin ? fmtDate(t.fecha_fin) : 'Actual'}
                          </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1">
                          <Clock size={13} className="text-blue-500" />
                          {t.fecha_fin ? fmtDuration(t.duracion_seg) : 'En curso'}
                        </div>
                        {t.cajero_nombre && (
                          <div className="flex items-center gap-1">
                             <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 uppercase">
                               {t.cajero_nombre.charAt(0)}
                             </span>
                             {t.cajero_nombre}
                          </div>
                        )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TurnoPanel;
