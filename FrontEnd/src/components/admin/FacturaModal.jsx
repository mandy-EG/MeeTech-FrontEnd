import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, Banknote, Landmark, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import axios from '../../config/axiosConfig.js';
import { toast } from 'sonner';

const METODOS = [
  { id: 'Efectivo',      label: 'Efectivo',     icon: Banknote },
  { id: 'Tarjeta',       label: 'Tarjeta',      icon: CreditCard },
  { id: 'Transferencia', label: 'Transferencia',icon: Landmark },
];

export default function FacturaModal({ mesaId, numeroMesa, onClose, onPagado }) {
  const [loading,    setLoading]    = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [datos,      setDatos]      = useState(null);
  const [metodo,     setMetodo]     = useState('Efectivo');
  const [monto,      setMonto]      = useState('');
  const [pagado,     setPagado]     = useState(false);
  const [factura,    setFactura]    = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/facturas/mesa/${mesaId}`);
        if (!data.detalles?.length) {
          toast.error('Esta mesa no tiene productos pendientes de cobro');
          onClose();
          return;
        }
        setDatos(data);
      } catch {
        toast.error('Error al cargar la cuenta');
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [mesaId, onClose]);

  // Enfocar input monto cuando selecciona Efectivo
  useEffect(() => {
    if (metodo === 'Efectivo' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [metodo]);

  const subtotal = datos?.detalles?.reduce((acc, d) => {
    const p = parseFloat(d.precio_venta ?? d.precio_unitario ?? 0);
    return acc + p * (d.cantidad || 1);
  }, 0) ?? 0;

  const IVA_RATE      = 0.19; // 19%
  const SERVICIO_RATE = 0.10; // 10%
  const iva      = subtotal * IVA_RATE;
  const servicio = subtotal * SERVICIO_RATE;
  const total    = subtotal + iva + servicio;

  const cambio = metodo === 'Efectivo' && monto
    ? Math.max(0, parseFloat(monto) - total)
    : 0;

  const puedePagar = !procesando && total > 0 &&
    (metodo !== 'Efectivo' || (parseFloat(monto || 0) >= total));

  const handlePagar = async () => {
    if (!puedePagar) return;
    setProcesando(true);
    try {
      const { data } = await axios.post('/facturas', {
        fk_mesa_id:     mesaId,
        total,
        metodo_pago:    metodo,
        monto_recibido: metodo === 'Efectivo' ? parseFloat(monto) : total,
        cambio:         metodo === 'Efectivo' ? cambio : 0,
      });
      setFactura(data.factura);
      setPagado(true);
      toast.success('¡Pago registrado!');
    } catch {
      toast.error('Error al procesar el pago');
      setProcesando(false);
    }
  };

  // ── OVERLAY ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex" onClick={(e) => e.target === e.currentTarget && !pagado && onClose()}>
      {/* Fondo difuminado */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => !pagado && onClose()} />

      {/* Panel lateral derecho */}
      <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Cobro · Mesa {numeroMesa}</h2>
            {!pagado && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {datos?.detalles?.length} producto{datos?.detalles?.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {!pagado && (
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── CONTENIDO ── */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="text-gray-300 animate-spin" />
          </div>

        ) : pagado ? (
          /* ── ÉXITO ── */
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1">¡Pago Exitoso!</h3>
              <p className="text-gray-400 text-sm mb-6">Factura #{String(factura?.id_factura || '').padStart(6, '0')}</p>

              {/* Resumen rápido */}
              <div className="w-full bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total cobrado</span>
                  <span className="font-bold text-gray-900">${parseFloat(factura?.total || 0).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Método</span>
                  <span className="font-semibold text-gray-900">{factura?.metodo_pago}</span>
                </div>
                {factura?.metodo_pago === 'Efectivo' && factura?.cambio > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cambio</span>
                    <span className="font-bold text-emerald-600">${parseFloat(factura.cambio).toLocaleString('es-CO')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button onClick={() => window.print()}
                className="py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                <Printer size={15} /> Imprimir
              </button>
              <button onClick={onPagado}
                className="py-3 rounded-xl text-sm font-bold text-white bg-[#0066FF] hover:bg-blue-700 transition-colors">
                Finalizar
              </button>
            </div>
          </div>

        ) : (
          /* ── COBRO ── */
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Lista de ítems compacta */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {datos?.detalles?.map((d, i) => {
                const precio = parseFloat(d.precio_venta ?? d.precio_unitario ?? 0);
                return (
                  <div key={i} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{d.producto_nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d.cantidad} × ${precio.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      ${(precio * d.cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desglose: Subtotal, IVA, Servicio, Total */}
            <div className="px-5 py-3 border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700 font-medium">${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IVA (19%)</span>
                <span className="text-gray-700 font-medium">${iva.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Servicio (10%)</span>
                <span className="text-gray-700 font-medium">${servicio.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-gray-900">${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Método de pago — 3 botones compactos */}
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {METODOS.map(m => (
                  <button key={m.id} onClick={() => { setMetodo(m.id); setMonto(''); }}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all
                      ${metodo === m.id
                        ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                    <m.icon size={16} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto (solo efectivo) */}
            {metodo === 'Efectivo' && (
              <div className="px-5 pb-3 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Monto recibido</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                    <input
                      ref={inputRef}
                      type="number"
                      value={monto}
                      onChange={e => setMonto(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900
                                 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                    />
                  </div>
                  {monto && parseFloat(monto) >= total && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Cambio</p>
                      <p className="text-base font-black text-emerald-600">${cambio.toLocaleString('es-CO')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botón cobrar */}
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={handlePagar}
                disabled={!puedePagar}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#0066FF] hover:bg-blue-700
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                {procesando
                  ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                  : `Cobrar $${total.toLocaleString('es-CO')}`
                }
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Animación CSS inline */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}
