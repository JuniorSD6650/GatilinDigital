'use client';

import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import Link from 'next/link';

export default function FloatingButtons() {
  // --- ESTADO PARA POSICIÓN ---
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null);

  // --- REFS ---
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementOffset = useRef({ x: 0, y: 0 });
  const reportRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE ARRASTRE ---
  const handleStart = (clientX: number, clientY: number, target: HTMLElement) => {
    isDragging.current = false;
    dragStartPos.current = { x: clientX, y: clientY };
    
    const rect = target.getBoundingClientRect();
    elementOffset.current = { x: clientX - rect.left, y: clientY - rect.top };
    
    if (!position) {
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    handleStart(e.clientX, e.clientY, e.currentTarget);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, e.currentTarget);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const move = (clientX: number, clientY: number) => {
    if (!isDragging.current) {
      const dx = Math.abs(clientX - dragStartPos.current.x);
      const dy = Math.abs(clientY - dragStartPos.current.y);
      if (dx > 5 || dy > 5) isDragging.current = true;
    }

    let newX = clientX - elementOffset.current.x;
    let newY = clientY - elementOffset.current.y;

    if (reportRef.current) {
      const { offsetWidth: width, offsetHeight: height } = reportRef.current;
      const padding = 10;
      const maxX = window.innerWidth - width - padding;
      const maxY = window.innerHeight - height - padding;

      newX = Math.max(padding, Math.min(newX, maxX));
      newY = Math.max(padding, Math.min(newY, maxY));
    }

    setPosition({ x: newX, y: newY });
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
      `}</style>

      {/* BOTÓN: REPORTAR (Matraca) */}
      <div
        ref={reportRef}
        style={position 
          ? { left: `${position.x}px`, top: `${position.y}px` } 
          : { bottom: '30px', right: '30px' }
        }
        className="fixed z-50 cursor-grab active:cursor-grabbing touch-none select-none hover:scale-105 active:scale-95 transition-transform"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
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
    </>
  );
}