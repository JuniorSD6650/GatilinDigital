'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si ya se mostró el modal en esta sesión
    const hasSeenModal = sessionStorage.getItem('welcome_modal_seen');
    
    if (!hasSeenModal) {
      // Pequeño delay para mejor experiencia
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('welcome_modal_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        /* Animación de aparición */
        @keyframes modalFadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Animación de brillo para el botón */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-modal {
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        .animate-backdrop {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }

        .btn-shimmer {
          background: linear-gradient(
            90deg,
            #eab308 0%,
            #fbbf24 25%,
            #fff 50%,
            #fbbf24 75%,
            #eab308 100%
          );
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-backdrop"
        onClick={handleClose}
      >
        {/* Modal */}
        <div 
          className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-2 border-yellow-500/50 rounded-3xl max-w-lg w-full shadow-2xl shadow-yellow-500/20 animate-modal overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header con decoración */}
          <div className="relative bg-gradient-to-r from-yellow-500/20 via-yellow-600/20 to-yellow-500/20 p-8 text-center border-b border-yellow-500/30">
            <div className="absolute inset-0 bg-[url('/icons/btn-matraca-reporte.svg')] opacity-5 bg-center bg-no-repeat bg-contain"></div>
            
            {/* Logo */}
            <div className="relative flex justify-center mb-4">
              <div className="w-20 h-20 relative">
                <Image 
                  src="/logo.svg" 
                  alt="GatilínDigital" 
                  width={80}
                  height={80}
                  className="w-full h-full drop-shadow-2xl"
                />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-black text-yellow-500 mb-2 drop-shadow-lg">
              ¡Bienvenido!
            </h2>
            <p className="text-yellow-300/90 text-sm md:text-base font-medium">
              A la festividad de los Negritos de Huánuco
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Mensaje principal */}
            <div className="text-center space-y-3">
              <p className="text-white text-lg md:text-l font-semibold leading-relaxed">
                ¿Quieres formar parte de esta tradición?
              </p>
            </div>

            {/* Características */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Participa en eventos</p>
                  <p className="text-gray-400 text-xs mt-0.5">Accede al cronograma completo</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Únete a la comunidad</p>
                  <p className="text-gray-400 text-xs mt-0.5">Conecta con otros cofrades</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Contenido exclusivo</p>
                  <p className="text-gray-400 text-xs mt-0.5">Fotos, videos y más</p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              {/* Botón principal */}
              <Link
                href="/registro"
                onClick={handleClose}
                className="block w-full py-4 rounded-2xl btn-shimmer text-black font-black text-lg uppercase tracking-wider text-center shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105 active:scale-95"
              >
                ¡Registrarme Ahora! ✨
              </Link>

              {/* Botón secundario */}
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors border border-white/10"
              >
                Tal vez más tarde
              </button>
            </div>

            {/* Texto pequeño */}
            <p className="text-center text-gray-500 text-xs">
              Este mensaje solo aparece una vez por sesión
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
