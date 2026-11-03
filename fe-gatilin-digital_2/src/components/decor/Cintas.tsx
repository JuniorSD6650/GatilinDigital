const COLORES = ['#ff1f8f', '#ffd60a', '#19c26b', '#2f6bff', '#9b3dde', '#ff7a1a', '#12c7e6', '#ef2b3c'];

interface CintasProps {
  className?: string;
  /** Cantidad de cintas (máx. 8) */
  count?: number;
  /** Refleja horizontalmente el abanico */
  mirror?: boolean;
  /** Anima el vaivén de las cintas */
  animated?: boolean;
}

/**
 * Tirantes / cintas de colores que cuelgan del traje del Negrito.
 * SVG ligero, sin imágenes externas.
 */
export default function Cintas({ className = 'w-24 h-48', count = 7, mirror = false, animated = true }: CintasProps) {
  const n = Math.min(Math.max(count, 2), COLORES.length);
  const w = 9;
  const spread = 30; // grados totales de apertura

  return (
    <svg
      viewBox="0 0 120 230"
      aria-hidden="true"
      className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: n }).map((_, i) => {
        const angle = -spread / 2 + (spread / (n - 1)) * i;
        const L = 150 + ((i * 37) % 60); // largos variados
        const x0 = 60 - w / 2;
        const top = 10;
        const d = [
          `M${x0} ${top}`,
          `C${x0 + 4} ${top + L * 0.35} ${x0 - 4} ${top + L * 0.65} ${x0} ${top + L}`,
          `L${x0 + w / 2} ${top + L - 7}`,
          `L${x0 + w} ${top + L}`,
          `C${x0 + w - 4} ${top + L * 0.65} ${x0 + w + 4} ${top + L * 0.35} ${x0 + w} ${top}`,
          'Z',
        ].join(' ');

        return (
          <g
            key={i}
            className={animated ? 'sway' : undefined}
            style={{
              transformOrigin: '60px 10px',
              animationDelay: `${(i % 4) * -0.7}s`,
              animationDuration: `${3.2 + (i % 3) * 0.6}s`,
            }}
          >
            <path d={d} fill={COLORES[i]} transform={`rotate(${angle} 60 10)`} opacity={0.92} />
          </g>
        );
      })}
      {/* Nudo dorado */}
      <circle cx="60" cy="10" r="7" fill="#f2c14e" />
      <circle cx="60" cy="10" r="3" fill="#b8862b" />
    </svg>
  );
}
