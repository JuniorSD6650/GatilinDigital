'use client';

import { useState } from 'react';
import { createParticipante, updateParticipante, deleteParticipante, exportExcel, getPaginado, type Participante } from '@/services/apis/api-admin';
import { useAlert } from '@/components/AlertContext';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions,
  PageToolbar, NewButton, ExportButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField, FilterSelect, Pagination, useServerList,
} from '@/components/admin/AdminUI';

const fetchParticipantes = (q: Record<string, string | number | undefined>) => getPaginado<Participante>('participantes', q);

export default function ParticipantesAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');

  // Paginación, búsqueda y filtros en el servidor
  const filtros = { q: searchTerm || undefined, estado: filterEstado || undefined };
  const pag = useServerList<Participante>(fetchParticipantes, filtros);
  const { error } = pag;
  const loadData = pag.reload;

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Participante | null>(null);
  const [formData, setFormData] = useState<Partial<Participante>>({});
  const [saving, setSaving] = useState(false);

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

  if (pag.loading && pag.total === 0 && !searchTerm && !filterEstado && !error) return <LoadingState label="Cargando participantes..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <PageToolbar title="Participantes" subtitle="Gestiona los participantes registrados">
        <ExportButton onClick={() => exportExcel('participantes', 'Participantes.xlsx', filtros)} />
        <NewButton onClick={handleCreate}>Nuevo Participante</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre, DNI o email..." />
        <FilterSelect value={filterEstado} onChange={setFilterEstado} label="Estado">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
        </FilterSelect>
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">DNI</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Teléfono</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Estado</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha Registro</th>
                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-white">{item.nombre}</p>
                      {item.comentario && (
                        <p className="text-xs text-gray-500 line-clamp-1">{item.comentario}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-300">{item.dni || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.email || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.telefono || '-'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getEstadoBadge(item.estado)}`}>
                      {item.estado || 'Sin estado'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">
                    {item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString('es-PE') : '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <RowActions>
                      <ActionButton kind="edit" onClick={() => handleEdit(item)} />
                      <ActionButton kind="delete" onClick={() => handleDelete(item.id, item.nombre)} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pag.loading && pag.total === 0 && (
            <EmptyState
              title="No se encontraron participantes"
              description={searchTerm ? 'Prueba con otra búsqueda o cambia los filtros.' : undefined}
            />
          )}
        </div>
        <Pagination {...pag} noun="participantes" />
      </div>

      {/* Modal */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        locked={saving}
        title={editingItem ? 'Editar Participante' : 'Nuevo Participante'}
        size="lg"
        footer={
          <>
            <ModalCancel onClick={() => setShowModal(false)} disabled={saving} />
            <ModalSave onClick={handleSave} loading={saving} />
          </>
        }
      >

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

      </AdminModal>

    </div>
  );
}
