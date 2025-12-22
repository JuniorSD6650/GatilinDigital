'use client';

import { useState, useEffect } from 'react';
import { getOrganizaciones, createOrganizacion, updateOrganizacion, deleteOrganizacion, downloadTemplate, uploadExcel, type Organizacion } from '@/services/apis/api-admin';

export default function OrganizacionesAdminPage() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Organizacion | null>(null);
  const [formData, setFormData] = useState<Partial<Organizacion>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getOrganizaciones();
      setOrganizaciones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: Organizacion) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateOrganizacion(editingItem.id, formData);
      } else {
        await createOrganizacion(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    try {
      await deleteOrganizacion(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('organizacion', 'Plantilla_Organizaciones.xlsx');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel('organizacion', file);
      alert('Datos cargados correctamente');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const filteredData = organizaciones.filter(o =>
    o.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando organizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Organizaciones / Cuadrillas</h2>
          <p className="text-gray-400">Gestiona las organizaciones que participan</p>
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
            ➕ Nueva Organización
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
          placeholder="Buscar organización..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Descripción</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Link Stream</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">{item.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{item.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.streaming_link ? (
                      <a href={item.streaming_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Ver link
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.nombre)}
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
              No se encontraron organizaciones
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              {editingItem ? 'Editar Organización' : 'Nueva Organización'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  rows={3}
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link de Streaming
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  placeholder="https://..."
                  value={formData.streaming_link || ''}
                  onChange={(e) => setFormData({ ...formData, streaming_link: e.target.value })}
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
