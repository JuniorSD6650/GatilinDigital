'use client';

import { useState, useRef } from 'react';

// --- COMPONENTES LOCALES PARA VISTA PREVIA ---
// En tu proyecto local, borra esto e importa tus componentes reales.

const BackButton = () => (
  <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-8 group">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
    <span className="font-medium text-sm uppercase tracking-wide">Volver al inicio</span>
  </a>
);

const SectionHeader = ({ title, description, borderColor }: { title: string, description: string, borderColor: string }) => (
  <div className={`border-l-4 ${borderColor} pl-6 py-2 mb-8`}>
    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{title}</h1>
    <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">{description}</p>
  </div>
);
// -----------------------------------------------------------------------

const CHARACTERS = [
  {
    id: 0,
    name: "El Negrito de Huánuco",
    role: "Protagonista Central",
    description: "Representa la fe y la libertad de los esclavos. Viste cotón de terciopelo bordado con hilos de oro y plata, y porta una campanilla.",
    image: "/images/negrito-de-huanuco-personaje.webp"
  },
  {
    id: 1,
    name: "El Corochano",
    role: "Autoridad Burlesca",
    description: "Representa al viejo hidalgo español, autoritario y grotesco. Con su matraca y látigo, pone orden y asusta a los niños.",
    image: "/images/corochanos-personaje.webp"
  },
  {
    id: 2,
    name: "La Dama",
    role: "Elegancia y Belleza",
    description: "Representa a la dueña de la hacienda o la esposa del encomendero, luciendo trajes de época elegantes y refinados.",
    image: "/images/dama-personaje.webp"
  },
  {
    id: 3,
    name: "El Turco",
    role: "Poder Simbólico",
    description: "Representa a los tratantes de esclavos o figuras de poder extranjeras, con vestimenta que evoca el estilo otomano.",
    image: "/images/turco-personaje.webp"
  },
  {
    id: 4,
    name: "El Abanderado",
    role: "Libertad",
    description: "Porta la bandera de la libertad (Argentina o Peruana), abriendo paso a la cuadrilla con movimientos marciales.",
    image: "/images/abanderado-personaje.webp"
  }
];

export default function PersonajesPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Funciones para navegar
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
  };

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  // Lógica de Arrastre con Mouse
  const isDragging = useRef(false);
  const startX = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false;
    startX.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 && Math.abs(e.clientX - startX.current) > 10) {
      isDragging.current = true;
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const distance = startX.current - e.clientX;
    if (distance > minSwipeDistance) handleNext();
    else if (distance < -minSwipeDistance) handlePrev();
    
    setTimeout(() => { isDragging.current = false; }, 0);
  };

  const handleCardClick = (index: number) => {
    if (!isDragging.current) {
      setActiveIndex(index);
    }
  };

  // Cálculo de Estilos 3D
  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + CHARACTERS.length) % CHARACTERS.length;
    const baseTransform = "absolute top-0 left-1/2 transition-all duration-500 ease-out origin-bottom";
    
    // CENTRO (Activo)
    if (diff === 0) {
      return {
        zIndex: 60, // Superior al Navbar
        opacity: 1,
        className: `${baseTransform} -translate-x-1/2 scale-100 cursor-default`,
        filter: "brightness(110%) drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))"
      };
    }
    
    // DERECHA INMEDIATA
    if (diff === 1) {
      return {
        zIndex: 40,
        opacity: 0.7,
        className: `${baseTransform} -translate-x-[20%] md:translate-x-[15%] scale-90 md:scale-85 cursor-pointer hover:opacity-90`,
        filter: "brightness(60%) sepia(20%)"
      };
    }

    // IZQUIERDA INMEDIATA
    if (diff === 4) {
      return {
        zIndex: 40,
        opacity: 0.7,
        className: `${baseTransform} -translate-x-[80%] md:-translate-x-[115%] scale-90 md:scale-85 cursor-pointer hover:opacity-90`,
        filter: "brightness(60%) sepia(20%)"
      };
    }

    // FONDO DERECHA
    if (diff === 2) {
      return {
        zIndex: 30,
        opacity: 0.4,
        className: `${baseTransform} translate-x-[10%] md:translate-x-[80%] scale-75 cursor-pointer`,
        filter: "brightness(40%) blur(1px)"
      };
    }

    // FONDO IZQUIERDA
    if (diff === 3) {
      return {
        zIndex: 30,
        opacity: 0.4,
        className: `${baseTransform} -translate-x-[110%] md:-translate-x-[180%] scale-75 cursor-pointer`,
        filter: "brightness(40%) blur(1px)"
      };
    }
    
    return {};
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">
      
      {/* Header Fijo */}
      <div className="space-y-6 mb-8 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Personajes" 
          description="Los protagonistas que dan vida a nuestra danza."
          borderColor="border-orange-500"
        />
      </div>

      {/* Área del Carrusel */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        
        <div 
          className="relative w-full h-[450px] md:h-[600px] flex justify-center perspective-1000 cursor-grab active:cursor-grabbing touch-pan-y"
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
            
            return (
              <div
                key={char.id}
                className={`w-[260px] md:w-[320px] h-[400px] md:h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl transition-all duration-500 ease-out select-none ${style.className}`}
                style={{ zIndex: style.zIndex, opacity: style.opacity, filter: style.filter }}
                onClick={() => handleCardClick(i)}
              >
                <div className="relative w-full h-full pointer-events-none">
                  {/* Usamos img estándar para la vista previa */}
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 ${i === activeIndex ? 'block' : 'hidden'}`} />
                  
                  {i === activeIndex && (
                    <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-2xl pointer-events-none animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalles */}
        <div className="relative z-50 -mt-10 md:-mt-16 text-center max-w-2xl mx-auto px-4 space-y-6">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transform transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-yellow-400 mb-2 drop-shadow-md">
              {CHARACTERS[activeIndex].name}
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light tracking-wide">
              {CHARACTERS[activeIndex].description}
            </p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={handlePrev}
              className="group p-4 rounded-full bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <div className="flex gap-2">
              {CHARACTERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-8 bg-yellow-500' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="group p-4 rounded-full bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}