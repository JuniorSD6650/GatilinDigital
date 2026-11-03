import { useId } from 'react';

/**
 * Pañuelo de negrito (rombo con ribete y bordados) pintado con el color de la cofradía.
 * Basado en el recurso original /public/icons/btn-negritos-*.svg, pero con el color
 * dinámico y un acabado de seda (brillo, pliegue y sombra).
 */

const ROMBO =
  'M456.301,272.258l-184.042,184.042c-18.119,18.119 -47.54,18.119 -65.659,0l-182.899,-182.899c-18.119,-18.119 -18.119,-47.54 0,-65.659l184.042,-184.042c18.119,-18.119 47.54,-18.119 65.659,-0l182.899,182.899c18.119,18.119 18.119,47.54 -0,65.659Z';
const RIBETE =
  'M467.946,226.095c4.723,15.823 0.841,33.677 -11.645,46.163l-184.042,184.042c-18.119,18.119 -47.54,18.119 -65.659,0l-182.899,-182.899c-12.486,-12.486 -16.368,-30.34 -11.645,-46.163c2.131,7.138 6.012,13.863 11.645,19.496l182.899,182.899c18.119,18.119 47.54,18.119 65.659,-0l184.042,-184.042c5.633,-5.633 9.515,-12.358 11.645,-19.496Z';

const BORDADO_SRC = '/icons/panuelo-bordado.png';

/** Ramas doradas del bordado (mismas posiciones que el SVG original) */
const RAMAS: { x: number; y: number; m: string }[] = [
  { x: 1366.291, y: 2264.958, m: 'matrix(0.934254,0,0,1.062733,-1034.952568,-2293.752525)' },
  { x: 1323.168, y: 2264.958, m: 'matrix(-0.934254,0,0,1.062733,1474.664734,-2293.752525)' },
  { x: 503.832, y: 880.394, m: 'matrix(-0.934254,0,0,-1.062733,709.19589,1302.331261)' },
  { x: 503.832, y: 880.394, m: 'matrix(0.934254,0,0,-1.062733,-229.19589,1302.331261)' },
];

/** Flor central del bordado; `flip` la refleja para la mitad inferior */
function Flor({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? 'matrix(1,0,0,-1,0,480)' : undefined}>
      <ellipse cx="240" cy="152.621" rx="4.023" ry="5.758" fill="#00e5ff" />
      <ellipse cx="240" cy="133.246" rx="8.497" ry="9.698" fill="#d32f2f" />
      <ellipse cx="240" cy="114.911" rx="5.196" ry="5.93" fill="#00c853" />
      <ellipse cx="259.264" cy="114.911" rx="9.347" ry="5.93" fill="#ffc107" />
      <ellipse cx="220.736" cy="114.911" rx="9.347" ry="5.93" fill="#ffc107" />
      <ellipse cx="240" cy="92.803" rx="5.196" ry="10.668" fill="#ffc107" />
      <ellipse cx="227.6" cy="100.2" rx="4.4" ry="8.8" transform="rotate(-41 227.6 100.2)" fill="#ffc107" />
      <ellipse cx="252.4" cy="100.2" rx="4.4" ry="8.8" transform="rotate(41 252.4 100.2)" fill="#ffc107" />
    </g>
  );
}

/** Si el color es parecido al dorado del ribete, el ribete se oscurece para que se distinga */
function ribeteFor(color: string): string {
  const h = color.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '#ffeb3b';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const pareceDorado = r > 200 && g > 170 && b < 120;
  return pareceDorado ? '#b8860b' : '#ffeb3b';
}

interface PanueloProps {
  color: string;
  className?: string;
  /** Muestra los bordados dorados (en tamaños muy pequeños conviene ocultarlos) */
  bordado?: boolean;
  /** Línea de pliegue horizontal (se desactiva cuando hay texto encima) */
  pliegue?: boolean;
}

/**
 * Contorno del rombo en porcentajes, para `clip-path`: limita la zona clicable
 * a la forma del pañuelo (tocar fuera del rombo no hace nada).
 */
export const PANUELO_CLIP = 'polygon(50% 2.5%, 97.5% 50%, 50% 97.5%, 2.5% 50%)';

export default function Panuelo({ color, className, bordado = true, pliegue = true }: PanueloProps) {
  const uid = useId().replace(/:/g, '');
  const brillo = `brillo-${uid}`;
  const sombra = `sombra-${uid}`;
  const recorte = `recorte-${uid}`;

  return (
    // overflow visible: la sombra/aura sale del lienzo 480x480; sin esto se recorta
    // con esquinas planas en lugar de seguir la forma redondeada del rombo.
    <svg viewBox="0 0 480 480" className={className} overflow="visible" style={{ overflow: 'visible' }} aria-hidden focusable="false">
      <defs>
        {/* Brillo de seda: luz arriba-izquierda, sombra abajo-derecha */}
        <linearGradient id={brillo} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </linearGradient>
        <filter id={sombra} x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor={color} floodOpacity="0.55" />
        </filter>
        <clipPath id={recorte}>
          <path d={ROMBO} />
        </clipPath>
      </defs>

      <g filter={`url(#${sombra})`}>
        <path d={ROMBO} fill={color} />
        <path d={RIBETE} fill={ribeteFor(color)} />
      </g>

      {/* Acabado de seda + pliegue central */}
      <g clipPath={`url(#${recorte})`}>
        <rect width="480" height="480" fill={`url(#${brillo})`} />
        {pliegue && (
          <>
            <path d="M24 240 L456 240" stroke="#000" strokeOpacity="0.14" strokeWidth="3" />
            <path d="M24 243 L456 243" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
          </>
        )}
      </g>

      {bordado && (
        <g>
          {RAMAS.map((r, i) => (
            <image key={i} href={BORDADO_SRC} x={r.x} y={r.y} width="126" height="48" transform={r.m} />
          ))}
          <Flor />
          <Flor flip />
        </g>
      )}

      {/* Nudo superior */}
      <circle cx="240" cy="38.859" r="15.903" fill="#121212" />
      <circle cx="235" cy="34" r="4" fill="#fff" fillOpacity="0.25" />
    </svg>
  );
}
