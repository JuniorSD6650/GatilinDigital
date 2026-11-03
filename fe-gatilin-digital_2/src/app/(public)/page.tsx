import Link from 'next/link';
import { SECTIONS } from '@/lib/constants';
import Cintas from '@/components/decor/Cintas';
import Campana from '@/components/decor/Campana';
import CadenaDivider from '@/components/decor/CadenaDivider';
import FestividadCountdown from '@/components/home/FestividadCountdown';
import { IconArrowRight, IconCalendar, IconPin, IconUserPlus, IconAlert } from '@/components/ui/Icons';

const PERSONAJES = [
  { name: 'El Negrito', image: '/images/negrito-de-huanuco-personaje.webp' },
  { name: 'El Corochano', image: '/images/corochanos-personaje.webp' },
  { name: 'La Dama', image: '/images/dama-personaje.webp' },
  { name: 'El Turco', image: '/images/turco-personaje.webp' },
  { name: 'El Abanderado', image: '/images/abanderado-personaje.webp' },
];

export default function Home() {
  return (
    <>
      {/* ============ HÉROE ============ */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/negritos-de-huanuco-baile-tradicional.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_30%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,8,18,0.72) 0%, rgba(12,8,18,0.82) 55%, #0c0812 100%), radial-gradient(70% 60% at 50% 0%, rgba(255,31,143,0.18), transparent 70%)',
          }}
        />

        {/* Cintas colgando en las esquinas */}
        <Cintas className="pointer-events-none absolute -top-2 -left-3 sm:left-8 h-32 w-16 sm:h-64 sm:w-28 opacity-90" count={7} />
        <Cintas className="pointer-events-none absolute -top-2 -right-3 sm:right-8 h-32 w-16 sm:h-64 sm:w-28 opacity-90" count={7} mirror />

        <div className="container-fest relative flex flex-col items-center pt-20 pb-28 text-center sm:pt-28 sm:pb-36">
          <p className="eyebrow rounded-full border border-white/15 bg-black/30 px-4 py-2 text-white/80 backdrop-blur animate-in">
            <Campana className="w-3.5 h-4" ring="none" />
            Patrimonio Cultural de la Nación
          </p>

          <h1 className="mt-7 font-display font-semibold tracking-tight text-white animate-in [animation-delay:80ms]">
            <span className="block text-xl sm:text-2xl font-normal italic text-white/75">Festividad de los</span>
            <span className="mt-1 block text-[2.9rem] leading-[0.95] sm:text-7xl lg:text-8xl">
              Negritos{' '}
              <span className="bg-gradient-to-b from-oro-claro via-oro to-oro-oscuro bg-clip-text text-transparent">
                de Huánuco
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/75 animate-in [animation-delay:160ms]">
            Cadenas que repican, cintas que vuelan y plumajes de mil colores: acompaña a las cofradías,
            conoce su historia y vive la devoción al Niño Jesús.
          </p>

          <div className="mt-7 animate-in [animation-delay:220ms]">
            <FestividadCountdown />
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row animate-in [animation-delay:280ms]">
            <Link href="/festival" className="btn btn-oro px-7 py-4 text-base">
              <IconCalendar className="w-5 h-5" />
              Ver Festival Oficial
            </Link>
            <Link href="/sigueteo" className="btn btn-ghost px-7 py-4 text-base">
              <IconPin className="w-5 h-5" />
              Sigue a tu cofradía
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="plumaje-band plumaje-band-soft" />
        </div>
      </section>

      {/* ============ SECCIONES ============ */}
      <section className="container-fest pt-16 sm:pt-20" aria-labelledby="explora">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-oro">Explora</p>
          <h2 id="explora" className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-white">
            Todo sobre la festividad
          </h2>
          <CadenaDivider className="mt-6 max-w-[260px] mx-auto" />
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {SECTIONS.map((s, i) => (
            <li key={s.href} className="animate-in" style={{ animationDelay: `${i * 60}ms` }}>
              <Link
                href={s.href}
                className="group card-fest relative flex h-full flex-col overflow-hidden p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50"
                style={{ '--accent': s.accent } as React.CSSProperties}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[var(--accent)]" />
                <span
                  aria-hidden
                  className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: s.accent }}
                />

                <div className="flex items-start justify-between">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageSrc}
                    alt=""
                    className="panuelo-sway h-14 w-14 sm:h-20 sm:w-20 origin-top drop-shadow-[0_8px_12px_rgba(0,0,0,0.45)]"
                  />
                  <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-all group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white">
                    <IconArrowRight className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="mt-4 sm:mt-6 font-display text-xl sm:text-2xl font-semibold text-white">{s.name}</h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/60">{s.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ PERSONAJES ============ */}
      <section className="container-fest pt-20" aria-labelledby="personajes-home">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-pluma-naranja">La comparsa</p>
            <h2 id="personajes-home" className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-white">
              Conoce a los personajes
            </h2>
          </div>
          <Link href="/personajes" className="group inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
            Ver todos
            <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
          {PERSONAJES.map((p) => (
            <li key={p.name} className="w-[42%] shrink-0 snap-start sm:w-auto">
              <Link href="/personajes" className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f7f3ec] ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                  <div className="plumaje-band absolute inset-x-0 bottom-0 h-1" />
                </div>
                <p className="mt-3 text-center font-display text-base font-semibold text-white/85 group-hover:text-white">{p.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ PARTICIPA ============ */}
      <section className="container-fest pt-20" aria-label="Participa">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          {/* Registro */}
          <div className="relative isolate overflow-hidden rounded-3xl border border-oro/25 bg-gradient-to-br from-[#2a1a07] via-terciopelo to-noche p-7 sm:p-10">
            <div aria-hidden className="bordado absolute inset-0 -z-10 opacity-[0.12]" />
            <Cintas className="pointer-events-none absolute -top-1 right-6 h-40 w-20 opacity-90 hidden sm:block" count={5} />
            <p className="eyebrow text-oro">Vive la danza</p>
            <h2 className="mt-3 max-w-md font-display text-3xl sm:text-4xl font-semibold text-white">
              No seas solo espectador: <span className="italic text-oro">baila para el Niño</span>
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Únete a una cuadrilla, aprende los pasos y siente la emoción de recorrer Huánuco con tu cofradía.
            </p>
            <Link href="/registro" className="btn btn-oro mt-7 px-6 py-3.5">
              <IconUserPlus className="w-5 h-5" />
              Quiero participar
            </Link>
            <div className="fleco absolute inset-x-0 bottom-0" />
          </div>

          {/* Reporte */}
          <div className="card-fest flex flex-col justify-between p-7 sm:p-8">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-oro/10 text-oro">
                <IconAlert className="w-6 h-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-white">¿Viste algo fuera de lugar?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Reporta incidentes, objetos perdidos o problemas de organización. Llega directo al comité.
              </p>
            </div>
            <Link href="/reportar" className="btn btn-ghost mt-6 self-start px-5 py-3 text-sm">
              Hacer un reporte
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
