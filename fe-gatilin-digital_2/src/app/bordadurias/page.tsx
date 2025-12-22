'use client';

import { useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { 
  getBordaduriasList, 
  getBordaduriaDetail,
  type BordaduriaResumen,
  type BordaduriaDetalle 
} from '@/services/apis/api-normal';

export default function BordaduriasPage() {
  // --- ESTADOS GLOBALES ---
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- ESTADOS DE LA LISTA ---
  const [list, setList] = useState<BordaduriaResumen[]>([]);
  const [filteredList, setFilteredList] = useState<BordaduriaResumen[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DEL DETALLE ---
  const [detail, setDetail] = useState<BordaduriaDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Cargar la lista al iniciar
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getBordaduriasList();
        setList(data);
        setFilteredList(data);
      } catch (error) {
        console.error("Error al cargar bordadurías:", error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // 2. Filtrar lista cuando cambia el buscador
  useEffect(() => {
    const results = list.filter(taller =>
      taller.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(results);
  }, [searchTerm, list]);

  // 3. Cargar detalle cuando se selecciona un ID
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null); // Limpiar anterior
      try {
        const data = await getBordaduriaDetail(selectedId);
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
  const handleSelectBordaduria = (id: number) => {
    setSelectedId(id);
    setView('DETAIL');
    // Scroll al top suavemente al cambiar de vista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setView('LIST');
    setDetail(null);
  };

  // --- RENDERIZADO CONDICIONAL ---

  // VISTA: DETALLE
  if (view === 'DETAIL') {
    return (
      <div className="min-h-screen pb-20 animate-in fade-in zoom-in-95 duration-300 relative">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          
          {/* Botón de regreso (Manual, sin Link) */}
          <button 
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 mb-6 font-bold text-festivo-red hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al catálogo
          </button>

          {loadingDetail || !detail ? (
            <div className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
          ) : (
            <div className="bg-negrito-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              
              {/* Header del Taller */}
              <div className="relative h-56 bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center p-8 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #D50000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="relative z-10 space-y-3">
                  <div className="inline-block text-6xl mb-2 filter drop-shadow-[0_0_20px_rgba(213,0,0,0.6)]">
                    🧵
                  </div>
                  <span className="text-festivo-red text-xs font-bold tracking-[0.3em] uppercase block drop-shadow-lg">Bordaduría & Arte Textil</span>
                  <h1 className="text-3xl md:text-5xl font-display font-bold text-white drop-shadow-2xl">
                    {detail.razon_social}
                  </h1>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                
                {/* Descripción */}
                {detail.descripcion && (
                  <div className="text-center max-w-2xl mx-auto">
                    <p className="text-gray-300 text-lg leading-relaxed font-light">
                      {detail.descripcion}
                    </p>
                    <div className="w-20 h-1 bg-festivo-red/30 mx-auto mt-6 rounded-full"></div>
                  </div>
                )}

                {/* Grid de Datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                  
                  {/* Datos Comerciales */}
                  <div className="space-y-5">
                    <h3 className="text-festivo-red font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">Datos Comerciales</h3>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs uppercase">Representante</span>
                      <span className="text-white font-medium">{detail.representante}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs uppercase">RUC</span>
                      <span className="text-white font-mono">{detail.ruc}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-xs uppercase">Dirección</span>
                      <span className="text-white">{detail.direccion}</span>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="space-y-5">
                    <h3 className="text-festivo-red font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">Contacto Directo</h3>
                    
                    <div className="flex gap-3">
                      <a 
                        href={`tel:${detail.celular}`}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border border-green-500/30 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-green-900/30 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {detail.celular}
                      </a>
                    </div>

                    {detail.web_fb && (
                      <a 
                        href={detail.web_fb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#1877F2] hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20 font-bold"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Ver Trabajos en Facebook
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA: LISTA (Default)
  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      <div className="space-y-6 mb-8 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Bordadurías" 
          description="Maestros del arte textil que visten de gala nuestra tradición."
          borderColor="border-festivo-red"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        
        {/* BUSCADOR */}
        <div className="relative max-w-lg mx-auto mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-festivo-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-negrito-card border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-red/50 focus:border-transparent transition-all shadow-lg"
            placeholder="Buscar taller o bordaduría..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.length > 0 ? (
              filteredList.map((taller) => (
                <div
                  key={taller.id}
                  onClick={() => handleSelectBordaduria(taller.id)}
                  className="group relative bg-negrito-card overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(213,0,0,0.4)] hover:border-festivo-red/50 block cursor-pointer"
                >
                  {/* Decoración de fondo */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`stitch-${taller.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M0 10 L20 10 M10 0 L10 20" stroke="#D50000" strokeWidth="1" fill="none"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#stitch-${taller.id})`} />
                    </svg>
                  </div>

                  <div className="h-1 w-full bg-gradient-to-r from-festivo-red via-red-500 to-festivo-red shadow-[0_0_15px_rgba(213,0,0,0.5)]"></div>

                  <div className="p-8 flex flex-col items-center text-center relative z-10">
                    <div className="mb-4 text-5xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[0_0_10px_rgba(213,0,0,0.3)]">
                      🧵
                    </div>

                    <h3 className="text-xl font-display font-bold text-white group-hover:text-festivo-red transition-colors leading-tight">
                      {taller.razon_social}
                    </h3>
                    
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest group-hover:text-festivo-red/70 transition-colors">
                      <span>Ver Detalles</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No se encontraron bordadurías con ese nombre.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}