'use client';

import { useState, useEffect } from 'react';
import { getLocalizadores, updateLocalizadorPassword, getCofradiasList, type Usuario } from '@/services/apis/api-admin';
import { downloadTemplate, uploadExcel } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';
import { getAuthHeaders } from '@/services/apis/api-auth';
import { useAlert } from '@/components/AlertContext';

export default function UsuariosAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cofradias, setCofradias] = useState<{ id: number; nickname_cofradia: string; nombre_cofradia: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el modal de edición/creación
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<Partial<Usuario & { password?: string }>>({});
  const [saving, setSaving] = useState(false);

  // Estados para el modal de cambiar contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsuarios();
    loadCofradias();
  }, []);

  const loadCofradias = async () => {
    try {
      const data = await getCofradiasList();
      setCofradias(data);
    } catch (err) {
      console.error('Error cargando cofradías:', err);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await getLocalizadores();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUsuario || !newPassword) return;

    setSaving(true);

    try {
      await updateLocalizadorPassword(selectedUsuario.id, newPassword);
      showAlert('success', '¡Contraseña actualizada con éxito!');
      setShowPasswordModal(false);
      setSelectedUsuario(null);
      setNewPassword('');
    } catch (err: any) {
      showAlert('error', err.message || 'Error al actualizar contraseña');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setFormData({ role: 'localizador' });
    setShowEditModal(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData(usuario);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isEditing = !!editingUsuario;
      const url = isEditing ? `${API_URL}/usuarios/${editingUsuario.id}` : `${API_URL}/usuarios`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadUsuarios();
        setShowEditModal(false);
        setEditingUsuario(null);
        showAlert('success', isEditing ? 'Localizador actualizado correctamente' : 'Localizador creado correctamente');
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

  const handleDelete = async (id: number, username: string) => {
    showConfirm({
      title: 'Eliminar Localizador',
      message: `¿Estás seguro de eliminar el localizador "${username}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            await loadUsuarios();
            showAlert('success', 'Localizador eliminado correctamente');
          } else {
            showAlert('error', 'Error al eliminar el localizador');
          }
        } catch (err) {
          showAlert('error', 'Error de conexión al eliminar');
          console.error(err);
        }
      }
    });
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.cofradia_nombre && u.cofradia_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadTemplate = () => {
    downloadTemplate('usuarios', 'Plantilla_Usuarios.xlsx');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel('usuarios', file);
      showAlert('success', 'Datos cargados correctamente desde Excel');
      loadUsuarios();
    } catch (err: any) {
      showAlert('error', err.message || 'Error al cargar el archivo Excel');
    }
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-festivo-gold border-t-transparent"></div>
          <p className="text-gray-400">Cargando localizadores...</p>
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
            Gestión de Localizadores
          </h2>
          <p className="text-gray-400">
            {filteredUsuarios.length} localizador{filteredUsuarios.length !== 1 ? 'es' : ''} registrado{filteredUsuarios.length !== 1 ? 's' : ''}
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
            ➕ Nuevo Localizador
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
          placeholder="Buscar localizador..."
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

      {/* Tarjetas de Localizadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.length > 0 ? (
          filteredUsuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-negrito-card border border-white/10 rounded-2xl p-6 hover:border-festivo-cyan/30 transition-all"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-festivo-cyan to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{usuario.username}</p>
                    <p className="text-xs text-gray-400">Localizador</p>
                  </div>
                </div>
              </div>

              {/* Información de la cofradía */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-400">⛪</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Cofradía asignada</p>
                    <p className="text-sm text-white font-medium">
                      {usuario.cofradia_nombre || 'Sin asignar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de cambiar contraseña */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(usuario)}
                  className="flex-1 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleOpenModal(usuario)}
                  className="flex-1 py-2.5 bg-festivo-cyan/10 border border-festivo-cyan/30 text-festivo-cyan rounded-lg hover:bg-festivo-cyan/20 transition-colors text-sm font-medium"
                >
                  🔑 Contraseña
                </button>
              </div>
              <button
                onClick={() => handleDelete(usuario.id, usuario.username)}
                className="w-full mt-2 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                🗑️ Eliminar
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron localizadores
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      {showPasswordModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl max-w-3xl w-full">
            
            {/* Header del Modal */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Usuario: <span className="text-festivo-cyan font-medium">{selectedUsuario.username}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">

              {/* Input de contraseña */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                  Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-cyan/50 focus:border-transparent transition-all"
                  placeholder="Ingresa la nueva contraseña"
                  disabled={saving}
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  La contraseña se guardará sin encriptar para que puedas compartirla fácilmente
                </p>
              </div>

              {/* Información de la cofradía */}
              {selectedUsuario.cofradia_nombre && (
                <div className="bg-festivo-cyan/5 border border-festivo-cyan/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">⛪</div>
                    <div className="text-sm">
                      <p className="text-gray-400">Cofradía asignada:</p>
                      <p className="text-white font-medium mt-1">
                        {selectedUsuario.cofradia_nombre}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer del Modal */}
            <div className="border-t border-white/10 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={saving}
                className="px-6 py-2 bg-neutral-900 border border-white/10 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={saving || !newPassword}
                className="px-6 py-2 bg-gradient-to-r from-festivo-cyan to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Contraseña'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Edición/Creación */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header del Modal */}
            <div className="sticky top-0 bg-negrito-card border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-white">
                  {editingUsuario ? 'Editar Localizador' : 'Nuevo Localizador'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
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
                
                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                    placeholder="usuario123"
                  />
                </div>

                {/* Password (solo al crear) */}
                {!editingUsuario && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {/* Cofradía */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Cofradía *
                  </label>
                  <select
                    value={formData.cofradia_id || ''}
                    onChange={(e) => setFormData({ ...formData, cofradia_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                    required
                  >
                    <option value="">Seleccione una cofradía</option>
                    {cofradias.map((cof) => (
                      <option key={cof.id} value={cof.id}>
                        {cof.nickname_cofradia} - {cof.nombre_cofradia}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-negrito-card border-t border-white/10 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="px-6 py-2 bg-neutral-900 border border-white/10 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.username}
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
