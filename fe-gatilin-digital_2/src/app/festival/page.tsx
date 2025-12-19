'use client';

import { useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { getFestivalEventos, getFestivalDias, type FestivalEvento, type FestivalDia } from '@/services/apis/api-normal';

export default function FestivalPage() {
  const [eventos, setEventos] = useState<FestivalEvento[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Función para extraer solo la fecha en formato YYYY-MM-DD
  const extractDate = (isoString: string): string => {
    return isoString.split('T')[0];
  };

  // Función para obtener el día más cercano a hoy
  const getDefaultDay = (fechas: string[]): string => {
    if (fechas.length === 0) return '';
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Buscar el día actual o el más cercano
    for (const fecha of fechas) {
      const fechaEvento = new Date(fecha);
      fechaEvento.setHours(0, 0, 0, 0);
      
      if (fechaEvento.getTime() >= hoy.getTime()) {
        return fecha;
      }
    }
    
    // Si todos los días ya pasaron, devolver el último
    return fechas[fechas.length - 1];
  };

  // Cargar días disponibles
  useEffect(() => {
    const fetchDias = async () => {
      const data = await getFestivalDias();
      // Extraer solo las fechas en formato YYYY-MM-DD
      const fechasLimpias = data.map(d => extractDate(d.fecha));
      setDias(fechasLimpias);
      
      if (fechasLimpias.length > 0) {
        const diaDefault = getDefaultDay(fechasLimpias);
        setSelectedFecha(diaDefault);
      }
    };
    fetchDias();
  }, []);

  // Cargar eventos cuando cambia la fecha
  useEffect(() => {
    const fetchEventos = async () => {
      if (!selectedFecha) return;
      
      setLoading(true);
      try {
        const data = await getFestivalEventos(selectedFecha);
        setEventos(data);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [selectedFecha]);

  // Filtrar eventos por búsqueda
  const eventosFiltrados = eventos.filter(evento =>
    evento.nombre_cofradia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatear fecha para mostrar (versión corta para botones)
  const formatFechaCorta = (fechaStr: string) => {
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return {
      diaSemana: fecha.toLocaleDateString('es-PE', { weekday: 'short' }).toUpperCase(),
      dia: day,
      mes: fecha.toLocaleDateString('es-PE', { month: 'short' })
    };
  };

  // Formatear fecha completa para el header
  const formatFechaCompleta = (fechaStr: string) => {
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return fecha.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Verificar si es hoy
  const isToday = (fechaStr: string) => {
    const hoy = new Date();
    const [year, month, day] = fechaStr.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  };

  // Obtener badge de tipo de actividad
  const getActividadBadge = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'víspera':
        return { emoji: '🌙', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'presentación':
        return { emoji: '🎭', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'despedida':
        return { emoji: '👋', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      default:
        return { emoji: '📅', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="space-y-6 mb-8 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Festival Oficial" 
          description="Cronograma completo de presentaciones de las cofradías"
          borderColor="border-festivo-blue"
        />
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header con fecha seleccionada */}
        {selectedFecha && (
          <div className="mb-6 text-center">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-2 break-words whitespace-normal leading-tight"
              style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.2 }}
            >
              {formatFechaCompleta(selectedFecha)}
            </h2>
            {isToday(selectedFecha) && (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-festivo-blue/20 border border-festivo-blue text-festivo-blue font-bold text-sm animate-pulse">
                📍 Hoy
              </span>
            )}
          </div>
        )}

        {/* Controles: Selector de día y búsqueda */}
        <div className="mb-8 space-y-4">
          {/* Selector de días - Carrusel horizontal */}
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {dias.map((dia) => {
                const fechaInfo = formatFechaCorta(dia);
                const esHoy = isToday(dia);
                const seleccionado = selectedFecha === dia;
                
                return (
                  <button
                    key={dia}
                    onClick={() => setSelectedFecha(dia)}
                    className={`
                      flex-shrink-0 relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl
                      font-bold transition-all
                      ${seleccionado
                        ? 'bg-festivo-blue text-white shadow-lg scale-105'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }
                    `}
                  >
                    {esHoy && (
                      <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    )}
                    <span className="text-xs opacity-80">{fechaInfo.diaSemana}</span>
                    <span className="text-2xl">{fechaInfo.dia}</span>
                    <span className="text-xs opacity-80">{fechaInfo.mes}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar cofradía..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-12 pr-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  text-white placeholder:text-gray-500
                  focus:outline-none focus:border-festivo-blue focus:ring-2 focus:ring-festivo-blue/50
                  transition-all
                "
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de eventos */}
        {loading ? (
          // SKELETON LOADING
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="space-y-3">
            {eventosFiltrados.map((evento, index) => {
              const actividadBadge = getActividadBadge(evento.tipo_actividad);
              const isProximo = index === 0;
              
              return (
                <div
                  key={evento.id}
                  className={`
                    bg-negrito-card border rounded-xl p-4 md:p-5
                    hover:border-white/30 transition-all duration-300
                    hover:shadow-lg hover:-translate-y-0.5
                    ${isProximo 
                      ? 'border-festivo-blue shadow-lg shadow-festivo-blue/20' 
                      : 'border-white/10'
                    }
                  `}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    
                    {/* Hora */}
                    <div className="flex-shrink-0">
                      <div className={`
                        px-4 py-2 rounded-lg text-center
                        ${isProximo 
                          ? 'bg-festivo-blue text-white' 
                          : 'bg-white/5 text-gray-300'
                        }
                      `}>
                        <div className="text-xl md:text-2xl font-bold">
                          {evento.hora_texto}
                        </div>
                      </div>
                    </div>

                    {/* Información principal */}
                    <div className="flex-grow space-y-3">
                      {/* Nombre de la cofradía - máximo 4 líneas */}
                      <h3
                        className="text-lg md:text-xl font-bold text-white break-words whitespace-normal leading-tight"
                        style={{
                          fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {evento.nombre_cofradia}
                      </h3>
                      
                      {/* Detalles */}
                      <div className="flex flex-col gap-2">
                        {/* Tipo de actividad y estado en la misma línea */}
                        <div className="flex items-center gap-2 text-sm overflow-x-auto">
                          <span className={`
                            inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-semibold whitespace-nowrap text-xs
                            ${actividadBadge.color}
                          `}>
                            <span>{actividadBadge.emoji}</span>
                            <span>{evento.tipo_actividad}</span>
                          </span>

                          <span className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold whitespace-nowrap text-xs
                            ${evento.estado === 'en_curso' 
                              ? 'bg-green-500/20 text-green-300' 
                              : evento.estado === 'finalizado'
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-blue-500/20 text-blue-300'
                            }
                          `}>
                            {evento.estado === 'en_curso' && '🔴 En vivo'}
                            {evento.estado === 'finalizado' && '✅ Finalizado'}
                            {evento.estado === 'programado' && '📅 Programado'}
                          </span>
                        </div>

                        {/* Lugar en su propia línea */}
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="truncate">{evento.lugar}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge "Próximo" */}
                    {isProximo && (
                      <div className="flex-shrink-0">
                        <div className="px-4 py-2 rounded-lg bg-festivo-blue/20 border border-festivo-blue text-festivo-blue font-bold text-sm animate-pulse">
                          ⏰ Próximo
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        ) : searchTerm ? (
          // NO HAY RESULTADOS DE BÚSQUEDA
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">
              No se encontró "{searchTerm}"
            </h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              No hay eventos que coincidan con tu búsqueda. <br/>
              Intenta con otro nombre.
            </p>
          </div>
        ) : (
          // ESTADO VACÍO
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="text-6xl mb-4 grayscale opacity-30">📅</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">
              No hay eventos programados
            </h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Selecciona otro día para ver los eventos disponibles.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}