'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getAuthHeaders } from '@/services/apis/api-auth';
import { API_URL } from '@/services/api';
import Image from 'next/image';

export default function LocalizadorPage() {
  const [user, setUser] = useState<any>(null);
  const [ubicacionLink, setUbicacionLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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

        {/* Botón para abrir tutorial */}
        <button
          onClick={() => {
            setShowTutorial(true);
            setCurrentStep(0);
          }}
          className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 hover:bg-blue-500/20 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📱</div>
              <div className="text-left">
                <p className="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                  ¿Cómo compartir mi ubicación?
                </p>
                <p className="text-xs text-gray-400">
                  Ver guía paso a paso con imágenes
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>

      </div>

      {/* Modal Tutorial */}
      {showTutorial && <TutorialModal currentStep={currentStep} setCurrentStep={setCurrentStep} onClose={() => setShowTutorial(false)} />}

    </div>
  );
}

// Componente Modal Tutorial
function TutorialModal({ currentStep, setCurrentStep, onClose }: { currentStep: number; setCurrentStep: (step: number) => void; onClose: () => void }) {
  const steps = [
    {
      title: "Abre Google Maps",
      description: "Abre la aplicación de Google Maps en tu celular",
      image: null,
    },
    {
      title: "Presiona tu perfil",
      description: "Toca el icono de tu perfil en la esquina superior derecha",
      image: "/images/tutorial1.webp",
    },
    {
      title: "Compartir Ubicación",
      description: "Selecciona la opción 'Compartir ubicación'",
      image: "/images/tutorial2.webp",
    },
    {
      title: "Compartir con alguien más",
      description: "Presiona el botón 'Compartir con alguien más' o similar",
      image: "/images/tutorial3.webp",
    },
    {
      title: "Configurar tiempo y copiar",
      description: "1. Define el tiempo de compartición\n2. Presiona 'Copiar en el portapapeles'",
      image: "/images/tutorial4.webp",
    },
    {
      title: "Otorgar permisos (si es necesario)",
      description: "Si te pide permisos, presiona 'Permitir' o 'Ir a la configuración'",
      image: "/images/tutorial5.webp",
    },
    {
      title: "Permitir siempre",
      description: "En configuración, selecciona 'Permitir siempre' o 'Permitir todo el tiempo'",
      image: "/images/tutorial6.webp",
    },
    {
      title: "Pegar enlace",
      description: "Vuelve a esta página y pega el enlace copiado en el campo de arriba",
      image: null,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-negrito-card border border-white/10 rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-negrito-card border-b border-white/10 p-4 md:p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-display font-bold text-festivo-cyan">
              Guía de Compartir Ubicación
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-6 pt-3 flex-shrink-0">
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-festivo-cyan to-blue-600 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content - Layout horizontal con scroll en móviles */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden">
          <div className="h-full flex flex-col md:flex-row gap-4 p-4 md:p-6">
            
            {/* Columna izquierda: Información */}
            <div className="md:w-1/2 flex flex-col justify-center space-y-3 md:space-y-4">
              
              {/* Número del paso */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-festivo-cyan/20 text-festivo-cyan text-lg md:text-xl font-bold flex-shrink-0">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg md:text-2xl font-bold text-white">
                    {currentStepData.title}
                  </h4>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-gray-300 text-sm md:text-lg whitespace-pre-line leading-relaxed">
                {currentStepData.description}
              </p>

              {/* Nota especial para pasos de permisos */}
              {(currentStep === 5 || currentStep === 6) && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-yellow-400 font-semibold text-xs md:text-sm">Nota importante</p>
                      <p className="text-gray-300 text-xs mt-1">
                        Estos pasos solo son necesarios si Google Maps te pide permisos. Si no aparece esta pantalla, puedes continuar al siguiente paso.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: Imagen */}
            <div className="md:w-1/2 flex items-center justify-center flex-shrink-0">
              {currentStepData.image ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <Image
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    width={305}
                    height={678}
                    className="h-auto max-h-[35vh] md:max-h-[60vh] w-auto object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-white/5 rounded-2xl border border-white/10 min-h-[200px] md:min-h-[300px]">
                  <div className="text-center space-y-3">
                    <div className="text-4xl md:text-6xl">
                      {currentStep === 0 ? '🗺️' : '✅'}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm px-8">
                      {currentStep === 0 
                        ? 'Abre la app de Google Maps desde tu celular'
                        : '¡Listo! Ahora pega el enlace en el campo de arriba'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-negrito-card border-t border-white/10 p-3 md:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Botón Anterior */}
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 md:w-5 h-4 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm md:text-base">Anterior</span>
            </button>

            {/* Indicadores de pasos */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-festivo-cyan' 
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Botón Siguiente o Entendido */}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-festivo-cyan to-blue-600 hover:shadow-lg hover:shadow-festivo-cyan/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <span className="text-sm md:text-base">Siguiente</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 md:w-5 h-4 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 md:w-5 h-4 md:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm md:text-base">¡Entendido!</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
