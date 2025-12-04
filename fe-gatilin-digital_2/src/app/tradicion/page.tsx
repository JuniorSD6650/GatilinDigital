'use client';

import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";

// Datos históricos
const TIMELINE_EVENTS = [
  {
    year: "Siglo XVII",
    title: "Orígenes en las Haciendas",
    description: "Los esclavos africanos traídos a Huánuco trabajaban en las haciendas. Durante la Navidad, los hacendados les permitían celebrar adorando al Niño Jesús por unas horas."
  },
  {
    year: "1854",
    title: "El Decreto de Libertad",
    description: "El presidente Ramón Castilla decreta la abolición de la esclavitud. Como gesto de gratitud y celebración, los libertos danzaron por las calles luciendo sus mejores galas."
  },
  {
    year: "1900s",
    title: "Nace la Cofradía",
    description: "La danza se organiza formalmente. Se integran personajes mestizos y españoles satirizados (como el Corochano y el Turco), enriqueciendo la narrativa cultural."
  },
  {
    year: "Actualidad",
    title: "Patrimonio Vivo",
    description: "Hoy, la festividad de los Negritos de Huánuco es Patrimonio Cultural de la Nación, celebrándose con devoción y elegancia desde la víspera de Navidad hasta la Bajada de Reyes."
  }
];

export default function TradicionPage() {
  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header con el color temático (Pink) */}
      <div className="space-y-6 mb-12 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Nuestra Historia" 
          description="Un viaje a través del tiempo: de la esclavitud a la libertad y la fe inquebrantable."
          borderColor="border-festivo-pink"
        />
      </div>

      {/* 2. Línea de Tiempo */}
      <div className="relative max-w-4xl mx-auto px-4">
        
        {/* Línea Vertical Central (con gradiente para desvanecerse al final) */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-festivo-pink via-festivo-pink/30 to-transparent -translate-x-1/2 md:translate-x-0" />

        <div className="space-y-12">
          {TIMELINE_EVENTS.map((event, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col md:flex-row gap-8 items-center ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              
              {/* Punto de la Línea de Tiempo */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-negrito-bg border-2 border-festivo-pink shadow-[0_0_15px_rgba(233,30,99,0.6)] z-20 -translate-x-1/2" />

              {/* Tarjeta de Contenido */}
              <div className="ml-16 md:ml-0 flex-1 w-full">
                <div 
                  className={`
                    relative bg-negrito-card/80 backdrop-blur-sm border border-white/5 p-6 rounded-2xl 
                    hover:border-festivo-pink/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-festivo-pink/10 group
                    ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}
                  `}
                >
                  {/* Año */}
                  <span className="inline-block px-3 py-1 rounded-full bg-festivo-pink/10 text-festivo-pink text-xs font-bold tracking-widest mb-3 border border-festivo-pink/20">
                    {event.year}
                  </span>
                  
                  {/* Título */}
                  <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-pink-200 transition-colors">
                    {event.title}
                  </h3>
                  
                  {/* Descripción */}
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    {event.description}
                  </p>

                  {/* Decoración pequeña (comillas) */}
                  <div className={`absolute top-4 text-white/5 text-6xl font-serif leading-none select-none pointer-events-none ${index % 2 === 0 ? 'right-4' : 'left-4'}`}>
                    &rdquo;
                  </div>
                </div>
              </div>
              
              {/* Espaciador para el lado vacío (Solo en escritorio) */}
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cita Final o Footer de sección */}
      <div className="mt-20 text-center max-w-2xl mx-auto px-6">
        <p className="text-xl font-display text-white/80 italic">
          "La danza no es solo movimiento, es la memoria de un pueblo que celebra su libertad."
        </p>
        <div className="w-24 h-1 bg-festivo-pink/50 mx-auto mt-6 rounded-full" />
      </div>

    </div>
  );
}