import { useState, useEffect } from 'react';
import {
  LayoutGrid, Plus, Loader2, CheckCircle2, AlertCircle,
  Hash, Users, Trash2, Edit, X,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { confirmAlert } from '../../utils/alerts.jsx';

const INITIAL_FORM = { numero: '', capacidad: '2' };

/**
 * MesasPanel — CRUD completo de mesas del restaurante.
 * Endpoints usados:
 *  GET    /api/mesas
 *  POST   /api/mesas          { numero, capacidad }
 *  PUT    /api/mesas/:id      { numero, capacidad }
 *  DELETE /api/mesas/:id
 */
const MesasPanel = () => {
  const [form, setForm]               = useState(INITIAL_FORM);
  const [mesas, setMesas]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);

  // ── Carga inicial ──────────────────────────────────────────
  useEffect(() => { fetchMesas(); }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/mesas');
      setMesas(data || []);
    } catch (err) {
      toast.error('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers de formulario ─────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (mesa) => {
    setForm({ numero: mesa.numero.toString(), capacidad: mesa.capacidad.toString() });
    setEditingId(mesa.id_mesa);
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
    const numero   = parseInt(form.numero, 10);
    const capacidad = parseInt(form.capacidad, 10);

    if (!numero || numero < 1) {
      setError('El número de mesa debe ser un entero positivo.');
      return;
    }
    if (!capacidad || capacidad < 1) {
      setError('La capacidad debe ser un entero positivo.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingId) {
        await axios.put(`/mesas/${editingId}`, { numero, capacidad });
        setSuccess(`Mesa #${numero} actualizada correctamente.`);
        toast.success('Mesa actualizada');
        setEditingId(null);
      } else {
        const { data } = await axios.post('/mesas', { numero, capacidad });
        setSuccess(`Mesa #${data.numero ?? numero} creada exitosamente.`);
        toast.success('Mesa creada');
      }
      setForm(INITIAL_FORM);
      fetchMesas();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar la mesa';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, numero) => {
    const confirmed = await confirmAlert(
      '¿Eliminar mesa?',
      `¿Estás seguro de que deseas eliminar la mesa #${numero}?`
    );
    if (!confirmed) return;
    try {
      await axios.delete(`/mesas/${id}`);
      toast.success(`Mesa #${numero} eliminada`);
      fetchMesas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar la mesa');
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Formulario ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Card del formulario */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <LayoutGrid size={20} className="text-[#0066FF]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingId ? 'Actualizar Mesa' : 'Nueva Mesa'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingId ? 'Modifica los datos de la mesa' : 'Se creará con estado "libre"'}
                </p>
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número de mesa */}
            <div>
              <label htmlFor="numero" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Número de Mesa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="numero"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  autoComplete="off"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                />
              </div>
            </div>

            {/* Capacidad */}
            <div>
              <label htmlFor="capacidad" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Capacidad (personas) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="capacidad"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="capacidad"
                  value={form.capacidad}
                  onChange={handleChange}
                  placeholder="Ej: 4"
                  autoComplete="off"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900
                             placeholder:text-gray-400 bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF]
                             transition-colors"
                />
              </div>
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
              type="button"
              onClick={handleSubmit}
              disabled={submitLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold
                         bg-[#0066FF] hover:bg-blue-700 active:scale-[0.98] text-white
                         shadow-md transition-all duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitLoading
                ? (editingId ? 'Actualizando...' : 'Creando...')
                : (editingId ? 'Actualizar Mesa' : 'Crear Mesa')}
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="lg:col-span-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 flex flex-col justify-center items-center text-center gap-4">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <LayoutGrid size={32} className="text-[#0066FF]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-700 mb-1">¿Cómo funciona?</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Cada mesa se crea con estado <span className="font-semibold text-green-600">"libre"</span> por defecto.
              Puedes verla en el plano de mesas del mesero después de agregarla.
            </p>
          </div>
          <div className="flex gap-3 w-full max-w-xs text-left flex-wrap justify-center">
            {[
              { label: 'Crear',    value: 'POST /api/mesas' },
              { label: 'Actualizar', value: 'PUT /api/mesas/:id' },
              { label: 'Eliminar', value: 'DELETE /api/mesas/:id' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-lg border border-gray-200 p-2.5">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xs text-gray-700 font-mono font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lista de Mesas ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Mesas Registradas</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total: {mesas.length} mesa{mesas.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={fetchMesas}
            className="text-xs font-medium text-[#0066FF] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-[#0066FF] animate-spin" />
          </div>
        ) : mesas.length === 0 ? (
          <div className="text-center py-12">
            <LayoutGrid size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No hay mesas registradas aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700"># Mesa</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Capacidad</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((mesa) => (
                  <tr key={mesa.id_mesa} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-gray-900">Mesa {mesa.numero}</td>
                    <td className="px-6 py-3 text-gray-600 flex items-center gap-1.5">
                      <Users size={14} className="text-gray-400" />
                      {mesa.capacidad} personas
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        mesa.estado === 'libre'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mesa.estado === 'libre' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(mesa)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mesa.id_mesa, mesa.numero)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MesasPanel;
