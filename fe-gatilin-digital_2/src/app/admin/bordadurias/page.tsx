'use client';

import { useState, useEffect } from 'react';
import { getBordadurias, createBordaduria, updateBordaduria, deleteBordaduria, downloadTemplate, type Bordaduria } from '@/services/apis/api-admin';
import { useAlert } from '@/components/AlertContext';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions,
  PageToolbar, TemplateButton, UploadExcelButton, NewButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField, Pagination, usePagination,
} from '@/components/admin/AdminUI';

export default function BorduriasAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [bordadurias, setBordadurias] = useState<Bordaduria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Bordaduria | null>(null);
  const [formData, setFormData] = useState<Partial<Bordaduria>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getBordadurias();
      setBordadurias(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item: Bordaduria) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.razon_social) {
      showAlert('error', 'La razón social es obligatoria');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateBordaduria(editingItem.id, formData);
        showAlert('success', 'Bordaduría actualizada correctamente');
      } else {
        await createBordaduria(formData);
        showAlert('success', 'Bordaduría creada correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showAlert('error', (err as Error).message || 'Error al guardar la bordaduría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar "${nombre}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteBordaduria(id);
          showAlert('success', 'Bordaduría eliminada correctamente');
          loadData();
        } catch (err) {
          showAlert('error', (err as Error).message || 'Error al eliminar la bordaduría');
        }
      }
    });
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('bordadurias', 'Plantilla_Bordadurias.xlsx');
  };


  const filteredData = bordadurias.filter(b =>
    b.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.ruc && b.ruc.includes(searchTerm))
  );
  const pag = usePagination(filteredData, 20, String(searchTerm));

  if (loading) return <LoadingState label="Cargando bordadurías..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <PageToolbar title="Bordadurías" subtitle="Gestiona los talleres de bordado">
        <TemplateButton onClick={handleDownloadTemplate} />
        <UploadExcelButton endpoint="bordadurias" onDone={loadData} />
        <NewButton onClick={handleCreate}>Nueva Bordaduría</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por razón social o RUC..." />
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">RUC</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Razón Social</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Representante</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Celular</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Dirección</th>
                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 text-sm text-gray-300">{item.ruc}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{item.razon_social}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.representante || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.celular || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.direccion || '-'}</td>
                  <td className="px-5 py-3.5">
                    <RowActions>
                      <ActionButton kind="edit" onClick={() => handleEdit(item)} />
                      <ActionButton kind="delete" onClick={() => handleDelete(item.id, item.razon_social)} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <EmptyState
              title="No se encontraron bordadurías"
              description={searchTerm ? 'Prueba con otra búsqueda o cambia los filtros.' : undefined}
            />
          )}
        </div>
        <Pagination {...pag} noun="bordadurías" />
      </div>

      {/* Modal */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        locked={saving}
        title={editingItem ? 'Editar Bordaduría' : 'Nueva Bordaduría'}
        size="lg"
        footer={
          <>
            <ModalCancel onClick={() => setShowModal(false)} disabled={saving} />
            <ModalSave onClick={handleSave} loading={saving} />
          </>
        }
      >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  RUC
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.ruc || ''}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Razón Social <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.razon_social || ''}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Representante
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.representante || ''}
                  onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Celular
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.celular || ''}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Web / Facebook
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  placeholder="https://..."
                  value={formData.web_fb || ''}
                  onChange={(e) => setFormData({ ...formData, web_fb: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
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
            </div>

      </AdminModal>

    </div>
  );
}
