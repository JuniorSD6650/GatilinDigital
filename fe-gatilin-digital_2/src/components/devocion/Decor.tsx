/** Elementos decorativos de la página de Devoción: estrellas, Estrella de Belén, rayos y velas. */

// Posiciones fijas (deterministas: el HTML exportado y el del navegador coinciden)
const ESTRELLAS = [
  [6, 18, 1.5, 0], [14, 62, 1, 1.2], [21, 34, 2, 0.4], [29, 78, 1.2, 2.1], [37, 12, 1, 1.6], [44, 48, 1.6, 0.8],
  [52, 22, 1, 2.6], [58, 70, 2, 0.2], [66, 38, 1.2, 1.9], [73, 14, 1.8, 1.1], [79, 58, 1, 2.4], [86, 28, 1.4, 0.6],
  [92, 74, 1, 1.4], [10, 84, 1.2, 2.8], [33, 90, 1, 0.9], [62, 88, 1.4, 1.7], [88, 90, 1, 0.3], [48, 6, 1.2, 2.2],
] as const;

export function CampoEstrellas({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {ESTRELLAS.map(([x, y, s, d], i) => (
        <span
          key={i}
          className="estrella-titila absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${s * 2}px`,
            height: `${s * 2}px`,
            animationDelay: `${d}s`,
            boxShadow: `0 0 ${s * 6}px rgba(255,236,170,0.9)`,
          }}
        />
      ))}
    </div>
  );
}

/** Estrella de Belén: cuatro puntas largas con resplandor dorado */
export function EstrellaBelen({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <defs>
        <radialGradient id="eb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff8d6" stopOpacity="1" />
          <stop offset="0.35" stopColor="#ffd86b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb703" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="eb-punta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#f2c14e" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#eb-glow)" className="luz-respira" />
      <path d="M60 2 L66 54 L118 60 L66 66 L60 118 L54 66 L2 60 L54 54 Z" fill="url(#eb-punta)" />
      <path d="M60 30 L63 57 L90 60 L63 63 L60 90 L57 63 L30 60 L57 57 Z" fill="#fff" opacity="0.9" transform="rotate(45 60 60)" />
      <circle cx="60" cy="60" r="5" fill="#fff" />
    </svg>
  );
}

/** Rayos de gloria que giran lentamente (fondo de la estrella o del halo) */
export function RayosGloria({ className = '', size = '46rem' }: { className?: string; size?: string }) {
  return (
    <div
      aria-hidden
      className={`rayos-gloria pointer-events-none absolute left-1/2 top-1/2 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        background:
          'repeating-conic-gradient(from 0deg, rgba(255,214,107,0.16) 0deg 5deg, transparent 5deg 15deg)',
        maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 35%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0.6) 35%, transparent 70%)',
      }}
    />
  );
}

/** Vela con llama animada. `encendida=false` muestra la vela apagada (con un hilo de humo). */
export function Vela({ alto = 64, encendida = true, retraso = 0, className = '' }: { alto?: number; encendida?: boolean; retraso?: number; className?: string }) {
  const ancho = Math.round(alto * 0.32);
  return (
    <span aria-hidden className={`relative inline-block ${className}`} style={{ width: ancho, height: alto + alto * 0.55 }}>
      {encendida ? (
        <>
          {/* Halo cálido */}
          <span
            className="vela-halo absolute left-1/2 rounded-full"
            style={{
              bottom: alto * 0.75,
              width: alto * 0.95,
              height: alto * 0.95,
              background: 'radial-gradient(circle, rgba(255,196,84,0.55), rgba(255,140,40,0.12) 55%, transparent 70%)',
              animationDelay: `${retraso}s`,
            }}
          />
          {/* Llama */}
          <span
            className="vela-llama absolute left-1/2"
            style={{
              bottom: alto + 2,
              width: ancho * 0.62,
              height: alto * 0.42,
              borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
              background: 'radial-gradient(ellipse at 50% 72%, #fff 0 18%, #ffe27a 34%, #ff9f1c 64%, rgba(255,90,20,0) 76%)',
              filter: 'drop-shadow(0 0 6px rgba(255,170,60,0.9))',
              animationDelay: `${retraso}s`,
            }}
          />
        </>
      ) : (
        <span className="absolute left-1/2 -translate-x-1/2 text-white/25" style={{ bottom: alto + 4, fontSize: alto * 0.22 }}>
          ~
        </span>
      )}
      {/* Mecha */}
      <span className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#2b2118]" style={{ bottom: alto - 1, width: 2, height: alto * 0.08 }} />
      {/* Cuerpo */}
      <span
        className="absolute bottom-0 left-0 w-full rounded-t-[40%_14%] rounded-b-md"
        style={{
          height: alto,
          background: 'linear-gradient(90deg, #d9cdb4 0%, #fbf5e8 35%, #fffdf7 50%, #efe4cd 75%, #c9b991 100%)',
          boxShadow: encendida ? '0 0 22px -4px rgba(255,190,90,0.55)' : 'none',
        }}
      />
    </span>
  );
}
