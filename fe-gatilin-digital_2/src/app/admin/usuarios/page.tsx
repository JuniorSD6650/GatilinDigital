'use client';

import { useState, useEffect } from 'react';
import { getLocalizadores, updateLocalizadorPassword, getCofradiasList, type Usuario } from '@/services/apis/api-admin';
import { downloadTemplate } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';
import { getAuthHeaders } from '@/services/apis/api-auth';
import { useAlert } from '@/components/AlertContext';
import { IconChurch } from '@/components/ui/Icons';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions,
  PageToolbar, TemplateButton, UploadExcelButton, NewButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField,
} from '@/components/admin/AdminUI';

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
    } catch (err) {
      showAlert('error', (err as Error).message || 'Error al actualizar contraseña');
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


  if (loading) return <LoadingState label="Cargando localizadores..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <PageToolbar
        title="Localizadores"
        subtitle={`${usuarios.length} localizador${usuarios.length !== 1 ? 'es' : ''} registrado${usuarios.length !== 1 ? 's' : ''}`}
      >
        <TemplateButton onClick={handleDownloadTemplate} />
        <UploadExcelButton endpoint="usuarios" onDone={loadUsuarios} />
        <NewButton onClick={handleCreate}>Nuevo Localizador</NewButton>
      </PageToolbar>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por usuario o cofradía..." />
      </FilterBar>

      <ErrorBanner>{error}</ErrorBanner>

      {/* Tarjetas de Localizadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsuarios.length > 0 ? (
          filteredUsuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-negrito-card p-5 transition-colors hover:border-white/20"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-base font-bold uppercase text-cyan-300">
                    {usuario.username.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{usuario.username}</p>
                    <p className="text-xs text-gray-400">Localizador</p>
                  </div>
                </div>
              </div>

              {/* Información de la cofradía */}
              <div className="mb-4 flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <IconChurch className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Cofradía asignada</p>
                    <p className="text-sm text-white font-medium">
                      {usuario.cofradia_nombre || 'Sin asignar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <RowActions className="border-t border-white/5 pt-3">
                <ActionButton kind="edit" onClick={() => handleEdit(usuario)} />
                <ActionButton kind="key" onClick={() => handleOpenModal(usuario)} />
                <ActionButton kind="delete" onClick={() => handleDelete(usuario.id, usuario.username)} />
              </RowActions>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-white/10 bg-negrito-card">
            <EmptyState
              title={usuarios.length === 0 ? 'Aún no hay localizadores' : 'No se encontraron localizadores'}
              description={usuarios.length === 0 ? 'Crea un localizador para que una cofradía pueda compartir su ubicación.' : 'Prueba con otra búsqueda.'}
            />
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      <AdminModal
        open={showPasswordModal && !!selectedUsuario}
        onClose={() => setShowPasswordModal(false)}
        locked={saving}
        title="Cambiar contraseña"
        subtitle={selectedUsuario && <>Usuario: <span className="font-medium text-festivo-cyan">{selectedUsuario.username}</span></>}
        size="md"
        footer={
          <>
            <ModalCancel onClick={() => setShowPasswordModal(false)} disabled={saving} />
            <ModalSave onClick={handleUpdatePassword} loading={saving} disabled={!newPassword}>Guardar contraseña</ModalSave>
          </>
        }
      >
        {selectedUsuario && (
            <div className="space-y-4">

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
        )}
      </AdminModal>

      {/* Modal de Edición/Creación */}
      <AdminModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        locked={saving}
        title={editingUsuario ? 'Editar Localizador' : 'Nuevo Localizador'}
        size="md"
        footer={
          <>
            <ModalCancel onClick={() => setShowEditModal(false)} disabled={saving} />
            <ModalSave onClick={handleSave} loading={saving} disabled={!formData.username} />
          </>
        }
      >
            <div className="space-y-4">
              
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
      </AdminModal>

    </div>
  );
}
