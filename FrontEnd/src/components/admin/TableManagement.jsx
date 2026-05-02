import { useState, useEffect, useCallback } from 'react';
import {
  LayoutGrid, Users, X, Loader2, AlertCircle,
  Plus, Minus, ShoppingCart, UtensilsCrossed, Coffee, Cake,
  CheckCircle2, Trash2, ChevronLeft, Search, Banknote
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { confirmAlert } from '../../utils/alerts.jsx';
import FacturaModal from './FacturaModal.jsx';

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'todos',  label: 'Todos',   icon: ShoppingCart },
  { id: 1,        label: 'Platos',  icon: UtensilsCrossed },
  { id: 2,        label: 'Bebidas', icon: Coffee },
  { id: 3,        label: 'Postres', icon: Cake },
];

// ─────────────────────────────────────────────────────────────
// Vista del Mesero — Flujo:
//   1. Mapa de mesas
//   2. Click mesa → panel de orden (comanda actual + menú)
//   3. Agregar / eliminar items de la orden
//   4. Cancelar orden (liberar mesa)
// ─────────────────────────────────────────────────────────────
const TableManagement = () => {
  // Estado global
  const [mesas, setMesas]           = useState([]);
  const [productos, setProductos]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  // Estado de la vista activa: 'mapa' | 'orden'
  const [vista, setVista]           = useState('mapa');
  const [mesaActiva, setMesaActiva] = useState(null);
  const [pedidoActivo, setPedidoActivo] = useState(null); // { id_pedido, detalles: [] }
  const [loadingOrden, setLoadingOrden] = useState(false);

  // Menú
  const [catMenu, setCatMenu]       = useState('todos');
  const [cantidades, setCantidades] = useState({}); // { id_producto: cantidad }
  const [searchQuery, setSearchQuery] = useState('');
  const [showFactura, setShowFactura] = useState(false);

  // ── Carga inicial ──────────────────────────────────────────
  const fetchMesas = useCallback(async () => {
    try {
      const { data } = await axios.get('/mesas');
      setMesas(data || []);
    } catch {
      setError('Error al cargar las mesas');
    }
  }, []);

  const fetchProductos = useCallback(async () => {
    try {
      const { data } = await axios.get('/productos/disponibles');
      setProductos(data || []);
    } catch {
      toast.error('Error al cargar el menú');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchMesas(), fetchProductos()]);
      setIsLoading(false);
    };
    init();
  }, [fetchMesas, fetchProductos]);

  // Auto-refresh mesas cada 15s cuando se está en el mapa
  useEffect(() => {
    if (vista !== 'mapa') return;
    const interval = setInterval(fetchMesas, 15000);
    return () => clearInterval(interval);
  }, [vista, fetchMesas]);

  // ── Seleccionar mesa ───────────────────────────────────────
  const abrirMesa = async (mesa) => {
    setMesaActiva(mesa);
    
    if (mesa.estado === 'esperando_pago') {
      setShowFactura(true);
      return;
    }

    setLoadingOrden(true);
    setVista('orden');
    try {
      const { data } = await axios.get(`/pedidos/mesa/${mesa.id_mesa}`);
      setPedidoActivo(data); // puede ser null si no hay pedido activo
    } catch {
      toast.error('Error al cargar la orden');
      setPedidoActivo(null);
    } finally {
      setLoadingOrden(false);
    }
  };

  const volverAlMapa = () => {
    setVista('mapa');
    setMesaActiva(null);
    setPedidoActivo(null);
    setCantidades({});
    setShowFactura(false);
    fetchMesas(); // refrescar estados
  };

  // ── Crear nuevo pedido ─────────────────────────────────────
  const crearPedido = async () => {
    if (!mesaActiva) return;
    try {
      const { data } = await axios.post('/pedidos', {
        fk_mesa_id: mesaActiva.id_mesa,
        fk_estado_id: 1,
      });
      setPedidoActivo({ ...data, detalles: [] });
      // Actualizar estado local de la mesa a ocupada
      setMesas(prev => prev.map(m =>
        m.id_mesa === mesaActiva.id_mesa ? { ...m, estado: 'ocupada' } : m
      ));
      setMesaActiva(prev => ({ ...prev, estado: 'ocupada' }));
      toast.success(`Orden abierta para Mesa ${mesaActiva.numero}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo crear la orden');
    }
  };

  // ── Agregar producto a la orden ────────────────────────────
  const agregarProducto = async (producto) => {
    if (!pedidoActivo) return;
    try {
      const { data } = await axios.post(`/pedidos/${pedidoActivo.id_pedido}/detalles`, {
        fk_producto_id: producto.id_producto,
        cantidad: cantidades[producto.id_producto] || 1,
        precio_unitario: producto.precio_venta,
      });
      setPedidoActivo(prev => ({
        ...prev,
        detalles: [...(prev.detalles || []), {
          ...data,
          producto_nombre: producto.nombre,
          precio_venta: producto.precio_venta,
        }],
      }));
      setCantidades(prev => ({ ...prev, [producto.id_producto]: 1 }));
      toast.success(`${producto.nombre} agregado`);
    } catch {
      toast.error('Error al agregar el producto');
    }
  };

  // ── Eliminar item de la orden ──────────────────────────────
  const eliminarDetalle = async (detalleId, nombre) => {
    try {
      await axios.delete(`/pedidos/detalles/${detalleId}`);
      setPedidoActivo(prev => ({
        ...prev,
        detalles: prev.detalles.filter(d => d.id_detalle !== detalleId),
      }));
      toast.success(`${nombre} eliminado de la orden`);
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  // ── Cancelar / cerrar pedido ───────────────────────────────
  const cerrarPedido = async () => {
    if (!pedidoActivo) return;
    const confirmed = await confirmAlert(
      '¿Cerrar orden?',
      '¿Cerrar/cancelar la orden de esta mesa? Esta acción no se puede deshacer.',
      'Sí, cerrar orden'
    );
    if (!confirmed) return;
    try {
      await axios.patch(`/pedidos/${pedidoActivo.id_pedido}/estado`, { fk_estado_id: 4 }); // 4 = cancelado
      toast.success(`Orden de Mesa ${mesaActiva.numero} cerrada`);
      volverAlMapa();
    } catch {
      toast.error('Error al cerrar la orden');
    }
  };

  const enviarACocina = async () => {
    if (!pedidoActivo || !pedidoActivo.detalles?.length) return;
    try {
      await axios.patch(`/pedidos/${pedidoActivo.id_pedido}/estado`, { fk_estado_id: 2 }); // 2 = en_proceso
      setPedidoActivo(prev => ({ ...prev, estado_nombre: 'en_proceso' }));
      toast.success(`🍳 Orden de Mesa ${mesaActiva.numero} enviada a cocina`);
    } catch {
      toast.error('Error al enviar a cocina');
    }
  };

  const pedirCuenta = async () => {
    if (!pedidoActivo) return;
    const confirmed = await confirmAlert(
      '¿Pedir cuenta?',
      'Se solicitará la cuenta para esta mesa.',
      'Sí, pedir cuenta'
    );
    if (!confirmed) return;
    try {
      await axios.patch(`/pedidos/${pedidoActivo.id_pedido}/estado`, { fk_estado_id: 5 }); // 5 = esperando_pago
      setPedidoActivo(prev => ({ ...prev, estado_nombre: 'esperando_pago' }));
      // Actualizar estado local de la mesa
      setMesas(prev => prev.map(m =>
        m.id_mesa === mesaActiva.id_mesa ? { ...m, estado: 'esperando_pago' } : m
      ));
      setMesaActiva(prev => ({ ...prev, estado: 'esperando_pago' }));
      toast.success(`💳 Cuenta solicitada para Mesa ${mesaActiva.numero}`);
    } catch {
      toast.error('Error al solicitar la cuenta');
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const setCantidad = (productoId, delta) => {
    setCantidades(prev => ({
      ...prev,
      [productoId]: Math.max(1, (prev[productoId] || 1) + delta),
    }));
  };

  const totalOrden = (pedidoActivo?.detalles || []).reduce((acc, d) =>
    acc + (parseFloat(d.precio_unitario || d.precio_venta || 0) * (d.cantidad || 1)), 0
  );

  const productosFiltrados = productos.filter(p => {
    const matchesTab = catMenu === 'todos' || p.fk_categoria_id === catMenu;
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ══════════════════════════════════════════════════════════════
  // HELPER — SILLAS DINÁMICAS (Eliminado por diseño minimalista)
  // ══════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════
  // RENDER — MAPA DE MESAS
  // ══════════════════════════════════════════════════════════════
  if (vista === 'mapa') {

    const libres   = mesas.filter(m => m.estado === 'libre').length;
    const ocupadas = mesas.filter(m => m.estado !== 'libre' && m.estado !== 'esperando_pago').length;
    const porPagar = mesas.filter(m => m.estado === 'esperando_pago').length;

    return (
      <div className="min-h-screen -m-6 lg:-m-8">
        {showFactura && mesaActiva && (
          <FacturaModal
            mesaId={mesaActiva.id_mesa}
            numeroMesa={mesaActiva.numero}
            onClose={() => setShowFactura(false)}
            onPagado={volverAlMapa}
          />
        )}

        {/* ── HEADER del salón ──────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Plano del Salón</h1>
              <p className="text-sm text-gray-400 mt-0.5 font-medium">Vista en tiempo real · actualiza cada 15 s</p>
            </div>

            {/* Contadores de estado */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">{libres} Libre{libres !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-bold text-red-700">{ocupadas} Ocupada{ocupadas !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-sm font-bold text-amber-700">{porPagar} Por Pagar</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ÁREA DEL SALÓN ─────────────────────────────── */}
        <div className="bg-gray-50 min-h-[calc(100vh-140px)] p-6 lg:p-10"
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px' }}>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Loader2 size={44} className="text-gray-400 animate-spin" />
              <p className="text-gray-400 mt-4 text-sm font-medium">Cargando salón...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center max-w-sm shadow-sm">
                <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
                <p className="text-gray-600 text-sm mb-5">{error}</p>
                <button onClick={() => { setError(null); fetchMesas(); }}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-colors">
                  Reintentar
                </button>
              </div>
            </div>
          ) : mesas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <LayoutGrid size={40} className="text-gray-300 mb-4" />
              <p className="text-gray-400 font-medium">No hay mesas configuradas</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 lg:gap-8 items-start justify-center lg:justify-start content-start">
              {mesas.map(mesa => {
                const esLibre       = mesa.estado === 'libre';
                const esPorPagar    = mesa.estado === 'esperando_pago';
                const esOcupada     = !esLibre && !esPorPagar;

                return (
                  <button
                    key={mesa.id_mesa}
                    onClick={() => abrirMesa(mesa)}
                    className="group relative focus:outline-none"
                    style={{ width: 160, height: 170 }}
                  >
                    {/* Glow de fondo animado */}
                    <div className={`absolute inset-0 rounded-[1.75rem] blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500
                      ${esLibre ? 'bg-emerald-400' : esPorPagar ? 'bg-amber-400' : 'bg-[#0066FF]'}
                    `} style={{ transform: 'scale(0.85)', top: 10, left: 10, right: 10, bottom: -6 }} />

                    {/* Card principal */}
                    <div className={`relative w-full h-full rounded-[1.75rem] flex flex-col items-center justify-center overflow-hidden
                      border-2 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl bg-white
                      ${esLibre
                        ? 'border-gray-200 group-hover:border-emerald-400 group-hover:shadow-emerald-100'
                        : esPorPagar
                          ? 'border-amber-300 group-hover:border-amber-400 group-hover:shadow-amber-100'
                          : 'border-blue-200 group-hover:border-[#0066FF] group-hover:shadow-blue-100'
                      }
                    `}>

                      {/* Indicador de color superior */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-1 w-16 rounded-b-full transition-all duration-300
                        ${esLibre
                          ? 'bg-emerald-500 group-hover:w-24'
                          : esPorPagar
                            ? 'bg-amber-400 group-hover:w-24'
                            : 'bg-[#0066FF] group-hover:w-24'
                        }
                      `} />

                      {/* Badge Capacidad */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100">
                        <Users size={10} className="text-gray-400" />
                        <span className="text-gray-500 text-xs font-semibold">{mesa.capacidad}</span>
                      </div>

                      {/* Número de mesa */}
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Mesa</span>
                        <span className={`text-5xl font-black leading-none
                          ${esLibre ? 'text-gray-800' : esPorPagar ? 'text-amber-500' : 'text-[#0066FF]'}
                        `}>
                          {mesa.numero}
                        </span>
                      </div>

                      {/* Estado en texto */}
                      <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                        ${esLibre
                          ? 'bg-emerald-50 text-emerald-600'
                          : esPorPagar
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-blue-50 text-[#0066FF]'
                        }
                      `}>
                        {esLibre ? 'Disponible' : esPorPagar ? 'Por Pagar' : 'Ocupada'}
                      </div>

                      {/* Hover CTA */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[1.75rem]"
                           style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 60%)' }}>
                        <span className={`absolute bottom-5 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest
                          ${esLibre ? 'text-emerald-600' : esPorPagar ? 'text-amber-600' : 'text-[#0066FF]'}
                        `}>
                          {esPorPagar ? <Banknote size={14} /> : <ShoppingCart size={14} />}
                          {esPorPagar ? 'Cobrar' : 'Gestionar'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }


  // ══════════════════════════════════════════════════════════════
  // RENDER — GESTIÓN DE ORDEN
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] lg:h-[calc(100vh-180px)] pb-10 lg:pb-0">

      {/* ── COLUMNA IZQUIERDA: Menú de productos ─────────────── */}
      <div className="flex-[2] flex-shrink-0 lg:flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden h-[60vh] lg:h-auto">

        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <button
            onClick={volverAlMapa}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-none">Mesa {mesaActiva?.numero}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Selecciona productos</p>
          </div>
        </div>

        {/* Filtros: Tabs y Búsqueda */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 gap-3">
          <div className="flex gap-1">
            {CATEGORIAS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCatMenu(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  catMenu === id
                    ? 'bg-[#0066FF] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pl-8 pr-3 py-1.5 bg-gray-100 border-0 rounded-lg text-sm text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ShoppingCart size={28} className="text-gray-300 mb-2" />
              <p className="text-sm">Sin resultados</p>
            </div>
          ) : (
            productosFiltrados.map(prod => (
              <div key={prod.id_producto}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/80 transition-colors">
                <div className="flex-1 mr-4 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{prod.nombre}</p>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    ${parseFloat(prod.precio_venta).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Stepper de cantidad */}
                  <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCantidad(prod.id_producto, -1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">
                      {cantidades[prod.id_producto] || 1}
                    </span>
                    <button
                      onClick={() => setCantidad(prod.id_producto, 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  {/* Botón agregar */}
                  <button
                    onClick={() => agregarProducto(prod)}
                    disabled={!pedidoActivo}
                    className="w-8 h-8 bg-[#0066FF] text-white rounded-lg flex items-center justify-center
                               hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── COLUMNA DERECHA: Comanda activa ──────────────────── */}
      <div className="w-full lg:w-72 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden flex-shrink-0 min-h-[40vh] lg:min-h-0">

        {/* Header comanda */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Comanda</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              pedidoActivo?.estado_nombre === 'en_proceso'
                ? 'bg-amber-100 text-amber-700'
                : pedidoActivo?.estado_nombre === 'esperando_pago'
                  ? 'bg-blue-100 text-blue-700'
                  : pedidoActivo?.estado_nombre === 'entregado'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
            }`}>
              {pedidoActivo?.estado_nombre
                ? pedidoActivo.estado_nombre.replace('_', ' ')
                : `Mesa ${mesaActiva?.numero}`}
            </span>
          </div>
        </div>

        {/* Cuerpo de la comanda */}
        <div className="flex-1 overflow-y-auto">
          {loadingOrden ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="text-gray-400 animate-spin" />
            </div>
          ) : !pedidoActivo ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-10 px-5">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={24} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Sin orden activa</p>
                <p className="text-xs text-gray-400 mt-1">Abre una orden para empezar</p>
              </div>
              <button
                onClick={crearPedido}
                className="w-full py-2.5 bg-[#0066FF] text-white rounded-xl text-sm font-semibold
                           hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={15} />
                Abrir Orden
              </button>
            </div>
          ) : pedidoActivo.detalles?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <UtensilsCrossed size={22} className="text-gray-300" />
              <p className="text-sm text-gray-400">Orden vacía</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 px-4 py-2">
              {pedidoActivo.detalles.map(d => (
                <div key={d.id_detalle}
                  className="flex items-center justify-between py-3 group">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{d.producto_nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.cantidad} × ${parseFloat(d.precio_unitario || d.precio_venta || 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      ${(parseFloat(d.precio_unitario || d.precio_venta || 0) * (d.cantidad || 1)).toLocaleString('es-CO')}
                    </span>
                    {pedidoActivo.estado_nombre !== 'en_proceso' && pedidoActivo.estado_nombre !== 'esperando_pago' && (
                      <button
                        onClick={() => eliminarDetalle(d.id_detalle, d.producto_nombre)}
                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con total y acciones */}
        {pedidoActivo && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total</span>
              <span className="text-xl font-black text-gray-900">${totalOrden.toLocaleString('es-CO')}</span>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={cerrarPedido}
                disabled={pedidoActivo?.estado_nombre === 'en_proceso' || pedidoActivo?.estado_nombre === 'esperando_pago'}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600
                           hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>

              {pedidoActivo?.estado_nombre === 'en_proceso' ? (
                <button disabled
                  className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700 cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <UtensilsCrossed size={14} />
                  En Cocina
                </button>
              ) : pedidoActivo?.estado_nombre === 'esperando_pago' ? (
                <button
                  onClick={() => setShowFactura(true)}
                  className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Banknote size={14} />
                  Cobrar
                </button>
              ) : pedidoActivo?.estado_nombre === 'entregado' ? (
                <button
                  onClick={pedirCuenta}
                  className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Banknote size={14} />
                  Pedir Cuenta
                </button>
              ) : (
                <button
                  onClick={enviarACocina}
                  disabled={!pedidoActivo?.detalles?.length}
                  className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-[#0066FF] hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={14} />
                  Enviar a Cocina
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableManagement;

