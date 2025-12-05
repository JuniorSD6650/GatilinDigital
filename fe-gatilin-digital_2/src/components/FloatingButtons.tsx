'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import Link from 'next/link';

type ButtonId = 'register' | 'report';

export default function FloatingButtons() {
  // --- ESTADO PARA POSICIONES INDIVIDUALES ---
  const [positions, setPositions] = useState<{
    register: { x: number, y: number } | null;
    report: { x: number, y: number } | null;
  }>({
    register: null,
    report: null
  });

  // Estado para controlar la visibilidad del botón de registro
  // Iniciamos en 'false' para evitar parpadeos. Solo se muestra si comprobamos que NO se ha cerrado.
  const [showRegister, setShowRegister] = useState(false);

  // Efecto para comprobar si se debe mostrar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isHidden = sessionStorage.getItem('hide_register_btn');
      // Si NO existe la marca de oculto, entonces lo mostramos
      if (isHidden !== 'true') {
        setShowRegister(true);
      }
    }
  }, []);

  // --- REFS ---
  const activeDrag = useRef<ButtonId | null>(null);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementOffset = useRef({ x: 0, y: 0 });

  const registerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE ARRASTRE ---
  const handleStart = (clientX: number, clientY: number, id: ButtonId, target: HTMLElement) => {
    isDragging.current = false;
    activeDrag.current = id;
    dragStartPos.current = { x: clientX, y: clientY };
    
    const rect = target.getBoundingClientRect();
    elementOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    
    if (!positions[id]) {
      setPositions(prev => ({
        ...prev,
        [id]: { x: rect.left, y: rect.top }
      }));
    }
  };

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>, id: ButtonId) => {
    handleStart(e.clientX, e.clientY, id, e.currentTarget);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>, id: ButtonId) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, id, e.currentTarget);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const move = (clientX: number, clientY: number) => {
    if (!activeDrag.current) return;

    if (!isDragging.current) {
      const dx = Math.abs(clientX - dragStartPos.current.x);
      const dy = Math.abs(clientY - dragStartPos.current.y);
      if (dx > 5 || dy > 5) isDragging.current = true;
    }

    let newX = clientX - elementOffset.current.x;
    let newY = clientY - elementOffset.current.y;
    
    const currentRef = activeDrag.current === 'register' ? registerRef : reportRef;

    if (currentRef.current) {
      const { offsetWidth: width, offsetHeight: height } = currentRef.current;
      const padding = 10;
      const maxX = window.innerWidth - width - padding;
      const maxY = window.innerHeight - height - padding;

      newX = Math.max(padding, Math.min(newX, maxX));
      newY = Math.max(padding, Math.min(newY, maxY));
    }

    setPositions(prev => ({
      ...prev,
      [activeDrag.current!]: { x: newX, y: newY }
    }));
  };

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    move(e.clientX, e.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    move(touch.clientX, touch.clientY);
  };

  const stopDrag = () => {
    activeDrag.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  const onMouseUp = () => stopDrag();
  const onTouchEnd = () => stopDrag();

  const handleClick = (e: ReactMouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Función para cerrar y guardar preferencia
  const handleCloseRegister = (e: ReactMouseEvent | ReactTouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRegister(false);
    // Guardamos en sessionStorage para que persista durante la navegación
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('hide_register_btn', 'true');
    }
  };

  return (
    <>
      <style>{`
        /* Animación Matraca (Wiggle) */
        @keyframes matraca-wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        .animate-matraca {
          animation: matraca-wiggle 2s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.4)); 
        }

        /* Animación de Latido para el texto */
        @keyframes pulse-glow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(236, 72, 153, 0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(236, 72, 153, 0.8); }
        }
        .animate-text-pulse {
            animation: pulse-glow 2s infinite;
        }
        
        /* Animación de entrada suave */
        .fade-in-scale {
            animation: fadeInScale 0.3s ease-out forwards;
        }
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* =======================================
          BOTÓN 1: REPORTAR (Matraca - Arriba)
          Posición inicial: bottom: 110px
         ======================================= */}
      <div
        ref={reportRef}
        style={positions.report 
          ? { left: `${positions.report.x}px`, top: `${positions.report.y}px` } 
          : { bottom: '110px', right: '30px' }
        }
        className="fixed z-50 cursor-grab active:cursor-grabbing touch-none select-none hover:scale-105 active:scale-95 transition-transform"
        onMouseDown={(e) => onMouseDown(e, 'report')}
        onTouchStart={(e) => onTouchStart(e, 'report')}
      >
        <Link 
          href="/reportar" 
          onClick={handleClick}
          draggable={false}
          className="relative block animate-matraca"
        >
          {/* Texto Flotante */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span 
              className="text-[11px] sm:text-xs font-black text-yellow-300 uppercase tracking-widest whitespace-nowrap" 
              style={{ 
                textShadow: '0px 2px 4px rgba(0,0,0,0.9), 0px 0px 8px rgba(250,204,21,0.5)',
              }}
            >
              Reportar
            </span>
          </div>

          {/* Icono Matraca */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
             <img
              src="/icons/btn-matraca-reporte.svg"
              alt="Reportar Anomalía"
              className="w-full h-full object-contain relative z-10"
              draggable={false}
            />
          </div>
        </Link>
      </div>

      {/* =======================================
          BOTÓN 2: REGISTRARSE (Texto Llamativo - Abajo y Cerrable)
          Posición inicial: bottom: 30px
         ======================================= */}
      {showRegister && (
        <div
            ref={registerRef}
            style={positions.register 
            ? { left: `${positions.register.x}px`, top: `${positions.register.y}px` } 
            : { bottom: '30px', right: '30px' }
            }
            className="fixed z-50 cursor-grab active:cursor-grabbing touch-none select-none fade-in-scale"
            onMouseDown={(e) => onMouseDown(e, 'register')}
            onTouchStart={(e) => onTouchStart(e, 'register')}
        >
            <div className="relative group/closeable">
                {/* Botón de CERRAR (X) */}
                <button
                    onClick={handleCloseRegister}
                    onMouseDown={(e) => e.stopPropagation()} 
                    onTouchStart={(e) => e.stopPropagation()}
                    className="absolute -top-3 -right-2 z-50 bg-white text-black border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/closeable:opacity-100 duration-300 cursor-pointer"
                    title="Cerrar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>

                <Link 
                href="/registro" 
                onClick={handleClick}
                draggable={false}
                className="group relative block"
                >
                    {/* Botón Pastilla Gradiente */}
                    <div className="
                    animate-text-pulse
                    px-6 py-3 
                    rounded-full 
                    bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                    border-2 border-white/20
                    flex items-center justify-center
                    hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
                    transition-all duration-300
                    shadow-xl
                    ">
                        <span className="text-sm font-black text-white uppercase tracking-widest whitespace-nowrap drop-shadow-md">
                        ¡Participa Aquí! ✨
                        </span>
                    </div>
                </Link>
            </div>
        </div>
      )}

    </>
  );
}