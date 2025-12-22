'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/services/api';
import { getAuthHeaders } from '@/services/apis/api-auth';
import { downloadTemplate, uploadExcel, getOrganizacionesList } from '@/services/apis/api-admin';
import { useAlert } from '@/components/AlertContext';

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

  // Estados para el modal de edición
  const [showModal, setShowModal] = useState(false);
  const [editingCofradia, setEditingCofradia] = useState<Cofradia | null>(null);
  const [formData, setFormData] = useState<Partial<Cofradia>>({});
  const [saving, setSaving] = useState(false);

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
        dataToSend.organizacion_id = 1;
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

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel('cofradia', file);
      showAlert('success', 'Datos cargados correctamente desde Excel');
      loadCofradias();
    } catch (err: any) {
      showAlert('error', err.message || 'Error al cargar el archivo Excel');
    }
    e.target.value = '';
  };
  const filteredCofradias = cofradias.filter(c => 
    c.nickname_cofradia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nombre_cofradia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-festivo-gold border-t-transparent"></div>
          <p className="text-gray-400">Cargando cofradías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            Gestión de Cofradías
          </h2>
          <p className="text-gray-400">
            {filteredCofradias.length} cofradía{filteredCofradias.length !== 1 ? 's' : ''} registrada{filteredCofradias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
          >
            📥 Plantilla
          </button>
          <label className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium cursor-pointer">
            📤 Cargar Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
          </label>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 transition-colors text-sm font-bold"
          >
            ➕ Nueva Cofradía
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 bg-negrito-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 focus:border-transparent transition-all"
          placeholder="Buscar cofradía..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Tabla de Cofradías */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Cofradía
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Representante
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Distrito
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCofradias.length > 0 ? (
                filteredCofradias.map((cofradia) => (
                  <tr key={cofradia.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{cofradia.nickname_cofradia}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">{cofradia.nombre_cofradia}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white">{cofradia.nombre_representante || '-'}</p>
                        <p className="text-gray-400">{cofradia.cel_representante || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {cofradia.distrito || 'Huánuco'}
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cofradia)}
                          className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cofradia.id, cofradia.nickname_cofradia)}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron cofradías
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición/Creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header del Modal */}
            <div className="sticky top-0 bg-negrito-card border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-white">
                  {editingCofradia ? 'Editar Cofradía' : 'Nueva Cofradía'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-6 space-y-4">
              
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

                {/* Organización */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Organización *
                  </label>
                  <select
                    value={formData.organizacion_id || 1}
                    onChange={(e) => setFormData({ ...formData, organizacion_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  >
                    {organizaciones.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.nombre}
                      </option>
                    ))}
                  </select>
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

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-negrito-card border-t border-white/10 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-6 py-2 bg-neutral-900 border border-white/10 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-festivo-gold to-yellow-600 text-negrito-black font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
