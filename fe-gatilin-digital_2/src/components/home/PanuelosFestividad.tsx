import Link from 'next/link';
import Panuelo, { PANUELO_CLIP } from '@/components/ui/Panuelo';
import { SECTIONS } from '@/lib/constants';
import { readableTextOn } from '@/lib/color';

/**
 * Los 6 pañuelos de la portada (uno por sección). La cuadrícula se dimensiona
 * según el alto de la pantalla para que todos entren en la primera vista:
 *  - celular: 2 por fila (3 filas)  -> ancho = alto disponible x 2/3
 *  - md+:     3 por fila (2 filas)  -> ancho = alto disponible x 3/2
 * `--alto` es el alto que queda para la cuadrícula (pantalla - barra - títulos).
 */
export default function PanuelosFestividad() {
  return (
    // flex-wrap centrado: si el número de secciones no llena la última fila,
    // los pañuelos restantes quedan centrados (p. ej. 7 = 4 + 3).
    <ul
      className="mx-auto flex w-full flex-wrap justify-center
        max-w-[max(17rem,min(100%,calc(var(--alto)*2/3)))] md:max-w-[max(32rem,min(100%,calc(var(--alto)*3/2)))]
        [--alto:calc(100svh-17rem)] md:[--alto:calc(100svh-16rem)]"
    >
      {SECTIONS.map((s, i) => {
        const tinta = readableTextOn(s.accent);
        const sombraTexto = tinta === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.55)' : '0 1px 2px rgba(255,255,255,0.35)';
        return (
          <li key={s.href} className="w-1/2 px-1 py-0.5 animate-in md:w-1/3 md:px-3" style={{ animationDelay: `${120 + i * 70}ms` }}>
            {/* Solo el rombo (enlace recortado) es clicable; el resto no recibe eventos */}
            <div className="group pointer-events-none relative aspect-square w-full [container-type:inline-size]">
              <div className="panuelo-sway absolute inset-0 origin-top transition-transform duration-300 group-hover:scale-[1.04] group-focus-within:scale-[1.04]">
                <span
                  aria-hidden
                  className="absolute inset-[22%] rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
                  style={{ backgroundColor: s.accent }}
                />
                <Panuelo color={s.accent} pliegue={false} className="relative h-full w-full" />

                <div
                  aria-hidden
                  className="absolute inset-x-[16%] inset-y-[30%] flex flex-col items-center justify-center text-center"
                  style={{ color: tinta, textShadow: sombraTexto }}
                >
                  <span
                    className="font-display font-bold leading-[1.05] [overflow-wrap:anywhere]"
                    style={{ fontSize: s.name.length > 10 ? 'clamp(12px, 8.4cqw, 30px)' : 'clamp(13px, 10cqw, 36px)' }}
                  >
                    {s.name}
                  </span>
                </div>
              </div>

              <Link
                href={s.href}
                aria-label={`${s.name}: ${s.description}`}
                title={s.description}
                className="pointer-events-auto absolute inset-0 cursor-pointer outline-none focus-visible:bg-white/15"
                style={{ clipPath: PANUELO_CLIP, WebkitTapHighlightColor: 'transparent' }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
