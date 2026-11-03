import Link from 'next/link';
import Cintas from '@/components/decor/Cintas';
import Campana from '@/components/decor/Campana';
import { IconArrowLeft } from './Icons';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Color de acento de la sección (hex) */
  accent: string;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

/**
 * Encabezado de sección: estandarte con bordado sutil, cintas de colores
 * y franja de plumaje inferior.
 */
export default function PageHeader({
  title,
  description,
  eyebrow,
  accent,
  backHref = '/',
  backLabel = 'Inicio',
  children,
}: PageHeaderProps) {
  return (
    <header
      className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-terciopelo/60 px-5 pt-5 pb-8 sm:px-10 sm:pt-6 sm:pb-12 mb-6 sm:mb-10"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Fondo: resplandor del color de la sección + bordado */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(120% 90% at 100% 0%, ${accent}33 0%, transparent 55%), radial-gradient(80% 80% at 0% 100%, ${accent}14 0%, transparent 60%)`,
        }}
      />
      <div aria-hidden className="bordado absolute inset-0 -z-10 opacity-[0.07]" />

      {/* Cintas colgando a la derecha */}
      <Cintas className="pointer-events-none absolute -top-1 right-4 sm:right-10 h-28 w-14 sm:h-52 sm:w-24 opacity-70 sm:opacity-95" count={6} />

      <Link
        href={backHref}
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:text-white hover:border-white/25"
      >
        <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </Link>

      <div className="mt-5 max-w-2xl pr-12 sm:mt-8 sm:pr-28">
        {eyebrow && (
          <p className="eyebrow mb-3 text-[var(--accent)]">
            <Campana className="w-3.5 h-4" ring="none" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[2.1rem] sm:text-5xl md:text-6xl font-semibold leading-[1.02] tracking-tight text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-[15px] sm:mt-4 sm:text-lg leading-relaxed text-white/70">{description}</p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>

      <div className="plumaje-band absolute inset-x-0 bottom-0" />
    </header>
  );
}
