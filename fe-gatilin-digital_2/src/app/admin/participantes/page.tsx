'use client';

import { useState, useEffect } from 'react';
import { getParticipantes, createParticipante, updateParticipante, deleteParticipante, type Participante } from '@/services/apis/api-admin';
import { useAlert } from '@/components/AlertContext';

export default function ParticipantesAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Participante | null>(null);
  const [formData, setFormData] = useState<Partial<Participante>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getParticipantes();
      setParticipantes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ estado: 'activo' });
    setShowModal(true);
  };

  const handleEdit = (item: Participante) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      showAlert('error', 'El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateParticipante(editingItem.id, formData);
        showAlert('success', 'Participante actualizado correctamente');
      } else {
        await createParticipante(formData);
        showAlert('success', 'Participante creado correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Error al guardar el participante');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    showConfirm({
      title: 'Eliminar Participante',
      message: `¿Estás seguro de eliminar a "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteParticipante(id);
          showAlert('success', 'Participante eliminado correctamente');
          loadData();
        } catch (err: any) {
          showAlert('error', err.message || 'Error al eliminar el participante');
        }
      }
    });
  };

  const filteredData = participantes.filter(p => {
    const matchSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dni && p.dni.includes(searchTerm)) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchEstado = !filterEstado || p.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'inactivo':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'pendiente':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando participantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Participantes</h2>
          <p className="text-gray-400">Gestiona los participantes registrados</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 transition-colors text-sm font-bold"
        >
          ➕ Nuevo Participante
        </button>
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
            placeholder="Buscar por nombre, DNI o email..."
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
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
        </select>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">DNI</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Fecha Registro</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{item.nombre}</p>
                      {item.comentario && (
                        <p className="text-xs text-gray-500 line-clamp-1">{item.comentario}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{item.dni || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getEstadoBadge(item.estado)}`}>
                      {item.estado || 'Sin estado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString('es-PE') : '-'}
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
              No se encontraron participantes
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              {editingItem ? 'Editar Participante' : 'Nuevo Participante'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                  DNI
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.dni || ''}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.estado || 'activo'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.fecha_registro || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_registro: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Comentario
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  rows={3}
                  value={formData.comentario || ''}
                  onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
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
