'use client';

import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Botón flotante y arrastrable de reporte (Matraca) */
export default function FloatingButtons() {
  const pathname = usePathname();

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

  // En la propia página de reporte el botón no aporta nada
  if (pathname === '/reportar') return null;

  return (
    <div
      ref={reportRef}
      style={position
        ? { left: `${position.x}px`, top: `${position.y}px` }
        : { bottom: 'max(16px, env(safe-area-inset-bottom))', right: '14px' }
      }
      className="fixed z-40 cursor-grab active:cursor-grabbing touch-none select-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <Link
        href="/reportar"
        onClick={handleClick}
        draggable={false}
        aria-label="Reportar una anomalía"
        className="group relative flex flex-col items-center"
      >
        {/* Matraca */}
        <span className="relative grid h-12 w-12 sm:h-[72px] sm:w-[72px] place-items-center rounded-full bg-noche/75 ring-1 ring-oro/40 shadow-[0_10px_30px_-8px_rgba(242,193,78,0.55)] backdrop-blur transition-transform group-hover:scale-105 group-active:scale-95">
          <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-oro/30 animate-ping [animation-duration:2.8s]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/btn-matraca-reporte.svg"
            alt=""
            className="relative h-9 w-9 sm:h-14 sm:w-14 object-contain animate-matraca"
            draggable={false}
          />
        </span>
        <span className="mt-1 rounded-full border border-oro/40 bg-noche/85 px-2 py-0.5 text-[9px] sm:mt-1.5 sm:px-2.5 sm:text-[10px] font-bold uppercase tracking-[0.16em] text-oro backdrop-blur">
          Reportar
        </span>
      </Link>
    </div>
  );
}
