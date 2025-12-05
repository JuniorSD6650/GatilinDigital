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

      {/* 3. Contexto Histórico Detallado */}
      <div className="max-w-5xl mx-auto px-4 mt-24 mb-16">
        <div className="relative bg-gradient-to-br from-negrito-card/70 to-pink-950/20 border border-festivo-pink/40 p-8 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(233,30,99,0.2)] backdrop-blur-md">
          
          {/* Decoración superior */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-negrito-black px-6 py-2 border border-festivo-pink rounded-full">
            <span className="text-festivo-gold text-sm uppercase tracking-widest font-display">Origen Colonial</span>
          </div>

          {/* Contenido en secciones */}
          <div className="space-y-8 text-gray-200 leading-relaxed">
            
            {/* Sección 1: La Época Colonial */}
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-festivo-pink mb-4">La Gala de los Hacendados</h3>
              <p className="text-lg">
                La danza de los Negritos de Huánuco representa la gala que exhibían los antiguos hacendados españoles en la época de la colonia en la ciudad de Huánuco. Esta era una costumbre que solía ejecutarse en Navidad. Sendas cuadrillas de negritos, esclavos de la época que trabajaban en las haciendas, bailaban en celebración al nacimiento del Niño Jesús.
              </p>
              <p className="text-lg">
                Iniciaban el día asistiendo a Misa y danzaban por el camino visitando a una que otra hacienda amiga realizando el baile de Adoración al Niño. Eran conducidos por los <span className="text-festivo-pink font-semibold">caporales</span> y custodiados por un <span className="text-festivo-gold font-semibold">capataz blanco</span> quien con chicote en mano mantenía el orden en la danza.
              </p>
            </div>

            {/* Divisor decorativo */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-festivo-pink to-transparent mx-auto"></div>

            {/* Sección 2: Los Personajes */}
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-festivo-pink mb-4">Los Personajes de la Comparsa</h3>
              <p className="text-lg">
                Además, eran acompañados por la <span className="text-pink-300 font-semibold">dama dueña de la hacienda</span> y el <span className="text-pink-300 font-semibold">turco</span> quienes iban regocijándose de la gala que estaban presentando. Otro personaje que acompañaba esta comparsa era el <span className="text-pink-300 font-semibold">porta estandarte</span>, que con el escudo de la familia o hacienda identificaba de dónde venían estos negritos.
              </p>
            </div>

            {/* Divisor decorativo */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-festivo-pink to-transparent mx-auto"></div>

            {/* Sección 3: La Transformación */}
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-festivo-pink mb-4">El Renacer de la Tradición</h3>
              <p className="text-lg">
                Esta costumbre se diluye a fines del siglo XVIII con la libertad de los esclavos negros en el Perú y el retorno de los, ahora ex esclavos, negros a sus lugares de origen. Durante la República se reaviva esta costumbre y el lugar de los danzantes es tomado por los <span className="text-festivo-gold font-semibold">indígenas y mestizos de la zona</span>, quienes con máscaras de negros emulan el origen de la danza: la devoción al Niño Jesús.
              </p>
            </div>

            {/* Divisor decorativo */}
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-festivo-pink to-transparent mx-auto"></div>

            {/* Sección 4: Presente */}
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-festivo-gold mb-4">La Navidad Más Grande del Mundo</h3>
              <p className="text-lg">
                Actualmente, la danza se constituye en la festividad más grande de la Región. Ha sido recientemente declarada como <span className="text-festivo-gold font-bold">Patrimonio Cultural de la Nación</span>, y a decir de las personas que habitan este cálido valle: la Festividad de los Negritos de Huánuco es <span className="text-white font-bold italic">la Navidad más grande del Mundo</span>.
              </p>
            </div>

          </div>

          {/* Decoración inferior */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-festivo-pink to-transparent"></div>
        </div>
      </div>

      {/* 4. Cita Final */}
      <div className="mt-20 text-center max-w-2xl mx-auto px-6">
        <p className="text-xl font-display text-white/80 italic">
          "La danza no es solo movimiento, es la memoria de un pueblo que celebra su libertad."
        </p>
        <div className="w-24 h-1 bg-festivo-pink/50 mx-auto mt-6 rounded-full" />
      </div>

    </div>
  );
}