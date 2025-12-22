'use client';

import { useState, useEffect } from 'react';
import { getReportes, updateReporte, deleteReporte, type Reporte } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';

export default function ReportesAdminPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Reporte | null>(null);
  const [formData, setFormData] = useState<Partial<Reporte>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getReportes();
      setReportes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Reporte) => {
    setEditingItem(item);
    setFormData({ estado: item.estado });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('estado', formData.estado || 'pendiente');

      await updateReporte(editingItem.id, fd);
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar reporte de "${nombre}"?`)) return;

    try {
      await deleteReporte(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredData = reportes.filter(r => {
    const matchSearch = 
      r.nombre_reportante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.nickname_cofradia && r.nickname_cofradia.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchEstado = !filterEstado || r.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'revisado':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'resuelto':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Reportes</h2>
          <p className="text-gray-400">Gestiona los reportes enviados durante el festival</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-negrito-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
            placeholder="Buscar reporte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-3 bg-negrito-card border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="revisado">Revisado</option>
          <option value="resuelto">Resuelto</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((reporte) => (
          <div key={reporte.id} className="bg-negrito-card border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
            
            {/* Imagen si existe */}
            {reporte.ruta_foto && (
              <div className="mb-4 rounded-lg overflow-hidden bg-white/5">
                <img 
                  src={`${API_URL.replace('/api', '')}/${reporte.ruta_foto}`} 
                  alt="Foto del reporte" 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{reporte.nombre_reportante}</h3>
                  {reporte.nickname_cofradia && (
                    <p className="text-sm text-gray-400">{reporte.nickname_cofradia}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getEstadoBadge(reporte.estado)}`}>
                  {reporte.estado}
                </span>
              </div>

              <p className="text-sm text-gray-300 line-clamp-3">{reporte.descripcion}</p>

              {reporte.numero_contacto && (
                <p className="text-sm text-gray-400">
                  📞 {reporte.numero_contacto}
                </p>
              )}

              {reporte.created_at && (
                <p className="text-xs text-gray-500">
                  {new Date(reporte.created_at).toLocaleDateString('es-PE')}
                </p>
              )}

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleEdit(reporte)}
                  className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 text-sm font-medium"
                >
                  ✏️ Cambiar Estado
                </button>
                <button
                  onClick={() => handleDelete(reporte.id, reporte.nombre_reportante)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-negrito-card border border-white/10 rounded-2xl">
          No se encontraron reportes
        </div>
      )}

      {/* Modal */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              Cambiar Estado del Reporte
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Reportante:</p>
                <p className="text-white font-medium">{editingItem.nombre_reportante}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.estado || 'pendiente'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="revisado">Revisado</option>
                  <option value="resuelto">Resuelto</option>
                </select>
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
