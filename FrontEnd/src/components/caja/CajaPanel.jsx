import { useState, useEffect, useCallback } from 'react';
import {
  Receipt, Loader2, AlertCircle, RefreshCw,
  CreditCard, Banknote, Smartphone, CheckCircle2,
  X, Users, ShoppingBag,
} from 'lucide-react';
import axios from '../../config/axiosConfig.js';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

// ─── Métodos de pago ─────────────────────────────────────────
const METODOS = [
  { id: 1, label: 'Efectivo',       icon: Banknote,     color: 'text-green-600 border-green-300 bg-green-50'  },
  { id: 2, label: 'Tarjeta',        icon: CreditCard,   color: 'text-blue-600 border-blue-300 bg-blue-50'     },
  { id: 3, label: 'Transferencia',  icon: Smartphone,   color: 'text-purple-600 border-purple-300 bg-purple-50'},
];

const getTokenUser = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const d = jwtDecode(token);
    return { id: d.userId, rol: d.rol };
  } catch { return null; }
};

// ─────────────────────────────────────────────────────────────
// Panel de Caja
// ─────────────────────────────────────────────────────────────
const CajaPanel = () => {
  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);  // pedido seleccionado para cobrar
  const [metodoPago, setMetodoPago] = useState(1);     // 1 = efectivo por defecto
  const [efectivo, setEfectivo]     = useState('');    // monto entregado (para cambio)
  const [procesando, setProcesando] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(null);
  const usuario = getTokenUser();

  const fetchPedidos = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get('/pedidos/caja');
      setPedidos(data || []);
    } catch {
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const t = setInterval(fetchPedidos, 30_000);
    return () => clearInterval(t);
  }, [fetchPedidos]);

  const procesarPago = async () => {
    if (!selected || !metodoPago) return;
    setProcesando(true);
    try {
      const { data } = await axios.post('/facturas', {
        fk_mesa_id: selected.fk_mesa_id,
        total,
        metodo_pago: METODOS.find(m => m.id === metodoPago)?.label || 'Efectivo',
        monto_recibido: metodoPago === 1 ? parseFloat(efectivo || total) : total,
        cambio: metodoPago === 1 ? (cambio || 0) : 0
      });
      toast.success(`✅ Pago procesado — Mesa ${selected.mesa_numero}`);
      setFacturaGenerada(data.factura);
      fetchPedidos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const cerrarExito = () => {
    setFacturaGenerada(null);
    setSelected(null);
    setEfectivo('');
    setMetodoPago(1);
  };

  const subtotal = selected
    ? (selected.detalles || []).reduce((acc, d) =>
        acc + parseFloat(d.precio_unitario || d.precio_venta || 0) * (d.cantidad || 1), 0)
    : 0;

  const IVA_RATE = 0.19;
  const SERVICIO_RATE = 0.10;
  const iva = subtotal * IVA_RATE;
  const servicio = subtotal * SERVICIO_RATE;
  const total = subtotal + iva + servicio;

  const cambio = metodoPago === 1 && efectivo
    ? Math.max(0, parseFloat(efectivo) - total)
    : null;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pedidos.length} orden{pedidos.length !== 1 ? 'es' : ''} pendiente{pedidos.length !== 1 ? 's' : ''} de pago
          </p>
        </div>
        <button onClick={fetchPedidos}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                     text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF] transition-all shadow-sm">
          <RefreshCw size={15} />Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 size={40} className="text-[#0066FF] animate-spin mb-3" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Lista de pedidos ── */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Órdenes a cobrar</h2>
            {pedidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white rounded-xl border border-gray-200">
                <ShoppingBag size={40} className="text-gray-300 mb-3" />
                <p className="text-sm">No hay órdenes pendientes de pago</p>
              </div>
            ) : (
              pedidos.map(p => {
                const subtotal = (p.detalles || []).reduce((acc, d) =>
                  acc + parseFloat(d.precio_unitario || 0) * (d.cantidad || 1), 0);
                const isSelected = selected?.id_pedido === p.id_pedido;
                return (
                  <button
                    key={p.id_pedido}
                    onClick={() => { if (!facturaGenerada) { setSelected(p); setEfectivo(''); } }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-[#0066FF] bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    } ${facturaGenerada ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!!facturaGenerada}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-base ${
                          isSelected ? 'bg-[#0066FF] text-white' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.mesa_numero}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Mesa {p.mesa_numero}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={10} />
                            {p.detalles?.length || 0} item{(p.detalles?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg font-black ${isSelected ? 'text-[#0066FF]' : 'text-gray-900'}`}>
                        ${subtotal.toLocaleString('es-CO')}
                      </span>
                    </div>
                    {/* Preview items */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(p.detalles || []).slice(0, 3).map(d => (
                        <span key={d.id_detalle} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          x{d.cantidad} {d.producto_nombre}
                        </span>
                      ))}
                      {(p.detalles?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400">+{p.detalles.length - 3} más</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ── Panel de cobro ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <Receipt size={48} className="text-gray-300 mb-4" />
                <p className="text-sm font-medium">Selecciona una orden para cobrar</p>
              </div>
            ) : facturaGenerada ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">¡Pago Exitoso!</h3>
                <p className="text-gray-500 font-medium mb-8">Factura #{String(facturaGenerada.id_factura || '').padStart(6, '0')}</p>

                <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mesa</span>
                    <span className="font-bold text-gray-900">{selected.mesa_numero}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total cobrado</span>
                    <span className="font-bold text-[#0066FF]">${parseFloat(facturaGenerada.total || 0).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Método</span>
                    <span className="font-bold text-gray-900">{facturaGenerada.metodo_pago}</span>
                  </div>
                  {facturaGenerada.metodo_pago === 'Efectivo' && facturaGenerada.cambio > 0 && (
                    <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                      <span className="text-gray-500">Cambio devuelto</span>
                      <span className="font-bold text-emerald-600">${parseFloat(facturaGenerada.cambio).toLocaleString('es-CO')}</span>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-sm flex gap-3">
                  <button onClick={() => window.print()}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                    Imprimir
                  </button>
                  <button onClick={cerrarExito}
                    className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0066FF] hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                    Finalizar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Cobrar — Mesa {selected.mesa_numero}</h3>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Detalle de items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Detalle del pedido</p>
                  {(selected.detalles || []).map(d => {
                    const precio = parseFloat(d.precio_unitario || d.precio_venta || 0);
                    return (
                      <div key={d.id_detalle} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700">
                          <span className="font-bold text-gray-900">x{d.cantidad}</span> {d.producto_nombre}
                        </span>
                        <span className="font-semibold text-gray-800">
                          ${(precio * d.cantidad).toLocaleString('es-CO')}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Desglose de Totales */}
                  <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>IVA (19%)</span>
                      <span>${iva.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Servicio (10%)</span>
                      <span>${servicio.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                {/* Método de pago */}
                <div className="p-5 border-t border-gray-200 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Método de pago</p>
                    <div className="flex gap-2">
                      {METODOS.map(({ id, label, icon: Icon, color }) => (
                        <button
                          key={id}
                          onClick={() => { setMetodoPago(id); setEfectivo(''); }}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold
                                      transition-all duration-150 ${
                            metodoPago === id ? color + ' border-current shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Efectivo: campo de monto */}
                  {metodoPago === 1 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Monto recibido
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={efectivo}
                        onChange={e => setEfectivo(e.target.value)}
                        placeholder={`Mínimo $${total.toLocaleString('es-CO')}`}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-gray-50
                                   focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]"
                      />
                      {cambio !== null && cambio >= 0 && (
                        <p className="text-sm font-bold text-green-700 mt-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          Cambio: ${cambio.toLocaleString('es-CO')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total y botón de cobro */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">TOTAL A COBRAR</span>
                    <span className="text-2xl font-black text-gray-900">${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
                  </div>

                  <button
                    onClick={procesarPago}
                    disabled={procesando || (metodoPago === 1 && efectivo && parseFloat(efectivo) < total)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                               bg-[#0066FF] hover:bg-blue-700 text-white shadow-md transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {procesando
                      ? <><Loader2 size={16} className="animate-spin" />Procesando...</>
                      : <><CheckCircle2 size={16} />Procesar Pago</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaPanel;
