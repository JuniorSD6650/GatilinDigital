'use client';

import { useState, useEffect } from 'react';
import { createEvento, updateEvento, deleteEvento, downloadTemplate, exportExcel, getPaginado, type Evento } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';
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

const fetchEventos = (q: Record<string, string | number | undefined>) => getPaginado<Evento>('eventos', { ...q, orden: 'agenda' });

export default function EventosAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [cofradias, setCofradias] = useState<Cofradia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCofradia, setFiltroCofradia] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(''); // AAAA-MM-DD

  // Paginación, búsqueda y filtros en el servidor
  const filtros = { q: searchTerm || undefined, cod_cofradia: filtroCofradia || undefined, fecha: filtroFecha || undefined };
  const pag = useServerList<Evento>(fetchEventos, filtros);
  const { error } = pag;
  const loadData = pag.reload;

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Evento | null>(null);
  const [formData, setFormData] = useState<Partial<Evento>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
      showAlert('error', 'La fecha es obligatoria');
      return;
    }

    if (!formData.hora?.trim()) {
      showAlert('error', 'La hora es obligatoria');
      return;
    }

    if (!formData.oferente?.trim()) {
      showAlert('error', 'El oferente es obligatorio');
      return;
    }

    if (!formData.direccion_actividad?.trim()) {
      showAlert('error', 'La dirección de la actividad es obligatoria');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await updateEvento(editingItem.id, formData);
        showAlert('success', 'Evento actualizado correctamente');
      } else {
        await createEvento(formData);
        showAlert('success', 'Evento creado correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Error al guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, tipo: string) => {
    showConfirm({
      title: 'Eliminar Evento',
      message: `¿Estás seguro de eliminar el evento "${tipo}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteEvento(id);
          showAlert('success', 'Evento eliminado correctamente');
          loadData();
        } catch (err: any) {
          showAlert('error', err.message || 'Error al eliminar el evento');
        }
      }
    });
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('eventos', 'Plantilla_Eventos.xlsx');
  };


  const sinFiltros = !searchTerm && !filtroCofradia && !filtroFecha;
  if (pag.loading && pag.total === 0 && sinFiltros && !error) return <LoadingState label="Cargando eventos..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <PageToolbar title="Eventos" subtitle="Gestiona las actividades y eventos de las cofradías">
        <TemplateButton onClick={handleDownloadTemplate} />
        <UploadExcelButton endpoint="eventos" onDone={loadData} />
        <ExportButton onClick={() => exportExcel('eventos', 'Agenda_Eventos.xlsx', filtros)} />
        <NewButton onClick={handleCreate}>Nuevo Evento</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por tipo, oferente o dirección..." />
        <FilterSelect value={filtroCofradia} onChange={setFiltroCofradia} label="Cofradía">
          <option value="">Todas las cofradías</option>
          {cofradias.map((c) => (
            <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>
          ))}
        </FilterSelect>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          aria-label="Fecha"
          className={`h-10 w-full rounded-lg border bg-negrito-card px-3 text-sm sm:w-auto ${filtroFecha ? 'border-festivo-gold/40 text-white' : 'border-white/10 text-gray-300'}`}
        />
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha y Hora</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Tipo</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Oferente</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Cofradía</th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Dirección</th>
                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 text-sm text-gray-300">
                    <div>{item.fecha}</div>
                    {item.hora && <div className="text-xs text-gray-500">{item.hora.slice(0, 5)}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-white">{item.tipo_evento || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.oferente || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{item.nickname_cofradia || '-'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 max-w-xs truncate">{item.direccion_actividad || '-'}</td>
                  <td className="px-5 py-3.5">
                    <RowActions>
                      <ActionButton kind="edit" onClick={() => handleEdit(item)} />
                      <ActionButton kind="delete" onClick={() => handleDelete(item.id, item.tipo_evento || 'este evento')} />
                    </RowActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!pag.loading && pag.total === 0 && (
            <EmptyState
              title="No se encontraron eventos"
              description={searchTerm ? 'Prueba con otra búsqueda o cambia los filtros.' : undefined}
            />
          )}
        </div>
        <Pagination {...pag} noun="eventos" />
      </div>

      {/* Modal */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        locked={saving}
        title={editingItem ? 'Editar Evento' : 'Nuevo Evento'}
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
                  Hora <span className="text-red-400">*</span>
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
                  Oferente <span className="text-red-400">*</span>
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
                  Dirección de la Actividad <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.direccion_actividad || ''}
                  onChange={(e) => setFormData({ ...formData, direccion_actividad: e.target.value })}
                />
              </div>
            </div>

      </AdminModal>

    </div>
  );
}
