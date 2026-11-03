'use client';

// Registra el service worker (app instalable + modo sin conexión) y muestra
// un aviso cuando no hay internet.
import { useEffect, useState } from 'react';
import { registrarSW } from '@/lib/push';
import { IconWifiOff } from './ui/Icons';

export default function PwaProvider() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // En desarrollo el SW cachearía el código en caliente: solo en producción
    if (process.env.NODE_ENV === 'production') registrarSW();

    const actualizar = () => setOffline(!navigator.onLine);
    actualizar();
    window.addEventListener('online', actualizar);
    window.addEventListener('offline', actualizar);
    return () => {
      window.removeEventListener('online', actualizar);
      window.removeEventListener('offline', actualizar);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-[70] flex items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-sm font-semibold text-noche">
      <IconWifiOff className="h-4 w-4" />
      Sin conexión: estás viendo la información guardada.
    </div>
  );
}
