/**
 * Sidebar.jsx
 * Componente de menú lateral con control de acceso basado en roles (RBAC).
 *
 * Flujo:
 *  1. Lee el token desde localStorage ('authToken').
 *  2. Decodifica el JWT con jwt-decode para extraer el campo `rol`.
 *  3. Filtra el menú según el rol del usuario.
 *  4. Usa NavLink para renderizar condicionalmente los enlaces.
 *  5. Marca el enlace activo con #0066FF.
 *
 * Roles del backend:
 *   1 → Admin      → Ve /admin, /mesas, /cocina, /facturacion
 *   2 → Mesero     → Ve /mesas
 *   3 → Cocinero   → Ve /cocina
 *   4 → Caja       → Ve /facturacion
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import {
  LayoutGrid,
  ChefHat,
  Receipt,
  BarChart3,
  LogOut,
  ShieldCheck,
  Users,
  Settings,
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  {
    label: 'Panel Admin',
    path: '/admin',
    icon: BarChart3,
    roles: [1], // Solo Admin
  },
  {
    label: 'Plano de Mesas',
    path: '/mesas',
    icon: LayoutGrid,
    roles: [1, 2], // Admin y Mesero
  },
  {
    label: 'Cocina',
    path: '/cocina',
    icon: ChefHat,
    roles: [1, 3], // Admin y Cocinero
  },
  {
    label: 'Caja / Facturación',
    path: '/facturacion',
    icon: Receipt,
    roles: [1, 4], // Admin y Cajero
  },
];


// ─────────────────────────────────────────────────────────────
// Hook interno: decodifica el token JWT
// ─────────────────────────────────────────────────────────────
const useAuthProfile = () => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) return null;

    const decoded = jwtDecode(token);

    // Verifica que el token no haya expirado
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;

    return {
      id: decoded.id || decoded.userId || null,
      nombre: decoded.nombre || decoded.name || 'Usuario',
      email: decoded.email || '',
      rol: decoded.rol ?? decoded.role ?? null, // Rol numérico: 1, 2, 3, 4
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Funciones auxiliares
// ─────────────────────────────────────────────────────────────

/** Filtra el menú según el rol del usuario */
const filterNavItems = (rol) => {
  if (rol === null || rol === undefined) return [];
  return ALL_NAV_ITEMS.filter((item) => item.roles.includes(rol));
};

/** Convierte el número de rol a etiqueta legible */
const getRoleLabel = (rol) => {
  const labels = {
    1: 'Administrador',
    2: 'Mesero',
    3: 'Cocinero',
    4: 'Caja',
  };
  return labels[rol] || 'Usuario';
};

/** Retorna el color del badge según el rol */
const getRoleBadgeColor = (rol) => {
  const colors = {
    1: 'bg-purple-100 text-purple-700',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-green-100 text-green-700',
  };
  return colors[rol] || 'bg-gray-100 text-gray-500';
};

// ─────────────────────────────────────────────────────────────
// Componente principal Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar = () => {
  const navigate = useNavigate();
  const profile = useAuthProfile();
  const filteredItems = filterNavItems(profile?.rol);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Limpiar headers de axios
    delete axios.defaults.headers.common.Authorization;
    
    // Redirigir al login
    navigate('/login', { replace: true });
  };

  const rolLabel = getRoleLabel(profile?.rol);
  const rolBadgeClasses = getRoleBadgeColor(profile?.rol);

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      
      {/* ── Logo / Marca ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0066FF] shadow-sm">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Mee<span className="text-[#0066FF]">Tech</span>
        </span>
      </div>

      {/* ── Información del Perfil ── */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          {/* Avatar */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 flex items-center justify-center">
            <span className="text-xs font-bold text-[#0066FF]">
              {(profile?.nombre || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.nombre || 'Sin sesión'}
            </p>
            <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${rolBadgeClasses}`}>
              {rolLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Menú
        </p>

        {filteredItems.length === 0 ? (
          <p className="px-3 py-2 text-xs text-gray-400 italic">
            No tienes acceso a ningún módulo
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredItems.map(({ label, path, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium 
                    transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-[#0066FF]/8 text-[#0066FF] font-semibold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Indicador lateral izquierdo */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#0066FF]" />
                      )}
                      
                      {/* Ícono */}
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`flex-shrink-0 transition-colors ${
                          isActive ? 'text-[#0066FF]' : 'text-gray-500 group-hover:text-gray-700'
                        }`}
                      />
                      
                      {/* Etiqueta */}
                      <span className="truncate flex-1">{label}</span>

                      {/* Indicador puntual derecho */}
                      {isActive && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* ── Divisor ── */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* ── Botón Cerrar Sesión ── */}
      <div className="px-2 py-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                     text-gray-600 hover:bg-red-50 hover:text-red-600
                     transition-all duration-200 group"
          title="Cerrar sesión"
        >
          <LogOut
            size={18}
            strokeWidth={2}
            className="flex-shrink-0 text-gray-500 group-hover:text-red-500 transition-colors"
          />
          <span className="truncate flex-1">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
