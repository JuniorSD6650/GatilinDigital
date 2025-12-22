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
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'bailantes' | 'sociales'>('bailantes');

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
    const esBailante = (c: Cofrade) => {
      const personaje = c.personaje_cofradia?.toLowerCase() || '';
      const cargo = c.cargo_cofrade?.toLowerCase() || '';
      // Es bailante si:
      // - personaje_cofradia incluye 'bailant'
      // - cargo_cofrade incluye 'bailant'
      // - personaje_cofradia existe y es distinto de 'ninguno'
      if (personaje.includes('bailant') || cargo.includes('bailant')) return true;
      if (personaje && personaje !== 'ninguno') return true;
      return false;
    };

    // Bailantes: todos los que cumplen la función
    const bailantes = cofradesDelAno.filter(esBailante);

    // Sociales: todos los que NO tengan cargo bailante
    const sociales = cofradesDelAno.filter(c => {
      const cargo = c.cargo_cofrade?.toLowerCase() || '';
      // Si el cargo NO incluye 'bailant', es social
      return !cargo.includes('bailant');
    });

  // Ordenar bailantes alfabéticamente
  const bailantesOrdenados = bailantes.sort((a, b) => a.nombres_apellidos.localeCompare(b.nombres_apellidos));
  
  // Ordenar sociales: primero los que tienen cargo, luego alfabético
    const socialesOrdenados = sociales.sort((a, b) => {
    const cargoA = a.cargo_cofrade?.toLowerCase() || 'ninguno';
    const cargoB = b.cargo_cofrade?.toLowerCase() || 'ninguno';
    
    if (cargoA !== 'ninguno' && cargoB === 'ninguno') return -1;
    if (cargoA === 'ninguno' && cargoB !== 'ninguno') return 1;
    
    return a.nombres_apellidos.localeCompare(b.nombres_apellidos);
  });

  // Seleccionar qué mostrar según la pestaña
  const cofradesAMostrar = tipoSeleccionado === 'bailantes' ? bailantesOrdenados : socialesOrdenados;

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

        {/* Selector de tipo: Bailantes / Sociales */}
        {cofradesDelAno.length > 0 && (bailantes.length > 0 && sociales.length > 0) && (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTipoSeleccionado('bailantes')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                tipoSeleccionado === 'bailantes'
                  ? 'text-white shadow-lg scale-105'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
              style={
                tipoSeleccionado === 'bailantes'
                  ? { backgroundColor: cofradiaColor }
                  : undefined
              }
            >
              <div className="text-center">
                <div className="text-sm md:text-base">Bailantes</div>
                <div className="text-xs opacity-70">({bailantes.length})</div>
              </div>
            </button>
            <button
              onClick={() => setTipoSeleccionado('sociales')}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                tipoSeleccionado === 'sociales'
                  ? 'text-white shadow-lg scale-105'
                  : 'text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
              style={
                tipoSeleccionado === 'sociales'
                  ? { backgroundColor: cofradiaColor }
                  : undefined
              }
            >
              <div className="text-center">
                <div className="text-sm md:text-base">Sociales</div>
                <div className="text-xs opacity-70">({sociales.length})</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Mostrar mensaje si no hay cofrades del año seleccionado */}
      {cofradesDelAno.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No hay cofrades registrados para el año {selectedYear}</p>
        </div>
      ) : cofradesAMostrar.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No hay {tipoSeleccionado} registrados para este año</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Grid de cofrades - CENTRADO */}
          <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
            {cofradesAMostrar.map((cofrade) => (
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
                      <img
                        src="/icons/profile.svg"
                        alt="Foto de perfil vacía"
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-80"
                      />
                    </div>
                  )}
                  {/* Cinta de personaje solo si NO es sociales */}
                  {tipoSeleccionado === 'bailantes' && cofrade.personaje_cofradia && cofrade.personaje_cofradia.toLowerCase() !== 'ninguno' && (
                    <div
                      className="absolute left-0 bottom-0 px-2 py-1 bg-black/70 rounded-tr-lg text-[10px] sm:text-xs text-white font-semibold max-w-[80%] truncate shadow-lg"
                      style={{
                        borderTopRightRadius: '0.5rem',
                        fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
                        zIndex: 2,
                      }}
                    >
                      {cofrade.personaje_cofradia}
                    </div>
                  )}
                </div>

                {/* Info - MÁS COMPACTA */}
                <div className="p-2.5 sm:p-3 space-y-1.5 flex flex-col">
                  <h4
                    className="font-bold text-white text-xs sm:text-sm md:text-base leading-tight"
                    style={{
                      fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                      maxHeight: '5.5em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.4em',
                    }}
                  >
                    {cofrade.nombres_apellidos}
                  </h4>

                  {/* Cargo solo si NO es bailantes */}
                  {tipoSeleccionado === 'sociales' && cofrade.cargo_cofrade && cofrade.cargo_cofrade.toLowerCase() !== 'ninguno' && (
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs mt-auto pt-1">
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
                      <span className="truncate font-semibold" style={{ color: cofradiaColor, maxWidth: '80%' }}>
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
      )}
    </div>
  );
}
