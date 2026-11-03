'use client';

import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/Icons';

const ACCENT = '#ff7a1a';

const CHARACTERS = [
  {
    id: 0,
    name: 'El Negrito de Huánuco',
    role: 'Protagonista Central',
    description:
      'Representa la fe y la libertad de los esclavos. Viste cotón de terciopelo bordado con hilos de oro y plata, y porta una campanilla.',
    image: '/images/negrito-de-huanuco-personaje.webp',
  },
  {
    id: 1,
    name: 'El Corochano',
    role: 'Autoridad Burlesca',
    description:
      'Representa al viejo hidalgo español, autoritario y grotesco. Con su matraca y látigo, pone orden y asusta a los niños.',
    image: '/images/corochanos-personaje.webp',
  },
  {
    id: 2,
    name: 'La Dama',
    role: 'Elegancia y Belleza',
    description:
      'Representa a la dueña de la hacienda o la esposa del encomendero, luciendo trajes de época elegantes y refinados.',
    image: '/images/dama-personaje.webp',
  },
  {
    id: 3,
    name: 'El Turco',
    role: 'Poder Simbólico',
    description:
      'Representa a los tratantes de esclavos o figuras de poder extranjeras, con vestimenta que evoca el estilo otomano.',
    image: '/images/turco-personaje.webp',
  },
  {
    id: 4,
    name: 'El Abanderado',
    role: 'Libertad',
    description:
      'Porta la bandera de la libertad (Argentina o Peruana), abriendo paso a la cuadrilla con movimientos marciales.',
    image: '/images/abanderado-personaje.webp',
  },
];

export default function PersonajesPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);

  // Navegación con teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setActiveIndex((p) => (p + 1) % CHARACTERS.length);
      if (e.key === 'ArrowLeft') setActiveIndex((p) => (p - 1 + CHARACTERS.length) % CHARACTERS.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // --- LÓGICA DE SWIPE (DESLIZAR) ---
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  // Arrastre con mouse
  const isDragging = useRef(false);
  const startX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 && Math.abs(e.clientX - startX.current) > 10) isDragging.current = true;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const distance = startX.current - e.clientX;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
    setTimeout(() => {
      isDragging.current = false;
    }, 0);
  };

  const handleCardClick = (index: number) => {
    if (!isDragging.current) setActiveIndex(index);
  };

  // Estilos 3D del carrusel (z-index locales gracias a `isolate`)
  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + CHARACTERS.length) % CHARACTERS.length;
    const base = 'absolute top-0 left-1/2 transition-all duration-500 ease-out origin-bottom';

    if (diff === 0) {
      return { zIndex: 30, opacity: 1, className: `${base} -translate-x-1/2 scale-100 cursor-default`, filter: 'drop-shadow(0 20px 40px rgba(255,122,26,0.35))' };
    }
    if (diff === 1) {
      return { zIndex: 20, opacity: 0.75, className: `${base} -translate-x-[20%] md:translate-x-[15%] scale-90 md:scale-[0.85] cursor-pointer hover:opacity-95`, filter: 'brightness(55%) saturate(80%)' };
    }
    if (diff === CHARACTERS.length - 1) {
      return { zIndex: 20, opacity: 0.75, className: `${base} -translate-x-[80%] md:-translate-x-[115%] scale-90 md:scale-[0.85] cursor-pointer hover:opacity-95`, filter: 'brightness(55%) saturate(80%)' };
    }
    if (diff === 2) {
      return { zIndex: 10, opacity: 0.4, className: `${base} translate-x-[10%] md:translate-x-[80%] scale-75 cursor-pointer`, filter: 'brightness(40%) blur(1px)' };
    }
    return { zIndex: 10, opacity: 0.4, className: `${base} -translate-x-[110%] md:-translate-x-[180%] scale-75 cursor-pointer`, filter: 'brightness(40%) blur(1px)' };
  };

  const active = CHARACTERS[activeIndex];

  return (
    <div className="container-fest pt-8 animate-in overflow-x-clip" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Personajes"
        title="La comparsa"
        description="Los protagonistas que dan vida a nuestra danza. Desliza para conocerlos."
        accent={ACCENT}
      />

      {/* Carrusel */}
      <section aria-roledescription="carrusel" aria-label="Personajes" className="relative flex flex-col items-center">
        <div
          className="relative isolate flex h-[440px] w-full cursor-grab justify-center touch-pan-y select-none active:cursor-grabbing md:h-[580px]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {CHARACTERS.map((char, i) => {
            const style = getCardStyle(i);
            const isActive = i === activeIndex;
            return (
              <div
                key={char.id}
                className={`h-[400px] w-[260px] overflow-hidden rounded-[1.75rem] bg-[#f7f3ec] shadow-2xl md:h-[520px] md:w-[330px] ${style.className}`}
                style={{ zIndex: style.zIndex, opacity: style.opacity, filter: style.filter }}
                onClick={() => handleCardClick(i)}
                aria-hidden={!isActive}
              >
                <div className="pointer-events-none relative h-full w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={char.image} alt={char.name} className="h-full w-full object-contain p-3" draggable={false} />
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-[1.75rem] ring-4 ring-inset ring-oro/60" />
                      <div className="plumaje-band plumaje-band-soft absolute inset-x-0 bottom-0 rotate-180" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalles */}
        <div className="relative z-10 -mt-6 w-full max-w-2xl px-1 text-center md:-mt-10">
          <div key={active.id} className="card-fest animate-in border-white/10 bg-noche/80 p-6 backdrop-blur-md sm:p-8" aria-live="polite">
            <p className="eyebrow justify-center text-[var(--accent)]">{active.role}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white md:text-4xl">{active.name}</h2>
            <p className="mt-3 leading-relaxed text-white/70">{active.description}</p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Personaje anterior"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/15 active:scale-95"
            >
              <IconChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2">
              {CHARACTERS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Ver ${c.name}`}
                  aria-current={idx === activeIndex}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Personaje siguiente"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/15 active:scale-95"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
