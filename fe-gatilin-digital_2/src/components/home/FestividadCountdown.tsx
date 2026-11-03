'use client';

import { useSyncExternalStore } from 'react';
import Campana from '@/components/decor/Campana';

type Estado = { tipo: 'en-curso' } | { tipo: 'faltan'; dias: number };

/** Calcula si la festividad (24 dic – 20 ene) está en curso o cuántos días faltan */
function calcularEstado(now: Date): Estado {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0 = enero
  const d = now.getDate();

  const enCurso = (m === 11 && d >= 24) || (m === 0 && d <= 20);
  if (enCurso) return { tipo: 'en-curso' };

  const hoy = new Date(y, m, d);
  const inicio = new Date(y, 11, 24);
  const dias = Math.round((inicio.getTime() - hoy.getTime()) / 86_400_000);
  return { tipo: 'faltan', dias };
}

// Instantánea primitiva (estable entre lecturas) para useSyncExternalStore
const getSnapshot = () => {
  const e = calcularEstado(new Date());
  return e.tipo === 'en-curso' ? 'en-curso' : `faltan:${e.dias}`;
};
const getServerSnapshot = () => null;
const subscribe = () => () => {};

export default function FestividadCountdown() {
  // En el build estático (servidor) no se renderiza; se calcula en el cliente
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!snap) return <div className="h-10" aria-hidden />;
  const estado: Estado = snap === 'en-curso' ? { tipo: 'en-curso' } : { tipo: 'faltan', dias: Number(snap.split(':')[1]) };

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-oro/30 bg-black/35 py-1.5 pl-2 pr-4 backdrop-blur animate-in">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-oro/15">
        <Campana className="w-3.5 h-4" ring="auto" />
      </span>
      {estado.tipo === 'en-curso' ? (
        <span className="text-sm text-white/85">
          <strong className="font-semibold text-oro">¡La festividad está en curso!</strong> Vive cada día con nosotros.
        </span>
      ) : (
        <span className="text-sm text-white/85">
          Faltan <strong className="font-semibold text-oro tabular-nums">{estado.dias}</strong>{' '}
          {estado.dias === 1 ? 'día' : 'días'} para la Navidad más grande del mundo
        </span>
      )}
    </div>
  );
}
