'use client';
import { useState, useEffect } from 'react';
import { getCofradesbyCofradia, Cofrade } from '@/services/apis/api-normal';
import { API_URL } from '@/services/api';

interface CofradesSeccionProps {
  cofradiaId: number;
  cofradiaColor: string;
}

// Función para obtener el año por defecto
const getDefaultYear = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Si estamos en enero-junio del año siguiente, mostrar el año anterior
  if (currentMonth <= 6) {
    return currentYear - 1;
  }
  
  return currentYear;
};

export default function CofradesSection({ cofradiaId, cofradiaColor }: CofradesSeccionProps) {
  const [cofrades, setCofrades] = useState<Cofrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(getDefaultYear());

  useEffect(() => {
    const fetchCofrades = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCofradesbyCofradia(cofradiaId);
        setCofrades(data);
      } catch (err) {
        console.error('Error cargando cofrades:', err);
        setError('No se pudieron cargar los cofrades');
      } finally {
        setLoading(false);
      }
    };

    if (cofradiaId) {
      fetchCofrades();
    }
  }, [cofradiaId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)] bg-white/5 rounded-xl p-3 animate-pulse">
              <div className="h-20 bg-white/10 rounded-lg mb-2" />
              <div className="h-3 bg-white/10 rounded mb-1.5" />
              <div className="h-2 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (cofrades.length === 0) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>No hay cofrades registrados en esta cuadrilla</p>
        </div>
      </div>
    );
  }

  // Obtener años disponibles (desde 2025 en adelante)
  const availableYears = Array.from(new Set(cofrades.map(c => c.anio)))
    .filter(year => year >= 2025)
    .sort((a, b) => b - a);

  // Filtrar cofrades por año seleccionado
  const cofradesDelAno = cofrades.filter(c => c.anio === selectedYear);

  // Separar bailantes de los demás
  const bailantes = cofradesDelAno.filter(c => 
    c.personaje_cofradia?.toLowerCase().includes('bailant') ||
    c.cargo_cofrade?.toLowerCase().includes('bailant')
  );
  
  const otros = cofradesDelAno.filter(c => 
    !c.personaje_cofradia?.toLowerCase().includes('bailant') &&
    !c.cargo_cofrade?.toLowerCase().includes('bailant')
  );

  // Crear grupos
  const grupos: Array<{ personaje: string; cargo: string; cofrades: Cofrade[] }> = [];

  // Grupo de Bailantes
  if (bailantes.length > 0) {
    grupos.push({
      personaje: 'Bailantes',
      cargo: 'ninguno',
      cofrades: bailantes.sort((a, b) => a.nombres_apellidos.localeCompare(b.nombres_apellidos))
    });
  }

  // Grupo de Otros/Demás
  if (otros.length > 0) {
    grupos.push({
      personaje: 'Sociales',
      cargo: 'ninguno',
      cofrades: otros.sort((a, b) => {
        // Primero los que tienen cargo (no "ninguno"), luego alfabético
        const cargoA = a.cargo_cofrade?.toLowerCase() || 'ninguno';
        const cargoB = b.cargo_cofrade?.toLowerCase() || 'ninguno';
        
        if (cargoA !== 'ninguno' && cargoB === 'ninguno') return -1;
        if (cargoA === 'ninguno' && cargoB !== 'ninguno') return 1;
        
        return a.nombres_apellidos.localeCompare(b.nombres_apellidos);
      })
    });
  }

  return (
    <div className="space-y-6">
      {/* Header con título y filtro de año - CENTRADO */}
      <div className="flex flex-col items-center gap-4 border-b pb-4" style={{ borderColor: `${cofradiaColor}40` }}>
        <h3
          className="text-lg font-bold text-white text-center"
          style={{ color: cofradiaColor }}
        >
          Integrantes de la Cuadrilla
        </h3>

        {/* Selector de años */}
        {availableYears.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedYear === year
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-400 bg-white/5 hover:bg-white/10'
                }`}
                style={
                  selectedYear === year
                    ? { backgroundColor: cofradiaColor }
                    : undefined
                }
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mostrar mensaje si no hay cofrades del año seleccionado */}
      {cofradesDelAno.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No hay cofrades registrados para el año {selectedYear}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo, idx) => (
            <div key={idx} className="space-y-3">
              {/* Título del grupo - CENTRADO */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base font-bold text-white text-center">
                    {grupo.personaje}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${cofradiaColor}20`, color: cofradiaColor }}
                  >
                    {grupo.cofrades.length}
                  </span>
                </div>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Grid de cofrades - CENTRADO */}
              <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
                {grupo.cofrades.map((cofrade) => (
                  <div
                    key={cofrade.id}
                    className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)] group bg-gradient-to-br from-neutral-900 to-black rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      boxShadow: `0 2px 8px ${cofradiaColor}15`,
                    }}
                  >
                    {/* Foto - MÁS COMPACTA */}
                    <div className="relative h-28 sm:h-32 bg-neutral-800 overflow-hidden">
                      {cofrade.ruta_foto ? (
                        <img
                          src={`${API_URL}/${cofrade.ruta_foto}`}
                          alt={cofrade.nombres_apellidos}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info - MÁS COMPACTA */}
                    <div className="p-2.5 sm:p-3 space-y-1.5">
                      <h4 className="font-bold text-white text-xs sm:text-sm leading-tight line-clamp-2">
                        {cofrade.nombres_apellidos}
                      </h4>

                      {/* Personaje */}
                      {cofrade.personaje_cofradia && cofrade.personaje_cofradia.toLowerCase() !== 'ninguno' && (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: cofradiaColor }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                            />
                          </svg>
                          <span className="truncate">{cofrade.personaje_cofradia}</span>
                        </div>
                      )}

                      {/* Cargo */}
                      {cofrade.cargo_cofrade && cofrade.cargo_cofrade.toLowerCase() !== 'ninguno' && (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: cofradiaColor }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                            />
                          </svg>
                          <span className="truncate font-semibold" style={{ color: cofradiaColor }}>
                            {cofrade.cargo_cofrade}
                          </span>
                        </div>
                      )}

                      {/* Celular */}
                      {cofrade.celular && (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-3 h-3 flex-shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                            />
                          </svg>
                          <span className="truncate">{cofrade.celular}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
