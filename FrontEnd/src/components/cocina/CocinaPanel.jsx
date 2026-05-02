import { useState, useEffect, useCallback } from 'react';
import {
  ChefHat, Clock, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, UtensilsCrossed, X,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import TemporizadorPedido from './TemporizadorPedido.jsx';

// ─── Colores por estado ──────────────────────────────────────
const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  en_proceso: { label: 'En Proceso', color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500'  },
};

// ─────────────────────────────────────────────────────────────
// Panel de Cocina
// ─────────────────────────────────────────────────────────────
const CocinaPanel = () => {
  const [pedidos, setPedidos]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [procesando, setProcesando]     = useState({});
  // Para el diálogo de confirmación interno (evita window.confirm)
  const [confirmando, setConfirmando]   = useState(null); // pedido a confirmar

  const fetchPedidos = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get('/pedidos/pendientes');
      setPedidos(data || []);
    } catch (err) {
      console.error('[CocinaPanel] fetchPedidos:', err);
      setError('Error al cargar las órdenes de cocina');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30_000);
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  // ── Marcar en proceso (pendiente → en_proceso) ────────────
  const marcarEnProceso = async (pedido) => {
    if (pedido.estado_nombre === 'en_proceso') return;
    setProcesando(p => ({ ...p, [pedido.id_pedido]: true }));
    try {
      await axios.patch(`/pedidos/${pedido.id_pedido}/estado`, { fk_estado_id: 2 });
      setPedidos(prev => prev.map(p =>
        p.id_pedido === pedido.id_pedido ? { ...p, estado_nombre: 'en_proceso' } : p
      ));
      toast.success(`Mesa ${pedido.mesa_numero} — en preparación`);
    } catch (err) {
      console.error('[CocinaPanel] marcarEnProceso error:', err.response?.data || err.message);
      toast.error(`Error: ${err.response?.data?.error || 'No se pudo actualizar el estado'}`);
    } finally {
      setProcesando(p => ({ ...p, [pedido.id_pedido]: false }));
    }
  };

  // ── Confirmar y marcar como lista ────────────────────────
  const confirmarListo = (pedido) => {
    setConfirmando(pedido); // abre el diálogo interno
  };

  const marcarListo = async () => {
    const pedido = confirmando;
    if (!pedido) return;
    setConfirmando(null);
    setProcesando(p => ({ ...p, [pedido.id_pedido]: true }));
    try {
      await axios.patch(`/pedidos/${pedido.id_pedido}/estado`, { fk_estado_id: 3 }); // 3 = entregado
      setPedidos(prev => prev.filter(p => p.id_pedido !== pedido.id_pedido));
      toast.success(`🍽️ Mesa ${pedido.mesa_numero} — ¡Lista para servir!`);
    } catch (err) {
      console.error('[CocinaPanel] marcarListo error:', err.response?.data || err.message);
      toast.error(`Error: ${err.response?.data?.error || 'No se pudo marcar como lista'}`);
    } finally {
      setProcesando(p => ({ ...p, [pedido.id_pedido]: false }));
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Cocina</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pedidos.length} orden{pedidos.length !== 1 ? 'es' : ''} pendiente{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchPedidos}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                     text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF] transition-all shadow-sm">
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 size={40} className="text-[#0066FF] animate-spin mb-3" />
          <p className="text-gray-500">Cargando órdenes...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={fetchPedidos} className="ml-auto text-sm text-[#0066FF] font-medium hover:underline">
            Reintentar
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <ChefHat size={56} className="text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-500">¡Todo al día!</p>
          <p className="text-sm text-gray-400 mt-1">No hay órdenes pendientes en cocina</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {pedidos.map(pedido => {
            const cfg = ESTADO_CONFIG[pedido.estado_nombre] || ESTADO_CONFIG.pendiente;
            const isProcessing = procesando[pedido.id_pedido];
            return (
              <div
                key={pedido.id_pedido}
                className={`bg-white rounded-xl border-2 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${
                  pedido.estado_nombre === 'en_proceso' ? 'border-blue-300' : 'border-amber-300'
                }`}
              >
                {/* Card header */}
                <div className={`px-4 py-3 flex items-center justify-between ${
                  pedido.estado_nombre === 'en_proceso' ? 'bg-blue-50' : 'bg-amber-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${
                      pedido.estado_nombre === 'en_proceso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pedido.mesa_numero ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Mesa {pedido.mesa_numero ?? '—'}</p>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  
                  {(() => {
                    // Si el backend envía tiempo_estimado_min, lo usa. Si no, usa la fórmula dinámica.
                    const totalItems = pedido.detalles?.reduce((acc, d) => acc + d.cantidad, 0) || 0;
                    const estimatedMin = pedido.tiempo_estimado_min || (10 + (totalItems * 2));
                    
                    return (
                      <TemporizadorPedido
                        createdAt={pedido.created_at}
                        tiempoEstimadoMin={estimatedMin}
                      />
                    );
                  })()}
                </div>

                {/* Items */}
                <div className="flex-1 p-4 space-y-2">
                  {!pedido.detalles?.length ? (
                    <p className="text-xs text-gray-400 italic">Sin items</p>
                  ) : (
                    pedido.detalles.map(d => (
                      <div key={d.id_detalle}
                        className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {d.cantidad}
                          </div>
                          <span className="text-sm text-gray-800 font-medium">{d.producto_nombre}</span>
                        </div>
                        {d.categoria_nombre && (
                          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                            {d.categoria_nombre}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Acciones */}
                <div className="p-4 pt-0 flex gap-2">
                  {pedido.estado_nombre === 'pendiente' && (
                    <button
                      onClick={() => marcarEnProceso(pedido)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold
                                 border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <UtensilsCrossed size={14} />}
                      Preparando
                    </button>
                  )}
                  <button
                    onClick={() => confirmarListo(pedido)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold
                               bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm
                               disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    ¡Lista!
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Diálogo de confirmación (reemplaza window.confirm) ── */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             onClick={() => setConfirmando(null)}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
               onClick={e => e.stopPropagation()}>
            <button onClick={() => setConfirmando(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>

            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              ¿Orden lista?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Marca la orden de{' '}
              <span className="font-bold text-gray-800">Mesa {confirmando.mesa_numero}</span>{' '}
              como lista para servir.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmando(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200
                           text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={marcarListo}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700
                           text-white transition-colors shadow-sm active:scale-[0.98]"
              >
                ¡Marcar lista!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CocinaPanel;
