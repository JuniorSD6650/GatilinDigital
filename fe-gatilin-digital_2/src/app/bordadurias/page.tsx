'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { 
  getBordaduriasList, 
  type BordaduriaResumen 
} from '@/services/apis/api-normal';

export default function BordaduriasListPage() {
  const [list, setList] = useState<BordaduriaResumen[]>([]);
  const [filteredList, setFilteredList] = useState<BordaduriaResumen[]>([]); // Estado para la lista filtrada
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto del buscador

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getBordaduriasList();
        setList(data);
        setFilteredList(data); // Inicialmente mostramos todos
      } catch (error) {
        console.error("Error al cargar bordadurías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  // Efecto para filtrar automáticamente cuando cambia el texto o la lista original
  useEffect(() => {
    const results = list.filter(taller =>
      taller.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(results);
  }, [searchTerm, list]);

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
        
        {/* BUSCADOR INSTANTÁNEO */}
        <div className="relative max-w-lg mx-auto mb-12 group">
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-festivo-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Input */}
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-negrito-card border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-red/50 focus:border-transparent transition-all shadow-lg"
            placeholder="Buscar taller o bordaduría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Botón de limpiar (solo aparece si hay texto) */}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.length > 0 ? (
              filteredList.map((taller) => (
                <Link
                  key={taller.id}
                  href={`/bordadurias/${taller.id}`}
                  className="group relative bg-negrito-card overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(213,0,0,0.3)] block"
                >
                  {/* Decoración de fondo (Patrón de Hilos) */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="stitch" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M0 10 L20 10 M10 0 L10 20" stroke="#D50000" strokeWidth="1" fill="none"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#stitch)" />
                    </svg>
                  </div>

                  {/* Borde superior rojo brillante */}
                  <div className="h-1 w-full bg-festivo-red shadow-[0_0_10px_#D50000]"></div>

                  <div className="p-8 flex flex-col items-center text-center relative z-10">
                    {/* Icono de Aguja/Hilo */}
                    <div className="mb-4 text-festivo-red p-3 bg-red-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                      </svg>
                    </div>

                    <h3 className="text-xl font-display font-bold text-white group-hover:text-festivo-red transition-colors">
                      {taller.razon_social}
                    </h3>
                    
                    <span className="text-xs text-gray-500 mt-2 uppercase tracking-widest group-hover:text-gray-400">Ver Detalles</span>
                  </div>
                </Link>
              ))
            ) : (
              // Estado vacío si la búsqueda no arroja resultados
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