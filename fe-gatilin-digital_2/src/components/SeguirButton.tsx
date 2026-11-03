'use client';

import { useState } from 'react';
import { useFavoritas, toggleFavorita } from '@/lib/favoritos';
import { activarNotificaciones, pushSoportado, sincronizarFavoritas, suscripcionActual } from '@/lib/push';
import { useAlert } from './AlertContext';
import { IconStar, IconStarFilled, IconBell, Spinner } from './ui/Icons';

/**
 * Marca la cofradía como favorita. Al seguir una cofradía se ofrece activar
 * avisos: cuando inicia su recorrido y 30 minutos antes de cada actividad.
 */
export default function SeguirButton({ cofradiaId, nombre, color }: { cofradiaId: number; nombre: string; color: string }) {
  const favoritas = useFavoritas();
  const { showAlert } = useAlert();
  const [cargando, setCargando] = useState(false);
  const siguiendo = favoritas.includes(cofradiaId);

  const handleClick = async () => {
    const nuevas = toggleFavorita(cofradiaId);
    if (!nuevas.includes(cofradiaId)) {
      await sincronizarFavoritas(nuevas);
      showAlert('info', `Dejaste de seguir a ${nombre}.`);
      return;
    }

    // Ya suscrito: solo actualizar la lista en el servidor
    if (await suscripcionActual()) {
      await sincronizarFavoritas(nuevas);
      showAlert('success', `Te avisaremos cuando ${nombre} salga en recorrido.`);
      return;
    }
    if (!pushSoportado()) {
      showAlert('success', `Agregaste ${nombre} a tus favoritas.`);
      return;
    }

    setCargando(true);
    try {
      await activarNotificaciones(nuevas);
      showAlert('success', `¡Listo! Te avisaremos cuando ${nombre} salga en recorrido y antes de sus actividades.`);
    } catch (err) {
      // Sigue siendo favorita aunque no se activen las notificaciones
      showAlert('info', `${nombre} quedó en tus favoritas. ${(err as Error).message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      aria-pressed={siguiendo}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
      style={siguiendo ? { borderColor: color, color, backgroundColor: 'rgba(0,0,0,0.35)' } : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(0,0,0,0.3)' }}
    >
      {cargando ? <Spinner className="h-4 w-4" /> : siguiendo ? <IconStarFilled className="h-4 w-4" /> : <IconStar className="h-4 w-4" />}
      {siguiendo ? 'Siguiendo' : 'Seguir y recibir avisos'}
      {!siguiendo && <IconBell className="h-3.5 w-3.5 opacity-60" />}
    </button>
  );
}
