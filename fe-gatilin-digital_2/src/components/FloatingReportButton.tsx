'use client';

import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';

export default function FloatingReportButton() {
  // Estado para la posición (x, y). 
  // Iniciamos en null para que por defecto use CSS (bottom-right) y evitar saltos en hidratación.
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Referencias para controlar la lógica de arrastre y límites
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementOffset = useRef({ x: 0, y: 0 }); // Diferencia entre el click y la esquina del botón

  // Manejador del inicio del arrastre (Mouse y Touch)
  const handleStart = (clientX: number, clientY: number, target: HTMLElement) => {
    isDragging.current = false; // Asumimos que es un click hasta que se demuestre lo contrario
    dragStartPos.current = { x: clientX, y: clientY };
    
    // Calcular el offset para que el botón no "salte" a la esquina del mouse
    const rect = target.getBoundingClientRect();
    elementOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    
    // Si es la primera vez que lo movemos (position es null), fijamos la posición actual para empezar a controlarla con JS
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  // Usamos el alias ReactMouseEvent para el evento sintético de React
  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    handleStart(e.clientX, e.clientY, e.currentTarget);
    
    // Añadir listeners globales para el movimiento
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Usamos el alias ReactTouchEvent para el evento sintético de React
  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, e.currentTarget);
    
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  // Lógica de movimiento con límites de pantalla
  const move = (clientX: number, clientY: number) => {
    // Si nos hemos movido más de 5px, lo consideramos un arrastre
    if (!isDragging.current) {
      const dx = Math.abs(clientX - dragStartPos.current.x);
      const dy = Math.abs(clientY - dragStartPos.current.y);
      if (dx > 5 || dy > 5) isDragging.current = true;
    }

    // Calcular nueva posición tentativa
    let newX = clientX - elementOffset.current.x;
    let newY = clientY - elementOffset.current.y;
    
    // Aplicar límites para que no se salga de la pantalla
    if (containerRef.current) {
      const { offsetWidth: width, offsetHeight: height } = containerRef.current;
      const padding = 4; // Un pequeño margen de seguridad
      const minX = padding;
      const minY = padding;
      const maxX = window.innerWidth - width - padding;
      const maxY = window.innerHeight - height - padding;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
    }

    setPosition({ x: newX, y: newY });
  };

  // Aquí usamos el tipo MouseEvent nativo del DOM (sin alias)
  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault(); // Evitar selecciones de texto
    move(e.clientX, e.clientY);
  };

  // Aquí usamos el tipo TouchEvent nativo del DOM (sin alias)
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Evitar scroll de la página
    const touch = e.touches[0];
    move(touch.clientX, touch.clientY);
  };

  // Finalizar arrastre
  const stopDrag = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  const onMouseUp = () => stopDrag();
  const onTouchEnd = () => stopDrag();

  // Interceptar el clic en el enlace si se estaba arrastrando
  const handleClick = (e: ReactMouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* Definimos la animación personalizada aquí mismo */}
      <style>{`
        @keyframes matraca-wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-matraca {
          animation: matraca-wiggle 1.5s ease-in-out infinite;
          /* Asegura que la sombra también se anime con la transformación */
          filter: drop-shadow(0 0 15px rgba(250, 204, 21, 0.8)); 
        }
        /* Pausamos la animación y reducimos un poco el brillo cuando el usuario interactúa */
        .group:active .animate-matraca {
          animation-play-state: paused;
          filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.6));
        }
      `}</style>

      <div
        ref={containerRef}
        // Si tenemos posición manual usamos left/top, si no, anclamos abajo-derecha por defecto
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : { bottom: '30px', right: '30px' }}
        className="group fixed z-50 cursor-grab active:cursor-grabbing touch-none select-none transition-transform hover:scale-105 active:scale-95"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <a 
          href="/reportar" 
          onClick={handleClick}
          // Aplicamos la clase de animación al contenedor del enlace para que texto e imagen se muevan juntos
          className="relative block animate-matraca"
          draggable={false}
        >
          {/* Texto "REPORTAR" sobre la matraca, sin estilo de botón */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span 
              className="text-[11px] sm:text-xs font-black text-yellow-300 uppercase tracking-widest whitespace-nowrap" 
              style={{ 
                textShadow: '0px 2px 4px rgba(0,0,0,0.9), 0px 0px 8px rgba(250,204,21,0.5)',
                fontFamily: 'var(--font-display, sans-serif)' // Usar fuente display si está disponible
              }}
            >
              Reportar
            </span>
          </div>

          {/* Contenedor de la Imagen */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
             <img
              src="/icons/btn-matraca-reporte.svg"
              alt="Reportar Anomalía"
              className="w-full h-full object-contain relative z-10"
              draggable={false}
            />
          </div>
        </a>
      </div>
    </>
  );
}