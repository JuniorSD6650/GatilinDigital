'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { 
  getCofradiaList, 
  type CofradiaResumen 
} from '@/services/apis/api-normal';

export default function SigueteoListPage() {
  const [list, setList] = useState<CofradiaResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getCofradiaList();
        setList(data);
      } catch (error) {
        console.error("Error al cargar lista:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

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
        
        {loading ? (
          // Skeleton Loading Lista
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((cofradia) => (
              <Link
                key={cofradia.id}
                href={`/sigueteo/${cofradia.id}`} // Navegación a la página de detalle
                className="group relative bg-negrito-card border border-white/10 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-festivo-cyan/10 overflow-hidden block"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {/* Barra de color lateral */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2 transition-all duration-300 group-hover:w-3"
                  style={{ backgroundColor: cofradia.color || '#00B0FF' }}
                />
                
                <div className="pl-4">
                  <h3 
                    className="text-xl font-display font-bold text-white transition-colors"
                  >
                    {cofradia.nickname_cofradia}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span>📍</span> Toca para ver ubicación
                  </p>
                </div>
                
                <div 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition-all group-hover:translate-x-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className="w-6 h-6 group-hover:text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}