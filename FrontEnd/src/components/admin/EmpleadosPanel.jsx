import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Lock, User, Shield, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAlert } from '../../utils/alerts.jsx';

const ROLES = [
  { id: 1, label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  { id: 2, label: 'Mesero', color: 'bg-blue-100 text-blue-700' },
  { id: 3, label: 'Cocinero', color: 'bg-orange-100 text-orange-700' },
  { id: 4, label: 'Caja', color: 'bg-green-100 text-green-700' },
];

const INITIAL_FORM = {
  nombre: '',
  correo: '',
  telefono: '',
  password: '',
  fk_rol_id: '',
};

/**
 * EmpleadosPanel — Gestión completa de empleados
 * Conecta con el backend para CRUD de empleados
 */
const EmpleadosPanel = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Obtener el rol del usuario
  useEffect(() => {
    fetchEmpleados();

    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      setUserRole(JSON.parse(authUser).rol);
    }
  }, []);

  const esAdmin = userRole === 'admin' || userRole === 'Administrador' || userRole === 'administrador' || Number(userRole) === 1;

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/empleados');
      setEmpleados(response.data || []);
    } catch (err) {
      console.error('Error cargando empleados:', err);
      setError(err.response?.data?.message || 'Error al cargar empleados');
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (emp) => {
    setForm({
      nombre: emp.nombre || '',
      correo: emp.correo || '',
      telefono: emp.telefono || '',
      password: '', // Leave empty unless they want to change it
      fk_rol_id: emp.fk_rol_id || '',
    });
    setEditingId(emp.id || emp.id_empleado);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fk_rol_id) {
      setError('Debes seleccionar un rol para el empleado.');
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        fk_rol_id: parseInt(form.fk_rol_id, 10),
      };
      // Solo enviar password si fue escrita
      if (form.password) {
        payload.password = form.password;
      }

      if (editingId) {
        // PUT al backend para actualizar
        await axios.put(`/empleados/${editingId}`, payload);
        setSuccess(`Empleado "${payload.nombre}" actualizado exitosamente.`);
        setEditingId(null);
        toast.success('Empleado actualizado');
      } else {
        // POST al backend para crear empleado
        if (!payload.password) {
          setError('La contraseña inicial es obligatoria para un nuevo empleado.');
          setSubmitLoading(false);
          return;
        }
        await axios.post('/empleados', payload);
        setSuccess(`Empleado "${payload.nombre}" registrado exitosamente.`);
        toast.success('Empleado registrado');
      }

      setForm(INITIAL_FORM);
      // Recargar lista
      fetchEmpleados();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar empleado');
      toast.error('Error al registrar empleado');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEmpleado = async (id) => {
    const confirmed = await confirmAlert(
      '¿Eliminar empleado?',
      '¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.'
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/empleados/${id}`);
      toast.success('Empleado eliminado');
      fetchEmpleados();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al eliminar empleado');
    }
  };

  const selectedRole = ROLES.find((r) => r.id === parseInt(form.fk_rol_id, 10));

  return (
    <div className="space-y-6">
      {/* Formulario de registro */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form card */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <Users size={20} className="text-[#0066FF]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingId ? 'Actualizar Empleado' : 'Registrar Empleado'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId ? 'Modifica los datos del empleado' : 'El personal podrá iniciar sesión con estas credenciales'}
                </p>
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Juan García"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="juan@meetech.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="3001234567"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {editingId ? 'Nueva contraseña (Opcional)' : 'Contraseña inicial'} {editingId ? '' : <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={editingId ? 'Déjalo en blanco para no cambiarla' : 'Mínimo 8 caracteres'}
                    required={!editingId}
                    minLength={8}
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="fk_rol_id" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Rol en el restaurante <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  id="fk_rol_id"
                  name="fk_rol_id"
                  value={form.fk_rol_id}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                           bg-gray-50 appearance-none cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                           transition-colors"
                >
                  <option value="" disabled>— Selecciona un rol —</option>
                  {ROLES.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>

              {selectedRole && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Rol seleccionado:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedRole.color}`}>
                    {selectedRole.label}
                  </span>
                </div>
              )}
            </div>

            {/* Feedback */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading || !esAdmin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold
                       bg-[#0066FF] hover:bg-blue-700 active:scale-95 text-white
                       shadow-md transition-all duration-200 cursor:pointer"
            >
              {submitLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {submitLoading ? (editingId ? 'Actualizando...' : 'Registrando...') : (editingId ? 'Actualizar Empleado' : 'Registrar Empleado')}
            </button>
          </form>
        </div>

        {/* Roles reference */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-[#0066FF]" />
            Roles disponibles
          </h3>
          <div className="space-y-2">
            {ROLES.map(({ id, label, color }) => (
              <div key={id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>
                  {label}
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de empleados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-bold text-gray-900">Empleados Activos</h3>
          <p className="text-xs text-gray-500 mt-0.5">Total: {empleados.filter(e => e.activo !== false).length}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-[#0066FF] animate-spin" />
          </div>
        ) : empleados.length === 0 ? (
          <div className="text-center py-12">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No hay empleados registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Correo</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.filter(emp => emp.activo !== false).map((emp) => {
                  const rolObj = ROLES.find((r) => r.id === emp.fk_rol_id);
                  return (
                    <tr key={emp.id || emp.id_empleado} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{emp.nombre}</td>
                      <td className="px-6 py-3 text-gray-600 text-xs">{emp.correo}</td>
                      <td className="px-6 py-3">
                        {rolObj && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${rolObj.color}`}>
                            {rolObj.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-xs">{emp.telefono || '-'}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(emp)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          {esAdmin && (
                            <button
                              onClick={() => handleDeleteEmpleado(emp.id || emp.id_empleado)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpleadosPanel;
