import { useState } from 'react';
import {
  LayoutGrid, Users, ShieldCheck, LogOut, BarChart3,
  Package, Settings, ChevronRight, Menu, X,
  ChefHat, Receipt, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'sonner';
import Dashboard from './Dashboard.jsx';
import MesasPanel from './MesasPanel.jsx';
import EmpleadosPanel from './EmpleadosPanel.jsx';
import ProductosPanel from './ProductosPanel.jsx';
import CocinaPanel from '../cocina/CocinaPanel.jsx';
import CajaPanel from '../caja/CajaPanel.jsx';
import TurnoPanel from './TurnoPanel.jsx';
import TurnoGuard from './TurnoGuard.jsx';

// ─────────────────────────────────────────────────────────────
// Helpers de autenticación
// ─────────────────────────────────────────────────────────────
const useAuthProfile = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    // También leemos authUser para obtener nombre real
    const stored = localStorage.getItem('authUser');
    const stored_user = stored ? JSON.parse(stored) : {};
    return {
      nombre: stored_user.nombre || decoded.nombre || 'Administrador',
      email: stored_user.email || decoded.email || '',
      rol: decoded.rol ?? decoded.role ?? 1,
    };
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Definición de secciones del nav lateral
// ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Estadísticas generales' },
  { id: 'mesas', label: 'Gestión de Mesas', icon: LayoutGrid, description: 'CRUD de mesas' },
  { id: 'empleados', label: 'Gestión de Personal', icon: Users, description: 'CRUD de empleados' },
  { id: 'productos', label: 'Productos', icon: Package, description: 'Platos, bebidas y postres' },
  { id: 'cocina', label: 'Cocina', icon: ChefHat, description: 'Órdenes en preparación' },
  { id: 'caja', label: 'Caja', icon: Receipt, description: 'Procesar pagos' },
  { id: 'turnos', label: 'Turnos', icon: Clock, description: 'Gestión de turnos (Admin)' },
];

// ─────────────────────────────────────────────────────────────
// Placeholder de Productos
// ─────────────────────────────────────────────────────────────
const ProductosPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-6">
    <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
      <Package size={40} className="text-gray-400" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo de Productos</h2>
      <p className="text-gray-500 max-w-sm">
        Aquí podrás gestionar el menú del restaurante: crear, actualizar y eliminar productos con sus precios y categorías.
      </p>
    </div>
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 font-medium">
      <Settings size={16} className="animate-spin-slow" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('productos');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hiddenSections, setHiddenSections] = useState([]);
  const navigate = useNavigate();
  const profile = useAuthProfile();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete axios.defaults.headers.common.Authorization;
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  const toggleHideSection = (e, sectionId) => {
    e.stopPropagation();
    setHiddenSections(prev => {
      const next = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      // Si la sección activa se ocultó, cambiar a la primera visible
      if (next.includes(activeSection)) {
        const firstVisible = NAV_SECTIONS.find(s => !next.includes(s.id));
        if (firstVisible) setActiveSection(firstVisible.id);
      }
      return next;
    });
  };

  const currentSection = NAV_SECTIONS.find(s => s.id === activeSection);
  const visibleSections = NAV_SECTIONS.filter(s => !hiddenSections.includes(s.id));

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'mesas': return <TurnoGuard isAdminDashboard setActiveSection={setActiveSection}><MesasPanel /></TurnoGuard>;
      case 'empleados': return <EmpleadosPanel />;
      case 'productos': return <ProductosPanel />;
      case 'cocina': return <TurnoGuard isAdminDashboard setActiveSection={setActiveSection}><CocinaPanel /></TurnoGuard>;
      case 'caja': return <TurnoGuard isAdminDashboard setActiveSection={setActiveSection}><CajaPanel /></TurnoGuard>;
      case 'turnos': return <TurnoPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* ══ MOBILE OVERLAY ══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ SIDEBAR IZQUIERDO ══ */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0066FF] flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Mee<span className="text-[#0066FF]">Tech</span>
            </span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Perfil del usuario */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#0066FF]">
                {(profile?.nombre || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile?.nombre || 'Administrador'}</p>
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mt-0.5">
                Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Módulos
          </p>
          <ul className="space-y-1">
            {visibleSections.map(({ id, label, icon: Icon, description }) => {
              const isActive = activeSection === id;
              const isComingSoon = id === 'productos';
              return (
                <li key={id}>
                  <button
                    onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group text-left
                      ${isActive
                        ? 'bg-[#0066FF]/8 text-[#0066FF] font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#0066FF]" />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`flex-shrink-0 ${isActive ? 'text-[#0066FF]' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{label}</span>
                      {isComingSoon && (
                        <span className="block text-[10px] font-normal text-amber-500 mt-0.5">Próximamente</span>
                      )}
                    </div>
                    {/* Botón X para ocultar sección */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => toggleHideSection(e, id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleHideSection(e, id)}
                      title="Ocultar sección"
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                                 p-0.5 rounded hover:bg-red-100 hover:text-red-500 text-gray-400 ml-auto"
                    >
                      <X size={13} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Secciones ocultas — botón para restaurarlas */}
          {hiddenSections.length > 0 && (
            <div className="mt-4 px-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ocultas</p>
              <div className="space-y-1">
                {NAV_SECTIONS.filter(s => hiddenSections.includes(s.id)).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={(e) => toggleHideSection(e, id)}
                    title="Restaurar sección"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400
                               hover:bg-gray-100 hover:text-gray-600 transition-colors group line-through"
                  >
                    <Icon size={14} className="text-gray-300" />
                    <span className="truncate flex-1 text-left">{label}</span>
                    <span className="text-[10px] text-[#0066FF] opacity-0 group-hover:opacity-100 transition-opacity no-underline font-semibold">
                      Restaurar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Cerrar Sesión */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ══ ÁREA PRINCIPAL ══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-200 z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Burger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-500 hover:text-[#0066FF] hover:bg-blue-50 lg:hidden transition-colors"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span className="hidden sm:block">Panel Admin</span>
              <ChevronRight size={14} className="text-gray-300 hidden sm:block" />
              <span className="font-semibold text-gray-900">{currentSection?.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Sistema activo</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
