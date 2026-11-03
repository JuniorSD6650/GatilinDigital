'use client';

import { useEffect, useState } from 'react';
import { Vela } from './Decor';

/**
 * "Enciende una vela": gesto simbólico de oración. La intención elegida se guarda
 * solo en este dispositivo (localStorage); no se envía a ningún servidor.
 */
const INTENCIONES = [
  { id: 'familia', texto: 'Por mi familia', oracion: 'Niño Jesús, protege y bendice a mi familia.' },
  { id: 'salud', texto: 'Por la salud', oracion: 'Niño Jesús, da salud y fortaleza a quienes la necesitan.' },
  { id: 'gracias', texto: 'En agradecimiento', oracion: 'Niño Jesús, gracias por todas las bendiciones recibidas.' },
  { id: 'trabajo', texto: 'Por el trabajo', oracion: 'Niño Jesús, bendice nuestros trabajos y nuestros anhelos.' },
  { id: 'cofradia', texto: 'Por mi cofradía', oracion: 'Niño Jesús, acompaña a mi cofradía en su danza y en su fe.' },
  { id: 'difuntos', texto: 'Por quienes partieron', oracion: 'Niño Jesús, ten en tu luz a quienes ya partieron.' },
];

const CLAVE = 'gatilin:vela';

export default function EnciendeVela() {
  const [intencion, setIntencion] = useState<string | null>(null);
  const [encendida, setEncendida] = useState<string | null>(null);

  // Recordar la vela encendida hoy (por dispositivo)
  useEffect(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (guardada?.dia === new Date().toDateString()) {
        // Lectura única de localStorage al montar (no existe en el HTML exportado)
        /* eslint-disable react-hooks/set-state-in-effect */
        setEncendida(guardada.id);
        setIntencion(guardada.id);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const encender = () => {
    if (!intencion) return;
    setEncendida(intencion);
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ id: intencion, dia: new Date().toDateString() }));
    } catch {
      /* sin almacenamiento: la vela se ve encendida igual */
    }
  };

  const actual = INTENCIONES.find((i) => i.id === encendida);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-oro/25 bg-gradient-to-b from-[#1a1028] via-[#120b1c] to-noche p-6 text-center sm:p-10">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(255,170,60,0.18),transparent)]" />

      <p className="eyebrow relative justify-center text-oro">Enciende una vela</p>
      <h2 className="relative mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Deja tu intención ante el Niño</h2>
      <p className="relative mx-auto mt-3 max-w-lg text-white/65">
        Elige por quién o por qué rezas y enciende una vela. Es un gesto personal: tu intención queda solo en tu dispositivo.
      </p>

      <div className="relative mt-8 flex items-end justify-center gap-5 sm:gap-8">
        <Vela alto={46} encendida={Boolean(encendida)} retraso={0.4} className="opacity-70" />
        <Vela alto={84} encendida={Boolean(encendida)} />
        <Vela alto={46} encendida={Boolean(encendida)} retraso={0.9} className="opacity-70" />
      </div>

      {actual ? (
        <div className="relative mt-8 animate-in" aria-live="polite">
          <p className="font-display text-xl italic text-oro">{actual.oracion}</p>
          <p className="mt-2 text-sm text-white/55">Tu vela está encendida hoy · {actual.texto.toLowerCase()}</p>
          <button type="button" onClick={() => setEncendida(null)} className="mt-5 text-sm text-white/50 underline-offset-4 hover:text-white hover:underline">
            Encender otra intención
          </button>
        </div>
      ) : (
        <div className="relative mt-8">
          <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Intención">
            {INTENCIONES.map((i) => (
              <button
                key={i.id}
                type="button"
                role="radio"
                aria-checked={intencion === i.id}
                onClick={() => setIntencion(i.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  intencion === i.id ? 'border-transparent bg-oro text-noche shadow-[0_0_24px_-6px_rgba(242,193,78,0.8)]' : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-oro/50 hover:text-white'
                }`}
              >
                {i.texto}
              </button>
            ))}
          </div>
          <button type="button" onClick={encender} disabled={!intencion} className="btn btn-oro mt-6 px-7 py-3.5 disabled:cursor-not-allowed disabled:opacity-40">
            🕯️ Encender mi vela
          </button>
        </div>
      )}
    </div>
  );
}
