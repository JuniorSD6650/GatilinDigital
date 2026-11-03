'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/services/api';
import { getAuthHeaders } from '@/services/apis/api-auth';
import { downloadTemplate, getOrganizacionesList, exportExcel } from '@/services/apis/api-admin';
import { getRankingCofradias } from '@/services/apis/api-normal';
import { exportarTablaPDF } from '@/lib/pdf';
import { useAlert } from '@/components/AlertContext';
import FotosCuadrillaModal from '@/components/admin/FotosCuadrillaModal';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions,
  PageToolbar, TemplateButton, UploadExcelButton, NewButton, ExportButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField, FilterSelect, Pagination, usePagination,
} from '@/components/admin/AdminUI';

// Ranking de votos en PDF (para publicar o imprimir)
const exportarRankingPDF = async () => {
  const ranking = (await getRankingCofradias()).map((r, i) => ({ ...r, puesto: i + 1 }));
  await exportarTablaPDF({
    titulo: 'Ranking de cofradías por votos',
    columnas: [
      { titulo: 'Puesto', ancho: 10, valor: (r: (typeof ranking)[number]) => r.puesto },
      { titulo: 'Cofradía', ancho: 60, valor: (r) => r.nickname_cofradia },
      { titulo: 'Votos', ancho: 12, valor: (r) => r.votos },
    ],
    filas: ranking,
    archivo: 'ranking-votos.pdf',
  });
};

interface Cofradia {
  id: number;
  nickname_cofradia: string;
  nombre_cofradia: string;
  fecha_fundacion: string;
  sede_local: string;
  dni_representante: string;
  nombre_representante: string;
  cel_representante: string;
  distrito: string;
  color: string;
  descripcion: string;
  ubicacion_link: string;
  organizacion_id: number;
}

export default function CofradiasAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [cofradias, setCofradias] = useState<Cofradia[]>([]);
  const [organizaciones, setOrganizaciones] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDistrito, setFiltroDistrito] = useState('');

  // Estados para el modal de edición
  const [showModal, setShowModal] = useState(false);
  const [editingCofradia, setEditingCofradia] = useState<Cofradia | null>(null);
  const [formData, setFormData] = useState<Partial<Cofradia>>({});
  const [saving, setSaving] = useState(false);

  // Modal de foto grupal de la cuadrilla
  const [fotosDe, setFotosDe] = useState<Cofradia | null>(null);

  useEffect(() => {
    loadCofradias();
    loadOrganizaciones();
  }, []);

  const loadOrganizaciones = async () => {
    try {
      const data = await getOrganizacionesList();
      setOrganizaciones(data);
    } catch (err) {
      console.error('Error cargando organizaciones:', err);
    }
  };

  const loadCofradias = async () => {
    try {
      const response = await fetch(`${API_URL}/cofradia`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCofradias(data);
      } else {
        setError('Error al cargar cofradías');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cofradia: Cofradia) => {
    setEditingCofradia(cofradia);
    // Limpiar el color para que funcione con input type='color' (solo 7 caracteres #RRGGBB)
    const cleanedData = {
      ...cofradia,
      color: cofradia.color ? cofradia.color.substring(0, 7) : '#00B0FF'
    };
    setFormData(cleanedData);
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validación de campos obligatorios
    if (!formData.nickname_cofradia?.trim()) {
      showAlert('error', 'El apodo/nickname es obligatorio');
      return;
    }
    if (!formData.nombre_cofradia?.trim()) {
      showAlert('error', 'El nombre completo de la cofradía es obligatorio');
      return;
    }

    setSaving(true);
    try {
      // Convertir fecha al formato YYYY-MM-DD si existe
      const dataToSend = { ...formData };
      if (dataToSend.fecha_fundacion) {
        const date = new Date(dataToSend.fecha_fundacion);
        if (!isNaN(date.getTime())) {
          dataToSend.fecha_fundacion = date.toISOString().split('T')[0];
        }
      }
      // Asegurar que el color esté en formato hex de 6 caracteres
      if (dataToSend.color) {
        dataToSend.color = dataToSend.color.substring(0, 7);
      }
      // Asegurar que tenga organizacion_id
      if (!dataToSend.organizacion_id) {
        dataToSend.organizacion_id = organizaciones[0]?.id ?? 1;
      }

      const isEditing = !!editingCofradia;
      const url = isEditing ? `${API_URL}/cofradia/${editingCofradia.id}` : `${API_URL}/cofradia`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        await loadCofradias();
        setShowModal(false);
        setEditingCofradia(null);
        showAlert('success', editingCofradia ? 'Cofradía actualizada correctamente' : 'Cofradía creada correctamente');
      } else {
        const data = await response.json();
        showAlert('error', data.error || 'Error al guardar los cambios');
      }
    } catch (err) {
      showAlert('error', 'Error de conexión al guardar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    showConfirm({
      title: 'Eliminar Cofradía',
      message: `¿Estás seguro de eliminar la cofradía "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/cofradia/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            await loadCofradias();
            showAlert('success', 'Cofradía eliminada correctamente');
          } else {
            showAlert('error', 'Error al eliminar la cofradía');
          }
        } catch (err) {
          showAlert('error', 'Error de conexión al eliminar');
          console.error(err);
        }
      }
    });
  };
  
  const handleCreate = () => {
    setEditingCofradia(null);
    setFormData({});
    setShowModal(true);
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('cofradia', 'Plantilla_Cofradias.xlsx');
  };

  // Distritos únicos ("La Esperanza, Amarilis" cuenta para ambos)
  const distritosDe = (d?: string) => (d || '').split(',').map((x) => x.trim()).filter(Boolean);
  const distritos = [...new Set(cofradias.flatMap((c) => distritosDe(c.distrito)))].sort((a, b) => a.localeCompare(b));
  const filteredCofradias = cofradias.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q || [c.nickname_cofradia, c.nombre_cofradia, c.nombre_representante].some((v) => v && v.toLowerCase().includes(q));
    const matchDistrito = !filtroDistrito || distritosDe(c.distrito).includes(filtroDistrito);
    return matchSearch && matchDistrito;
  });
  const pag = usePagination(filteredCofradias, 20, searchTerm + filtroDistrito);

  if (loading) return <LoadingState label="Cargando cofradías..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <PageToolbar
        title="Cofradías"
        subtitle={`${cofradias.length} cofradía${cofradias.length !== 1 ? 's' : ''} registrada${cofradias.length !== 1 ? 's' : ''}`}
      >
        <TemplateButton onClick={handleDownloadTemplate} />
        <UploadExcelButton endpoint="cofradia" onDone={loadCofradias} />
        <ExportButton onClick={() => exportExcel('cofradia', 'Cofradias.xlsx')} />
        <ExportButton label="Ranking (Excel)" onClick={() => exportExcel('cofradia/ranking', 'Ranking_Votos.xlsx')} />
        <ExportButton label="Ranking (PDF)" onClick={exportarRankingPDF} />
        <NewButton onClick={handleCreate}>Nueva Cofradía</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre o representante..." />
        <FilterSelect value={filtroDistrito} onChange={setFiltroDistrito} label="Distrito">
          <option value="">Todos los distritos</option>
          {distritos.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tabla de Cofradías */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Cofradía
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Representante
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Distrito
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Color
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.length > 0 ? (
                pag.items.map((cofradia) => (
                  <tr key={cofradia.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-white">{cofradia.nickname_cofradia}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">{cofradia.nombre_cofradia}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm">
                        <p className="text-white">{cofradia.nombre_representante || '-'}</p>
                        <p className="text-gray-400">{cofradia.cel_representante || '-'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">
                      {cofradia.distrito || 'Huánuco'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg border border-white/10"
                          style={{ backgroundColor: cofradia.color || '#00B0FF' }}
                        />
                        <span className="text-xs text-gray-400 font-mono">
                          {cofradia.color || '#00B0FF'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <RowActions>
                        <ActionButton kind="camera" onClick={() => setFotosDe(cofradia)}>Foto cuadrilla</ActionButton>
                        <ActionButton kind="edit" onClick={() => handleEdit(cofradia)} />
                        <ActionButton kind="delete" onClick={() => handleDelete(cofradia.id, cofradia.nickname_cofradia)} />
                      </RowActions>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No se encontraron cofradías"
                      description={searchTerm || filtroDistrito ? 'Prueba con otra búsqueda o cambia los filtros.' : undefined}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination {...pag} noun="cofradías" />
      </div>

      {fotosDe && <FotosCuadrillaModal cofradia={fotosDe} onClose={() => setFotosDe(null)} />}

      {/* Modal de Edición/Creación */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        locked={saving}
        title={editingCofradia ? 'Editar Cofradía' : 'Nueva Cofradía'}
        size="lg"
        footer={
          <>
            <ModalCancel onClick={() => setShowModal(false)} disabled={saving} />
            <ModalSave onClick={handleSave} loading={saving} />
          </>
        }
      >
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nickname */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nombre Corto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nickname_cofradia || ''}
                    onChange={(e) => setFormData({ ...formData, nickname_cofradia: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                    placeholder="El Negrito"
                    required
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color || '#00B0FF'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 bg-neutral-900 border border-white/10 rounded-lg cursor-pointer"
                  />
                </div>

              </div>

              {/* Nombre Completo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, nombre_cofradia: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  placeholder="Cofradia del Negrito de Huánuco"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Distrito */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={formData.distrito || ''}
                    onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  />
                </div>

                {/* Sede Local */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Sede Local
                  </label>
                  <input
                    type="text"
                    value={formData.sede_local || ''}
                    onChange={(e) => setFormData({ ...formData, sede_local: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  />
                </div>

                {/* Fecha de Fundación */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Fecha de Fundación
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fundacion && formData.fecha_fundacion !== '' ? (() => {
                      const date = new Date(formData.fecha_fundacion);
                      if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                      }
                      return '';
                    })() : ''}
                    onChange={(e) => setFormData({ ...formData, fecha_fundacion: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  />
                </div>


              </div>

              {/* Información del Representante */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h4 className="text-lg font-semibold text-white mb-4">Datos del Representante</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Nombre Representante */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nombre_representante || ''}
                      onChange={(e) => setFormData({ ...formData, nombre_representante: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                    />
                  </div>

                  {/* DNI Representante */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={formData.dni_representante || ''}
                      onChange={(e) => setFormData({ ...formData, dni_representante: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                      maxLength={8}
                    />
                  </div>

                  {/* Celular Representante */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={formData.cel_representante || ''}
                      onChange={(e) => setFormData({ ...formData, cel_representante: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                      maxLength={9}
                    />
                  </div>

                </div>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Link de Ubicación (Google Maps)
                </label>
                <input
                  type="url"
                  value={formData.ubicacion_link || ''}
                  onChange={(e) => setFormData({ ...formData, ubicacion_link: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  placeholder="https://www.google.com/maps?q=..."
                />
              </div>

            </div>
      </AdminModal>

    </div>
  );
}
