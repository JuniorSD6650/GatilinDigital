'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeaders } from '@/services/apis/api-auth';
import { API_URL } from '@/services/api';

export default function LocalizadorPage() {
  const [user, setUser] = useState<any>(null);
  const [ubicacionLink, setUbicacionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Cargar ubicación actual de la cofradía
    if (currentUser?.cofradia_id) {
      loadCurrentLocation(currentUser.cofradia_id);
    }
  }, []);

  const loadCurrentLocation = async (cofradiaId: number) => {
    try {
      const response = await fetch(`${API_URL}/cofradia/${cofradiaId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUbicacionLink(data.ubicacion_link || '');
      }
    } catch (err) {
      console.error('Error al cargar ubicación:', err);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.cofradia_id) {
      setError('No tienes una cofradía asignada');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/cofradia/${user.cofradia_id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ubicacion_link: ubicacionLink,
        }),
      });

      if (response.ok) {
        setSuccess('¡Ubicación actualizada con éxito!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al actualizar ubicación');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Título */}
      <div>
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Actualizar Ubicación
        </h2>
        <p className="text-gray-400">
          Comparte tu ubicación en tiempo real con los seguidores de tu cofradía
        </p>
      </div>

      {/* Información de la Cofradía */}
      <div className="bg-gradient-to-r from-festivo-cyan/10 to-blue-600/10 border border-festivo-cyan/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">⛪</div>
          <div>
            <p className="text-sm text-gray-400">Cofradía asignada</p>
            <p className="text-xl font-display font-bold text-festivo-cyan">
              {user?.cofradia_nombre || 'Cargando...'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de Actualización */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 space-y-6">
        
        <form onSubmit={handleUpdateLocation} className="space-y-6">
          
          {/* Mensajes de Éxito/Error */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
              ✓ {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              ✗ {error}
            </div>
          )}

          {/* Link de Google Maps */}
          <div className="space-y-2">
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-300">
              Link de Ubicación
            </label>
            <input
              id="ubicacion"
              type="url"
              value={ubicacionLink}
              onChange={(e) => setUbicacionLink(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-cyan/50 focus:border-transparent transition-all"
              placeholder="https://maps.app.goo.gl/..."
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Pega el enlace de "Compartir ubicación" de Google Maps desde tu celular
            </p>
          </div>

          {/* Link actual guardado */}
          {ubicacionLink && (
            <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🗺️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-300 mb-1">Enlace actual:</p>
                  <a 
                    href={ubicacionLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-festivo-cyan hover:text-festivo-cyan/80 text-sm break-all underline"
                  >
                    {ubicacionLink}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Actualizar */}
          <button
            type="submit"
            disabled={loading || !ubicacionLink}
            className="w-full py-4 bg-gradient-to-r from-festivo-cyan to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-festivo-cyan/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </span>
            ) : (
              'Actualizar Ubicación'
            )}
          </button>

        </form>

        {/* Información adicional */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="font-semibold text-blue-400">Cómo compartir tu ubicación desde el celular:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Abre Google Maps en tu celular</li>
                <li>Toca el punto azul de tu ubicación actual</li>
                <li>Selecciona "Compartir ubicación"</li>
                <li>Copia el enlace que aparece (ej: https://maps.app.goo.gl/...)</li>
                <li>Pégalo en el campo de arriba y guarda</li>
              </ol>
              <p className="text-xs text-gray-400 mt-2">
                Los seguidores podrán ver tu ubicación en tiempo real en la sección "Sigueteo"
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
