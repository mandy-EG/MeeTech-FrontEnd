import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, DollarSign, TrendingUp, Loader2, AlertCircle,
  RefreshCw, LayoutGrid, ShoppingBag, Clock, Receipt,
  ArrowUpRight, ArrowDownRight, Banknote, CreditCard, Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Formateo de moneda ──────────────────────────────────────
const fmt = (val) =>
  `$${Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

// ─── Tiempo relativo ─────────────────────────────────────────
const timeAgo = (fechaStr) => {
  if (!fechaStr) return '—';
  const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
};

const METODO_ICON = {
  efectivo:      { icon: Banknote,    color: 'text-green-600  bg-green-50  border-green-200' },
  tarjeta:       { icon: CreditCard,  color: 'text-blue-600   bg-blue-50   border-blue-200'  },
  transferencia: { icon: Smartphone,  color: 'text-purple-600 bg-purple-50 border-purple-200'},
};

// ─────────────────────────────────────────────────────────────
// Dashboard Principal
// ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats]       = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, facturasRes] = await Promise.all([
        axios.get('/estadisticas'),
        axios.get('/ultimas-facturas'),
      ]);
      setStats(statsRes.data);
      setFacturas(facturasRes.data || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Error al cargar el dashboard');
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 60_000); // refresca cada minuto
    return () => clearInterval(t);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 size={44} className="text-[#0066FF] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-sm">
          <AlertCircle size={44} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-red-900 font-bold mb-2">Error al cargar datos</h3>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button onClick={fetchAll}
            className="px-5 py-2 bg-[#0066FF] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const s = stats || {};

  // ── Tarjetas de métricas ───────────────────────────────────
  const CARDS = [
    {
      label: 'Generado en el Turno',
      sublabel: 'Últimas 8 horas',
      value: fmt(s.ingresosTurno),
      icon: Clock,
      bg: 'bg-gradient-to-br from-[#0066FF] to-blue-700',
      textColor: 'text-white',
      subtextColor: 'text-blue-100',
      valueColor: 'text-white',
      iconBg: 'bg-white/20',
      highlight: true,
    },
    {
      label: 'Generado en el Mes',
      sublabel: (() => {
        const now = new Date();
        return now.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
      })(),
      value: fmt(s.ingresosMensual),
      change: s.variacionIngresos,
      icon: TrendingUp,
      bg: 'bg-white',
      textColor: 'text-gray-500',
      subtextColor: 'text-gray-400',
      valueColor: 'text-gray-900',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border border-gray-200',
    },
    {
      label: 'Órdenes Activas',
      sublabel: 'En cocina ahora',
      value: s.pedidosActivos?.toString() ?? '0',
      icon: ShoppingBag,
      bg: 'bg-white',
      textColor: 'text-gray-500',
      subtextColor: 'text-gray-400',
      valueColor: 'text-gray-900',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border border-gray-200',
    },
    {
      label: 'Mesas Ocupadas',
      sublabel: 'En este momento',
      value: s.mesasOcupadas?.toString() ?? '0',
      icon: LayoutGrid,
      bg: 'bg-white',
      textColor: 'text-gray-500',
      subtextColor: 'text-gray-400',
      valueColor: 'text-gray-900',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      border: 'border border-gray-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen en tiempo real del restaurante
          </p>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium
                     text-gray-600 hover:text-[#0066FF] hover:border-[#0066FF] transition-all shadow-sm self-start sm:self-auto">
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* ── Cards de métricas ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          const isPositive = card.change?.includes('+');
          return (
            <div
              key={i}
              className={`rounded-xl p-5 shadow-sm ${card.bg} ${card.border ?? ''} ${
                card.highlight ? 'shadow-blue-200/60 shadow-lg' : 'hover:shadow-md'
              } transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon size={20} className={card.iconColor ?? 'text-white'} />
                </div>
                {card.change && (
                  <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {isPositive
                      ? <ArrowUpRight size={13} className="mr-0.5" />
                      : <ArrowDownRight size={13} className="mr-0.5" />
                    }
                    {card.change}
                  </span>
                )}
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${card.subtextColor}`}>
                {card.sublabel}
              </p>
              <h3 className={`text-sm font-medium mb-2 ${card.textColor}`}>{card.label}</h3>
              <p className={`text-3xl font-black ${card.valueColor}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Bloque secundario ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Resumen del mes — barra de progreso */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-6">Resumen del Mes</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Pedidos totales', value: s.totalPedidosMes ?? 0, color: 'text-gray-900' },
              { label: 'Pedidos pagados', value: s.pedidosPagados ?? 0, color: 'text-green-700' },
              { label: 'Tasa de cobro', value: `${s.tasaConversion ?? '0.0'}%`, color: 'text-[#0066FF]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Barra de progreso de cobros */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 font-medium mb-2">
              <span>Progreso de cobros del mes</span>
              <span className="font-bold text-[#0066FF]">{s.tasaConversion ?? '0.0'}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0066FF] to-blue-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, parseFloat(s.tasaConversion ?? 0))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{s.pedidosPagados ?? 0} cobrados</span>
              <span>{(s.totalPedidosMes ?? 0) - (s.pedidosPagados ?? 0)} pendientes</span>
            </div>
          </div>

          {/* Separador */}
          <hr className="my-5 border-gray-100" />

          {/* Comparativo turno vs mes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={15} className="text-[#0066FF]" />
                <span className="text-xs font-bold text-[#0066FF] uppercase tracking-wide">Turno (8h)</span>
              </div>
              <p className="text-xl font-black text-gray-900">{fmt(s.ingresosTurno)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {s.ingresosMensual > 0
                  ? `${((s.ingresosTurno / s.ingresosMensual) * 100).toFixed(1)}% del mes`
                  : '0% del mes'}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={15} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Este Mes</span>
              </div>
              <p className="text-xl font-black text-gray-900">{fmt(s.ingresosMensual)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                vs mes anterior: <span className={`font-bold ${
                  s.variacionIngresos?.includes('+') ? 'text-emerald-600' : 'text-red-600'
                }`}>{s.variacionIngresos ?? '+0%'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Últimas transacciones */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Últimas Ventas</h2>
            <Receipt size={18} className="text-gray-400" />
          </div>

          {facturas.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Receipt size={36} className="text-gray-300 mb-3" />
              <p className="text-sm">Sin ventas registradas</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto">
              {facturas.map((f) => {
                const metodoCfg = METODO_ICON[f.metodo_pago] ?? METODO_ICON.efectivo;
                const MetodoIcon = metodoCfg.icon;
                return (
                  <div key={f.id_factura}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${metodoCfg.color}`}>
                        <MetodoIcon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Mesa {f.mesa_numero ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400">{timeAgo(f.created_at)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900">{fmt(f.total)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total rápido */}
          {facturas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-semibold">Total mostrado</span>
              <span className="text-sm font-black text-[#0066FF]">
                {fmt(facturas.reduce((acc, f) => acc + parseFloat(f.total ?? 0), 0))}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
