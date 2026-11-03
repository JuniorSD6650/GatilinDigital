'use client';

import { useState, useEffect } from 'react';
import { createCofrade, updateCofrade, deleteCofrade, downloadTemplate, exportExcel, getPaginado, type Cofrade } from '@/services/apis/api-admin';
import { API_URL, BASE_URL } from '@/services/api';
import { apiFetch } from '@/services/http';
import { useAlert } from '@/components/AlertContext';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions,
  PageToolbar, TemplateButton, UploadExcelButton, NewButton, ExportButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField, FilterSelect, Pagination, useServerList,
} from '@/components/admin/AdminUI';

interface Cofradia {
  id: number;
  nickname_cofradia: string;
}

const fetchCofrades = (q: Record<string, string | number | undefined>) => getPaginado<Cofrade>('cofrades', q);

export default function CofradesAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [cofradias, setCofradias] = useState<Cofradia[]>([]);
  const [aniosDisponibles, setAniosDisponibles] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCofradia, setFiltroCofradia] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');

  // Paginación, búsqueda y filtros en el servidor
  const filtros = { q: searchTerm || undefined, cod_cofradia: filtroCofradia || undefined, anio: filtroAnio || undefined };
  const pag = useServerList<Cofrade>(fetchCofrades, filtros);
  const { error } = pag;
  const loadData = () => {
    pag.reload();
    apiFetch<number[]>('/cofrades/anios').then(setAniosDisponibles).catch(() => {});
  };

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Cofrade | null>(null);
  const [formData, setFormData] = useState<Partial<Cofrade>>({});
  const [foto, setFoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Estado para el modal de foto
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [selectedCofradeName, setSelectedCofradeName] = useState<string>('');

  useEffect(() => {
    apiFetch<number[]>('/cofrades/anios').then(setAniosDisponibles).catch(() => {});
    loadCofradias();
  }, []);

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
    setFormData({ anio: new Date().getFullYear() });
    setFoto(null);
    setShowModal(true);
  };

  const handleViewPhoto = (cofrade: Cofrade) => {
    if (cofrade.ruta_foto) {
      // Si la ruta ya es absoluta (http), usarla tal cual
      // Si no, construir la URL. ruta_foto viene como "uploads/cofrades/file.jpg"
      const photoUrl = cofrade.ruta_foto.startsWith('http') 
        ? cofrade.ruta_foto 
        : `${BASE_URL}/${cofrade.ruta_foto}`;
      setSelectedPhoto(photoUrl);
      setSelectedCofradeName(cofrade.nombres_apellidos);
      setShowPhotoModal(true);
    } else {
      showAlert('error', 'Este cofrade no tiene foto registrada');
    }
  };

  const handleEdit = (item: Cofrade) => {
    setEditingItem(item);
    setFormData(item);
    setFoto(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombres_apellidos || !formData.cod_cofradia) {
      showAlert('error', 'El nombre y la cofradía son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nombres_apellidos', formData.nombres_apellidos);
      fd.append('dni_cofrade', formData.dni_cofrade || '');
      fd.append('celular', formData.celular || '');
      fd.append('personaje_cofradia', formData.personaje_cofradia || '');
      fd.append('cargo_cofrade', formData.cargo_cofrade || '');
      fd.append('cod_cofradia', String(formData.cod_cofradia));
      fd.append('anio', String(formData.anio || new Date().getFullYear()));
      if (foto) {
        fd.append('foto', foto);
      }

      if (editingItem) {
        await updateCofrade(editingItem.id, fd);
        showAlert('success', 'Cofrade actualizado correctamente');
      } else {
        await createCofrade(fd);
        showAlert('success', 'Cofrade creado correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      showAlert('error', (err as Error).message || 'Error al guardar el cofrade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    showConfirm({
      title: 'Eliminar Cofrade',
      message: `¿Estás seguro de eliminar a "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteCofrade(id);
          showAlert('success', 'Cofrade eliminado correctamente');
          loadData();
        } catch (err) {
          showAlert('error', (err as Error).message || 'Error al eliminar el cofrade');
        }
      }
    });
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('cofrades', 'Plantilla_Cofrades.xlsx');
  };


  const sinFiltros = !searchTerm && !filtroCofradia && !filtroAnio;
  if (pag.loading && pag.total === 0 && sinFiltros && !error) return <LoadingState label="Cargando cofrades..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <PageToolbar title="Cofrades" subtitle="Gestiona los miembros de cada cofradía">
        <TemplateButton onClick={handleDownloadTemplate} />
        <UploadExcelButton endpoint="cofrades" onDone={loadData} />
        <ExportButton onClick={() => exportExcel('cofrades', 'Cofrades.xlsx', filtros)} />
        <NewButton onClick={handleCreate}>Nuevo Cofrade</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o DNI..." />
        <FilterSelect value={filtroCofradia} onChange={setFiltroCofradia} label="Cofradía">
          <option value="">Todas las cofradías</option>
          {cofradias.map((c) => (
            <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>
          ))}
        </FilterSelect>
        <FilterSelect value={filtroAnio} onChange={setFiltroAnio} label="Año">
          <option value="">Todos los años</option>
          {aniosDisponibles.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">DNI</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Nombres</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Personaje</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Cargo</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Celular</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Año</th>
                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 text-sm text-gray-300">{item.dni_cofrade || '-'}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{item.nombres_apellidos}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.personaje_cofradia || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.cargo_cofrade || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.celular || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.anio || '-'}</td>
                  <td className="px-5 py-3.5">
                    <RowActions>
                      {item.ruta_foto && <ActionButton kind="photo" onClick={() => handleViewPhoto(item)} />}
                      <ActionButton kind="edit" onClick={() => handleEdit(item)} />
                      <ActionButton kind="delete" onClick={() => handleDelete(item.id, item.nombres_apellidos)} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pag.loading && pag.total === 0 && (
            <EmptyState
              title="No se encontraron cofrades"
              description={searchTerm ? 'Prueba con otra búsqueda o cambia los filtros.' : undefined}
            />
          )}
        </div>
        <Pagination {...pag} noun="cofrades" />
      </div>

      {/* Modal */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        locked={saving}
        title={editingItem ? 'Editar Cofrade' : 'Nuevo Cofrade'}
        size="xl"
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
                  DNI
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.dni_cofrade || ''}
                  onChange={(e) => setFormData({ ...formData, dni_cofrade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombres y Apellidos <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.nombres_apellidos || ''}
                  onChange={(e) => setFormData({ ...formData, nombres_apellidos: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cofradía <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.cod_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, cod_cofradia: Number(e.target.value) })}
                >
                  <option value="">Seleccionar...</option>
                  {cofradias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personaje
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.personaje_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, personaje_cofradia: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.cargo_cofrade || ''}
                  onChange={(e) => setFormData({ ...formData, cargo_cofrade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.anio || new Date().getFullYear()}
                  onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
                {editingItem?.ruta_foto && !foto && (
                  <p className="text-xs text-gray-400 mt-1">Foto actual: {editingItem.ruta_foto}</p>
                )}
              </div>
            </div>

      </AdminModal>

      {/* Modal de Foto */}
      <AdminModal open={showPhotoModal} onClose={() => setShowPhotoModal(false)} title={selectedCofradeName} size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selectedPhoto}
          alt={selectedCofradeName}
          className="mx-auto h-auto max-h-[70vh] w-full rounded-xl object-contain"
          onError={(e) => {
            e.currentTarget.alt = 'Imagen no disponible';
          }}
        />
      </AdminModal>

    </div>
  );
}
