'use client';

import { useState } from 'react';
import Image from 'next/image';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";

// Datos de los personajes con tus imágenes
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

  // Función mágica para calcular posición y estilo
  const getCardStyle = (index: number) => {
    // Calculamos la distancia relativa en un ciclo circular de 5
    // Resultado: 0 (Centro), 1 (Derecha), 2 (Fondo Der), 3 (Fondo Izq), 4 (Izquierda)
    const diff = (index - activeIndex + CHARACTERS.length) % CHARACTERS.length;

    // Base styles (Mobile first: todos centrados, luego ajustamos en md)
    const baseTransform = "absolute top-0 left-1/2 transition-all duration-500 ease-out origin-bottom";
    
    // Configuración para el CENTRO (Activo)
    if (diff === 0) {
      return {
        zIndex: 50,
        opacity: 1,
        className: `${baseTransform} -translate-x-1/2 scale-100 cursor-default`,
        filter: "brightness(110%) drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))"
      };
    }
    
    // Configuración para DERECHA INMEDIATA
    if (diff === 1) {
      return {
        zIndex: 40,
        opacity: 0.7,
        className: `${baseTransform} -translate-x-[20%] md:translate-x-[15%] scale-90 md:scale-85 cursor-pointer hover:opacity-90`,
        filter: "brightness(60%) sepia(20%)"
      };
    }

    // Configuración para IZQUIERDA INMEDIATA (El índice 4 en un array de 5 es el anterior al 0)
    if (diff === 4) {
      return {
        zIndex: 40,
        opacity: 0.7,
        className: `${baseTransform} -translate-x-[80%] md:-translate-x-[115%] scale-90 md:scale-85 cursor-pointer hover:opacity-90`,
        filter: "brightness(60%) sepia(20%)"
      };
    }

    // Configuración para FONDO DERECHA
    if (diff === 2) {
      return {
        zIndex: 30,
        opacity: 0.4,
        className: `${baseTransform} translate-x-[10%] md:translate-x-[80%] scale-75 cursor-pointer`,
        filter: "brightness(40%) blur(1px)"
      };
    }

    // Configuración para FONDO IZQUIERDA
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
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header Fijo */}
      <div className="space-y-6 mb-8 relative z-50">
        <BackButton />
        <SectionHeader 
          title="Personajes" 
          description="Los protagonistas que dan vida a nuestra danza."
          borderColor="border-festivo-orange"
        />
      </div>

      {/* 2. Área del Carrusel */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Contenedor de Tarjetas (Altura fija para evitar saltos) */}
        <div className="relative w-full h-[450px] md:h-[600px] flex justify-center perspective-1000">
          {CHARACTERS.map((char, i) => {
            const style = getCardStyle(i);
            
            return (
              <div
                key={char.id}
                className={`w-[260px] md:w-[320px] h-[400px] md:h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-negrito-card shadow-2xl ${style.className}`}
                style={{ zIndex: style.zIndex, opacity: style.opacity, filter: style.filter }}
                onClick={() => setActiveIndex(i)} // Click para navegar a este personaje
              >
                {/* Imagen del Personaje */}
                <div className="relative w-full h-full">
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    className="object-cover"
                    priority={i === activeIndex} // Priorizar carga del activo
                  />
                  
                  {/* Gradiente inferior para texto (Solo visible en la tarjeta activa) */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 ${i === activeIndex ? 'block' : 'hidden'}`} />
                  
                  {/* Borde Dorado Brillante (Solo activo) */}
                  {i === activeIndex && (
                    <div className="absolute inset-0 border-2 border-festivo-gold/50 rounded-2xl pointer-events-none animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Controles y Detalles (Debajo del carrusel) */}
        <div className="relative z-50 -mt-10 md:-mt-16 text-center max-w-2xl mx-auto px-4 space-y-6">
          
          {/* Nombre y Descripción */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transform transition-all duration-300">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-festivo-gold mb-2 drop-shadow-md">
              {CHARACTERS[activeIndex].name}
            </h2>
            <p className="text-sm md:text-base text-gray-300 font-light tracking-wide">
              {CHARACTERS[activeIndex].description}
            </p>
          </div>

          {/* Botones de Navegación */}
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={handlePrev}
              className="group p-4 rounded-full bg-white/5 hover:bg-festivo-gold/20 border border-white/10 hover:border-festivo-gold transition-all active:scale-95"
              aria-label="Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-festivo-gold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            {/* Indicadores de puntos */}
            <div className="flex gap-2">
              {CHARACTERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-8 bg-festivo-gold' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="group p-4 rounded-full bg-white/5 hover:bg-festivo-gold/20 border border-white/10 hover:border-festivo-gold transition-all active:scale-95"
              aria-label="Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-festivo-gold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}