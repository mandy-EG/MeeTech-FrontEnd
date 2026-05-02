import { useState, useEffect } from 'react';
import {
  Package, Plus, Loader2, CheckCircle2, AlertCircle,
  Trash2, Edit, UtensilsCrossed, Coffee, Cake, DollarSign, ToggleLeft, ToggleRight, Search
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { confirmAlert } from '../../utils/alerts.jsx';

// ─────────────────────────────────────────────────────────────
// Categorías fijas del restaurante (IDs deben coincidir con la BD)
// ─────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 1, label: 'Platos',   icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 2, label: 'Bebidas',  icon: Coffee,          color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 3, label: 'Postres',  icon: Cake,            color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const INITIAL_FORM = {
  nombre: '',
  descripcion: '',
  precio_venta: '',
  disponible: true,
  fk_categoria_id: '1',
};

const ProductosPanel = () => {
  const [productos, setProductos]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form, setForm]                 = useState(INITIAL_FORM);
  const [editingId, setEditingId]       = useState(null);
  const [error, setError]               = useState(null);
  const [success, setSuccess]           = useState(null);
  const [activeTab, setActiveTab]       = useState(1); // filtro por categoría
  const [searchQuery, setSearchQuery]   = useState('');

  useEffect(() => { fetchProductos(); }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/productos');
      setProductos(data || []);
    } catch {
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (p) => {
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio_venta: p.precio_venta?.toString() || '',
      disponible: p.disponible ?? true,
      fk_categoria_id: p.fk_categoria_id?.toString() || '1',
    });
    setEditingId(p.id_producto);
    setActiveTab(p.fk_categoria_id || 1);
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

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre del producto es obligatorio.'); return; }
    const precio = parseFloat(form.precio_venta);
    if (!precio || precio <= 0) { setError('El precio debe ser un número mayor a 0.'); return; }

    setSubmitLoading(true);
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio_venta: precio,
      disponible: form.disponible,
      fk_categoria_id: parseInt(form.fk_categoria_id, 10),
    };

    try {
      if (editingId) {
        await axios.put(`/productos/${editingId}`, payload);
        setSuccess(`"${payload.nombre}" actualizado correctamente.`);
        toast.success('Producto actualizado');
        setEditingId(null);
      } else {
        await axios.post('/productos', payload);
        setSuccess(`"${payload.nombre}" creado exitosamente.`);
        toast.success('Producto creado');
      }
      setForm(INITIAL_FORM);
      fetchProductos();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar el producto';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    const confirmed = await confirmAlert(
      '¿Eliminar producto?',
      `¿Eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      await axios.delete(`/productos/${id}`);
      toast.success(`"${nombre}" eliminado`);
      fetchProductos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleToggleDisponible = async (p) => {
    try {
      await axios.put(`/productos/${p.id_producto}`, { ...p, disponible: !p.disponible });
      fetchProductos();
      toast.success(`${p.nombre} marcado como ${!p.disponible ? 'disponible' : 'no disponible'}`);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const filteredProductos = productos.filter(p => 
    p.fk_categoria_id === activeTab && 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const catActiva = CATEGORIAS.find(c => c.id === activeTab);

  return (
    <div className="space-y-6">
      {/* ── Formulario ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <Package size={20} className="text-[#0066FF]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingId ? 'Actualizar Producto' : 'Nuevo Producto'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Platos, bebidas y postres del menú</p>
              </div>
            </div>
            {editingId && (
              <button onClick={cancelEdit} className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                Cancelar
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIAS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, fk_categoria_id: id.toString() }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      parseInt(form.fk_categoria_id) === id
                        ? color + ' shadow-sm scale-105'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre y precio */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre *</label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Bandeja paisa"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Precio (COP) *
                </label>
                <div className="relative">
                  <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="precio_venta"
                    type="text"
                    inputMode="decimal"
                    value={form.precio_venta}
                    onChange={handleChange}
                    placeholder="18000"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción (opcional)</label>
              <textarea
                name="descripcion"
                rows={2}
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Ingredientes, notas del chef..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 resize-none
                           focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-colors"
              />
            </div>

            {/* Disponible */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="disponible"
                checked={form.disponible}
                onChange={handleChange}
                className="w-4 h-4 accent-[#0066FF]"
              />
              <span className="text-sm font-semibold text-gray-700">Disponible para pedidos</span>
            </label>

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
                         shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitLoading
                ? (editingId ? 'Actualizando...' : 'Creando...')
                : (editingId ? 'Actualizar Producto' : 'Crear Producto')}
            </button>
          </div>
        </div>

        {/* Stats lateral */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {CATEGORIAS.map(({ id, label, icon: Icon, color }) => {
            const count = productos.filter(p => p.fk_categoria_id === id).length;
            const disponibles = productos.filter(p => p.fk_categoria_id === id && p.disponible).length;
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg border ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{count} productos · {disponibles} disponibles</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lista por Categoría ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs y Búsqueda */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-4 pt-4 pb-2 sm:pb-0 gap-4">
          <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {CATEGORIAS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'border-[#0066FF] text-[#0066FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />
                {label}
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {productos.filter(p => p.fk_categoria_id === id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="relative pb-2 sm:pb-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 focus:border-[#0066FF] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-[#0066FF] animate-spin" />
          </div>
        ) : filteredProductos.length === 0 ? (() => {
            const CatIcon = catActiva?.icon;
            return (
              <div className="text-center py-12">
                {CatIcon && <CatIcon size={36} className="mx-auto text-gray-300 mb-3" />}
                <p className="text-gray-500 text-sm">No hay {catActiva?.label?.toLowerCase()} registrados</p>
                <p className="text-xs text-gray-400 mt-1">Usa el formulario de arriba para crear el primero</p>
              </div>
            );
          })() : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Descripción</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Precio</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-700">Disponible</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductos.map(p => (
                  <tr key={p.id_producto} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs max-w-[180px] truncate">{p.descripcion || '—'}</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800">
                      ${parseFloat(p.precio_venta).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleToggleDisponible(p)}
                        title={p.disponible ? 'Marcar no disponible' : 'Marcar disponible'}
                        className="inline-flex items-center gap-1.5 transition-colors"
                      >
                        {p.disponible
                          ? <ToggleRight size={24} className="text-green-500" />
                          : <ToggleLeft size={24} className="text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id_producto, p.nombre)}
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

export default ProductosPanel;
