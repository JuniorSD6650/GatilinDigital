'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  getBordaduriaDetail, 
  type BordaduriaDetalle 
} from '@/services/apis/api-normal';

export default function BordaduriaDetailPage() {
  const params = useParams();
  const [detail, setDetail] = useState<BordaduriaDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const id = Number(params.id);
        if (!isNaN(id)) {
          const data = await getBordaduriaDetail(id);
          setDetail(data);
        }
      } catch (error) {
        console.error("Error cargando detalle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [params?.id]);

  return (
    <div className="min-h-screen pb-20 animate-in fade-in zoom-in-95 duration-300 relative">
      
      <div className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* Botón de regreso */}
        <Link 
          href="/bordadurias"
          className="inline-flex items-center gap-2 mb-6 font-bold text-festivo-red hover:text-red-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al catálogo
        </Link>

        {loading || !detail ? (
          <div className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
        ) : (
          <div className="bg-negrito-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Header del Taller */}
            <div className="relative h-48 bg-gradient-to-r from-red-900 to-black flex items-center justify-center p-8 text-center overflow-hidden">
              {/* Patrón decorativo de fondo */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#D50000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10">
                <span className="text-red-400 text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Bordaduría & Arte</span>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white drop-shadow-lg">
                  {detail.razon_social}
                </h1>
              </div>
            </div>

            <div className="p-6 md:p-10 space-y-10">
              
              {/* Descripción Principal */}
              {detail.descripcion && (
                <div className="text-center max-w-2xl mx-auto">
                  <p className="text-gray-300 text-lg leading-relaxed font-light">
                    {detail.descripcion}
                  </p>
                  <div className="w-20 h-1 bg-festivo-red/30 mx-auto mt-6 rounded-full"></div>
                </div>
              )}

              {/* Información Detallada (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                
                {/* Columna Izquierda: Datos Comerciales */}
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

                {/* Columna Derecha: Contacto y Redes */}
                <div className="space-y-5">
                  <h3 className="text-festivo-red font-bold uppercase tracking-wider text-sm border-b border-white/10 pb-2">Contacto Directo</h3>
                  
                  {/* Botón WhatsApp / Llamar */}
                  <div className="flex gap-3">
                    <a 
                      href={`tel:${detail.celular}`}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {detail.celular}
                    </a>
                  </div>

                  {/* Enlace Facebook */}
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