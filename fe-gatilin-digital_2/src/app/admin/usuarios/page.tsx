'use client';

import { useState, useEffect } from 'react';
import { getLocalizadores, updateLocalizadorPassword, type Usuario } from '@/services/apis/api-admin';
import { downloadTemplate, uploadExcel } from '@/services/apis/api-admin';

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

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
    setSuccess('');
    setShowModal(true);
  };

  const handleUpdatePassword = async () => {
    if (!selectedUsuario || !newPassword) return;

    setSaving(true);
    setSuccess('');

    try {
      await updateLocalizadorPassword(selectedUsuario.id, newPassword);
      setSuccess('¡Contraseña actualizada con éxito!');
      setTimeout(() => {
        setShowModal(false);
        setSelectedUsuario(null);
        setNewPassword('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar contraseña');
      console.error(err);
    } finally {
      setSaving(false);
    }
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
      alert('Datos cargados correctamente');
      loadUsuarios();
    } catch (err: any) {
      alert(err.message);
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
              <button
                onClick={() => handleOpenModal(usuario)}
                className="w-full py-2.5 bg-festivo-cyan/10 border border-festivo-cyan/30 text-festivo-cyan rounded-lg hover:bg-festivo-cyan/20 transition-colors text-sm font-medium"
              >
                🔑 Cambiar Contraseña
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
      {showModal && selectedUsuario && (
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
                  onClick={() => setShowModal(false)}
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
              
              {/* Mensaje de éxito */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm animate-in fade-in">
                  ✓ {success}
                </div>
              )}

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
                  disabled={saving || !!success}
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
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-6 py-2 bg-neutral-900 border border-white/10 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={saving || !newPassword || !!success}
                className="px-6 py-2 bg-gradient-to-r from-festivo-cyan to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar Contraseña'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
