'use client';

// Desactivar pre-renderizado estático para esta página
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import CofradiaDetail from "@/components/CofradiaDetail";
import { 
  getCofradiaList, 
  getCofradiaDetail,
  type CofradiaResumen,
  type CofradiaDetalle
} from '@/services/apis/api-normal';

// Componente que maneja los query params
function QueryParamHandler({ onCofradiaSelect }: { onCofradiaSelect: (id: number) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const cofradiaId = searchParams.get('cofradia');
    if (cofradiaId) {
      const id = parseInt(cofradiaId, 10);
      if (!isNaN(id)) {
        onCofradiaSelect(id);
      }
    }
  }, [searchParams, onCofradiaSelect]);

  return null;
}

function SigueteoContent() {
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

  // Router para navegación
  const router = useRouter();

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

  // Handler para seleccionar cofradía desde query param
  const handleCofradiaFromQuery = (id: number) => {
    setSelectedId(id);
    setView('DETAIL');
  };

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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };// Limpiar query params de la URL
    router.push('/sigueteo', { scroll: false });
    
    // Limpiar estados
    

  const handleBackToList = () => {
    setSelectedId(null);
    setView('LIST');
    setDetail(null);
  };

  // ==========================================
  // VISTA: DETALLE
  // ==========================================
  if (view === 'DETAIL' && detail) {
    return (
      <CofradiaDetail 
        detail={detail}
        onBack={handleBackToList}
        loading={loadingDetail}
      />
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
              filteredList.map((cofradia) => {
                // Fix color negro aquí también para la lista
                const displayColor = (cofradia.color === '#000' || cofradia.color === '#000000' || !cofradia.color) 
                  ? '#FF007F' 
                  : cofradia.color;

                return (
                  <div
                    key={cofradia.id}
                    onClick={() => handleSelectCofradia(cofradia.id)}
                    className="group relative bg-negrito-card border border-white/10 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-festivo-cyan/10 overflow-hidden block cursor-pointer"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {/* Barra de color lateral */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-2 transition-all duration-300 group-hover:w-3"
                      style={{ backgroundColor: displayColor }}
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
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No se encontraron cofradías con ese nombre.</p>
              </div>
            )}
          </div>
        )}

        {/* Query Param Handler con Suspense */}
        <Suspense fallback={null}>
          <QueryParamHandler onCofradiaSelect={handleCofradiaFromQuery} />
        </Suspense>

      </div>
    </div>
  );
}

export default function SigueteoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pb-20 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
        </div>
      </div>
    }>
      <SigueteoContent />
    </Suspense>
  );
}
