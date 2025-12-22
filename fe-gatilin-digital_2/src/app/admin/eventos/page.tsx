'use client';

import { useState, useEffect } from 'react';
import { getEventos, createEvento, updateEvento, deleteEvento, downloadTemplate, uploadExcel, type Evento } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';

interface Cofradia {
  id: number;
  nickname_cofradia: string;
}

export default function EventosAdminPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cofradias, setCofradias] = useState<Cofradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<Partial<Evento>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    loadCofradias();
  }, []);

  const loadData = async () => {
    try {
      const data = await getEventos();
      setEventos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCofradias = async () => {
    try {
      const response = await fetch(`${API_URL}/cofradia/list`);
      const data = await response.json();
      setCofradias(data);
    } catch (err) {
      console.error('Error cargando cofradías', err);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: Evento) => {
    setEditingItem(item);
    // Convertir fecha de dd/MM/yyyy a yyyy-MM-dd para el input date
    let fechaInput = item.fecha;
    if (item.fecha && item.fecha.includes('/')) {
      const [day, month, year] = item.fecha.split('/');
      fechaInput = `${year}-${month}-${day}`;
    }
    setFormData({ ...item, fecha: fechaInput });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.fecha) {
      alert('La fecha es obligatoria');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateEvento(editingItem.id, formData);
      } else {
        await createEvento(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, tipo: string) => {
    if (!confirm(`¿Eliminar evento "${tipo}"?`)) return;

    try {
      await deleteEvento(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('eventos', 'Plantilla_Eventos.xlsx');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel('eventos', file);
      alert('Datos cargados correctamente');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const filteredData = eventos.filter(e =>
    (e.tipo_evento && e.tipo_evento.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.oferente && e.oferente.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.nickname_cofradia && e.nickname_cofradia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Eventos</h2>
          <p className="text-gray-400">Gestiona las actividades y eventos de las cofradías</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
          >
            📥 Descargar Plantilla
          </button>
          <label className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium cursor-pointer">
            📤 Cargar Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
          </label>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 transition-colors text-sm font-bold"
          >
            ➕ Nuevo Evento
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 bg-negrito-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
          placeholder="Buscar evento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Hora</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Oferente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cofradía</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Dirección</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">{item.fecha}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{item.tipo_evento || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.hora || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.oferente || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.nickname_cofradia || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{item.direccion_actividad || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.tipo_evento || 'este evento')}
                      className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No se encontraron eventos
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              {editingItem ? 'Editar Evento' : 'Nuevo Evento'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.fecha || ''}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.hora || ''}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Día
                </label>
                <input
                  type="text"
                  placeholder="Ej: Víspera, Día Central..."
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.tipo_dia || ''}
                  onChange={(e) => setFormData({ ...formData, tipo_dia: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Evento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Misa, Procesión, Fiesta..."
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.tipo_evento || ''}
                  onChange={(e) => setFormData({ ...formData, tipo_evento: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Oferente
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.oferente || ''}
                  onChange={(e) => setFormData({ ...formData, oferente: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Oferente
                </label>
                <input
                  type="text"
                  placeholder="Ej: Persona, Institución..."
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.tipo_oferente || ''}
                  onChange={(e) => setFormData({ ...formData, tipo_oferente: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Banda
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.banda || ''}
                  onChange={(e) => setFormData({ ...formData, banda: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cofradía
                </label>
                <select
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.cod_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, cod_cofradia: Number(e.target.value) || undefined })}
                >
                  <option value="">Sin cofradía específica</option>
                  {cofradias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección de la Actividad
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.direccion_actividad || ''}
                  onChange={(e) => setFormData({ ...formData, direccion_actividad: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 font-bold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
