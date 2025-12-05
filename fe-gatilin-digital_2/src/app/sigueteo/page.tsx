'use client';

import { useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { 
  getCofradiaList, 
  getCofradiaDetail,
  type CofradiaResumen,
  type CofradiaDetalle
} from '@/services/apis/api-normal';

// --- FUNCIÓN AUXILIAR (Fuera del componente) ---
const formatRelativeTime = (dateString: string) => {
    try {
        if (!dateString) return "Fecha desconocida";

        const [datePart, timePart] = dateString.split(' ');
        if (!datePart || !timePart) return dateString;

        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);

        const updateDate = new Date(year, month - 1, day, hours, minutes, seconds);
        const now = new Date();

        const diffMs = now.getTime() - updateDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24 && diffHours >= 0) {
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `Hace ${diffMinutes} min`;
            }
            return `Hace ${Math.floor(diffHours)} horas`;
        }

        return dateString;
    } catch (e) {
        return dateString;
    }
};

export default function SigueteoPage() {
  // --- ESTADOS GLOBALES ---
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- ESTADOS DE LISTA ---
  const [list, setList] = useState<CofradiaResumen[]>([]);
  const [filteredList, setFilteredList] = useState<CofradiaResumen[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DE DETALLE ---
  const [detail, setDetail] = useState<CofradiaDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Cargar Lista
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getCofradiaList();
        setList(data);
        setFilteredList(data);
      } catch (error) {
        console.error("Error al cargar lista:", error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // 2. Filtrar Lista
  useEffect(() => {
    const results = list.filter(cofradia =>
      cofradia.nickname_cofradia.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(results);
  }, [searchTerm, list]);

  // 3. Cargar Detalle al seleccionar
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null);
      try {
        const data = await getCofradiaDetail(selectedId);
        setDetail(data);
      } catch (error) {
        console.error("Error cargando detalle:", error);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedId]);

  // --- HANDLERS ---
  const handleSelectCofradia = (id: number) => {
    setSelectedId(id);
    setView('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setView('LIST');
    setDetail(null);
  };

  // ==========================================
  // VISTA: DETALLE
  // ==========================================
  if (view === 'DETAIL') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in zoom-in-95 duration-300 relative">
        <div className="max-w-4xl mx-auto px-4 pt-6">

            {/* Botón de regreso (Manual) */}
            <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 mb-6 font-bold transition-opacity hover:opacity-80 bg-transparent border-none cursor-pointer"
                style={{ color: detail?.color || '#00B0FF' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Volver a la lista
            </button>

            {loadingDetail || !detail ? (
                <div className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
            ) : (
                <div className="bg-negrito-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

                    {/* Header del Detalle */}
                    <div
                        className="h-30 relative flex items-end p-6"
                        style={{ backgroundColor: detail.color || '#00B0FF' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-negrito-card to-transparent opacity-90" />
                        <div className="relative z-10 w-full">
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-lg leading-tight">
                                {detail.nickname_cofradia}
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-10">

                        {/* 1. SECCIÓN: UBICACIÓN */}
                        <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 text-center space-y-4">
                            <p className="text-gray-400 text-sm uppercase tracking-widest">¿Dónde están ahora?</p>

                            <a
                                href={detail.ubicacion_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-4 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-lg"
                                style={{
                                    backgroundColor: detail.color || '#00B0FF',
                                    boxShadow: `0 10px 20px -5px ${detail.color}60`
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-bounce">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                Ver Ubicación en Google Maps
                            </a>

                            <p className="text-xs text-gray-500 font-mono">
                                Actualizado: <span className="font-bold" style={{ color: detail.color }}>{formatRelativeTime(detail.ubicacion_link_actualizado)}</span>
                            </p>
                        </div>

                        {/* 2. SECCIÓN: HISTORIA */}
                        {detail.descripcion && (
                            <div className="relative py-10 px-8 bg-white/5 rounded-2xl border border-white/5 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div
                                    className="absolute top-2 left-4 text-7xl font-serif opacity-20 select-none"
                                    style={{ color: detail.color }}
                                >
                                    “
                                </div>

                                <div className="relative z-10 text-center">
                                    <h3
                                        className="text-xl font-display font-bold uppercase tracking-widest mb-6"
                                        style={{ color: detail.color }}
                                    >
                                        Nuestra Historia
                                    </h3>
                                    <p className="text-gray-300 font-serif italic text-lg leading-loose whitespace-pre-line">
                                        {detail.descripcion}
                                    </p>
                                </div>

                                <div
                                    className="absolute bottom-[-20px] right-4 text-7xl font-serif opacity-20 select-none rotate-180"
                                    style={{ color: detail.color }}
                                >
                                    “
                                </div>
                            </div>
                        )}

                        {/* 3. SECCIÓN: DATOS GENERALES */}
                        <div className="space-y-4">
                            <h3
                                className="text-lg font-bold text-white border-b pb-2"
                                style={{ color: detail.color, borderColor: `${detail.color}40` }}
                            >
                                Información General
                            </h3>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-gray-300">
                                {/* Nombre completo */}
                                <li className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre completo</span>
                                    <span className="font-medium">
                                        {detail.nombre_cofradia || <span className="text-gray-600 italic font-light">No especificada</span>}
                                    </span>
                                </li>

                                {/* Fundación */}
                                <li className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Fundación</span>
                                    <span className="font-medium">
                                        {detail.fecha_fundacion || <span className="text-gray-600 italic font-light">No especificada</span>}
                                    </span>
                                </li>

                                {/* Distrito */}
                                <li className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Distrito</span>
                                    <span className="font-medium">
                                        {detail.distrito || <span className="text-gray-600 italic font-light">Huánuco</span>}
                                    </span>
                                </li>

                                {/* Sede Local */}
                                <li className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Sede Local</span>
                                    <span className="font-medium">
                                        {detail.sede_local || <span className="text-gray-600 italic font-light">No especificada</span>}
                                    </span>
                                </li>

                                {/* Representante */}
                                <li className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Representante</span>
                                    <span className="font-medium">
                                        {detail.nombre_representante || <span className="text-gray-600 italic font-light">No registrado</span>}
                                    </span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: LISTA (Default)
  // ==========================================
  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      <div className="space-y-6 mb-8 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Sigueteo" 
          description="Encuentra a tu cofradía favorita y acompáñalos en su recorrido."
          borderColor="border-festivo-cyan"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        
        {/* BUSCADOR */}
        <div className="relative max-w-lg mx-auto mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-festivo-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-negrito-card border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-cyan/50 focus:border-transparent transition-all shadow-lg"
            placeholder="Buscar cofradía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {loadingList ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.length > 0 ? (
              filteredList.map((cofradia) => (
                <div
                  key={cofradia.id}
                  onClick={() => handleSelectCofradia(cofradia.id)}
                  className="group relative bg-negrito-card border border-white/10 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-festivo-cyan/10 overflow-hidden block cursor-pointer"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  {/* Barra de color lateral */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 transition-all duration-300 group-hover:w-3"
                    style={{ backgroundColor: cofradia.color || '#00B0FF' }}
                  />
                  
                  <div className="pl-4">
                    <h3 className="text-xl font-display font-bold text-white transition-colors">
                      {cofradia.nickname_cofradia}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span>📍</span> Toca para ver ubicación
                    </p>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition-all group-hover:translate-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No se encontraron cofradías con ese nombre.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}