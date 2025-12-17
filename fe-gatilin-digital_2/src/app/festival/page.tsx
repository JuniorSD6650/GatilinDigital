'use client';

import { useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { getRankingCofradias, type CofradiaRanking } from '@/services/apis/api-normal';

export default function FestivalPage() {
  const [ranking, setRanking] = useState<CofradiaRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRankingCofradias();
        setRanking(data);
      } catch (error) {
        console.error("Error cargando ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Separar cofradías con votos de las que no tienen
  const cofradiasConVotos = ranking.filter(c => c.votos > 0);
  const cofradiasSinVotos = ranking.filter(c => c.votos === 0);

  // Agrupar cofradías por cantidad de votos para manejar empates
  const agrupadasPorVotos = cofradiasConVotos.reduce((acc, cofradia) => {
    if (!acc[cofradia.votos]) {
      acc[cofradia.votos] = [];
    }
    acc[cofradia.votos].push(cofradia);
    return acc;
  }, {} as Record<number, CofradiaRanking[]>);

  // Ordenar los grupos de votos de mayor a menor
  const gruposOrdenados = Object.entries(agrupadasPorVotos)
    .sort(([votosA], [votosB]) => Number(votosB) - Number(votosA));

  // Obtener top 3 posiciones (pueden tener múltiples cofradías si hay empates)
  const top3Posiciones = gruposOrdenados.slice(0, 3);
  const restoConVotos = gruposOrdenados.slice(3).flatMap(([, cofradias]) => cofradias);

  // Función para obtener el emoji y color de la posición
  const getMedalConfig = (posicion: number) => {
    switch (posicion) {
      case 1:
        return { emoji: '🥇', color: 'from-yellow-400 via-yellow-500 to-yellow-600', shadow: 'shadow-yellow-500/50', textColor: 'text-yellow-400' };
      case 2:
        return { emoji: '🥈', color: 'from-gray-300 via-gray-400 to-gray-500', shadow: 'shadow-gray-400/50', textColor: 'text-gray-300' };
      case 3:
        return { emoji: '🥉', color: 'from-orange-400 via-orange-500 to-orange-600', shadow: 'shadow-orange-500/50', textColor: 'text-orange-400' };
      default:
        return { emoji: '🏆', color: 'from-blue-400 via-blue-500 to-blue-600', shadow: 'shadow-blue-500/50', textColor: 'text-blue-400' };
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="space-y-6 mb-12 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Podio de Votación" 
          description="Las cofradías más votadas por la comunidad. ¡Apoya a tu favorita!"
          borderColor="border-festivo-blue"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-6xl mx-auto px-4">
        
        {loading ? (
          // SKELETON LOADING
          <div className="space-y-8">
            <div className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
            <div className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
          </div>
        ) : cofradiasConVotos.length > 0 ? (
          <div className="space-y-12">
            
            {/* PODIO - Top 3 Posiciones */}
            <div className="relative">
              <h2 className="text-3xl font-bold text-center mb-16 text-white">
                🏆 Podio de Honor
              </h2>
              
              {/* Grid de Podio - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {top3Posiciones.map(([votos, cofradias], posicionIndex) => {
                  const posicion = posicionIndex + 1;
                  const medalConfig = getMedalConfig(posicion);
                  
                  return (
                    <div 
                      key={`posicion-${posicion}`}
                      className={`
                        ${posicion === 1 ? 'md:order-2 md:scale-110 md:mt-0' : ''}
                        ${posicion === 2 ? 'md:order-1 md:mt-8' : ''}
                        ${posicion === 3 ? 'md:order-3 md:mt-8' : ''}
                      `}
                    >
                      {/* Contenedor del podio */}
                      <div className="relative">
                        {/* Número de posición flotante */}
                        <div className={`
                          absolute -top-6 left-1/2 -translate-x-1/2 z-20
                          text-6xl drop-shadow-2xl animate-float
                        `}>
                          {medalConfig.emoji}
                        </div>

                        {/* Tarjetas de cofradías en esta posición */}
                        <div className="space-y-3 pt-8">
                          {cofradias.map((cofradia) => (
                            <div
                              key={cofradia.id}
                              className={`
                                relative bg-gradient-to-br ${medalConfig.color}
                                rounded-2xl p-6 border-2 border-white/20
                                shadow-2xl ${medalConfig.shadow}
                                transform transition-all duration-300
                                hover:scale-105 hover:-translate-y-1
                                animate-float
                              `}
                              style={{
                                animationDelay: `${cofradia.id * 0.1}s`
                              }}
                            >
                              {/* Brillo superior */}
                              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 hover:opacity-20 transition-opacity" />
                              
                              {/* Contenido */}
                              <div className="relative z-10 text-center text-white">
                                <div className="text-xl font-bold mb-2 drop-shadow-lg">
                                  {cofradia.nickname_cofradia}
                                </div>
                                
                                {/* Color de la cofradía */}
                                <div className="flex items-center justify-center gap-2 mb-3">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                    style={{ backgroundColor: cofradia.color }}
                                  />
                                </div>

                                {/* Votos */}
                                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                                  <span>❤️</span>
                                  <span>{votos}</span>
                                  <span className="text-sm font-normal opacity-90">
                                    {Number(votos) === 1 ? 'voto' : 'votos'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Base del podio */}
                        <div className={`
                          mt-4 rounded-b-xl bg-gradient-to-b ${medalConfig.color}
                          opacity-30 backdrop-blur-sm
                          ${posicion === 1 ? 'h-32' : posicion === 2 ? 'h-24' : 'h-20'}
                        `} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RESTO DE COFRADÍAS CON VOTOS */}
            {restoConVotos.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span>📊</span>
                  <span>Clasificación General</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restoConVotos.map((cofradia, index) => {
                    const posicion = top3Posiciones.length + index + 1;
                    
                    return (
                      <div
                        key={cofradia.id}
                        className="
                          bg-negrito-card border border-white/10 rounded-xl p-5
                          hover:border-white/30 transition-all duration-300
                          hover:shadow-lg hover:-translate-y-0.5
                          flex items-center gap-4
                        "
                      >
                        {/* Número de posición */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-400">
                            #{posicion}
                          </span>
                        </div>

                        {/* Color */}
                        <div 
                          className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: cofradia.color }}
                        />

                        {/* Nombre */}
                        <div className="flex-grow">
                          <div className="text-lg font-semibold text-white">
                            {cofradia.nickname_cofradia}
                          </div>
                        </div>

                        {/* Votos */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                          <span className="text-xl">❤️</span>
                          <span className="text-xl font-bold text-white">
                            {cofradia.votos}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COFRADÍAS SIN VOTOS */}
            {cofradiasSinVotos.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-3">
                  <span>⏳</span>
                  <span>Esperando sus primeros votos</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {cofradiasSinVotos.map((cofradia) => (
                    <div
                      key={cofradia.id}
                      className="
                        bg-white/5 border border-white/5 rounded-lg p-4
                        hover:border-white/20 transition-all duration-300
                        flex flex-col items-center gap-2 text-center
                      "
                    >
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-white/20"
                        style={{ backgroundColor: cofradia.color }}
                      />
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {cofradia.nickname_cofradia}
                      </div>
                      <div className="text-xs text-gray-600">
                        0 votos
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          // ESTADO VACÍO
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="text-6xl mb-4 grayscale opacity-30">🏆</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">Aún no hay votos</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Sé el primero en votar por tu cofradía favorita. <br/>
              ¡Cada voto cuenta!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}