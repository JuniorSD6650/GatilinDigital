'use client';

import { useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
// Importamos la función desde la ruta específica para el rol normal/público
import { getOrganizaciones, type Organizacion } from '@/services/apis/api-normal';

export default function FestivalPage() {
  const [streams, setStreams] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOrganizaciones();
        // Filtramos solo los que tienen link de streaming activo
        const activeStreams = data.filter(org => org.streaming_link);
        setStreams(activeStreams);
      } catch (error) {
        console.error("Error cargando streams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener la configuración visual según la plataforma
  const getPlatformConfig = (link: string) => {
    const lowerLink = link.toLowerCase();
    
    // Configuración base de iconos (flexibles para escalar desde el padre)
    if (lowerLink.includes('facebook') || lowerLink.includes('fb.watch')) {
      return {
        name: 'Facebook Live',
        bgColor: 'bg-[#1877F2]',
        textColor: 'text-[#1877F2]',
        icon: (
          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        )
      };
    }
    if (lowerLink.includes('youtube') || lowerLink.includes('youtu.be')) {
      return {
        name: 'YouTube',
        bgColor: 'bg-[#FF0000]',
        textColor: 'text-[#FF0000]',
        icon: (
          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
      };
    }
    if (lowerLink.includes('instagram')) {
      return {
        name: 'Instagram',
        bgColor: 'bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4]', 
        textColor: 'text-[#E1306C]',
        icon: (
          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      };
    }
    if (lowerLink.includes('tiktok')) {
      return {
        name: 'TikTok',
        bgColor: 'bg-[#000000]',
        textColor: 'text-white',
        icon: (
          <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17.82-1.51 1.43-.68 1.24-.62 2.8.12 4.01.69 1.16 1.99 1.96 3.35 2.05 1.4.08 2.8-.5 3.76-1.58.96-1.07 1.47-2.52 1.45-3.98-.02-3.52-.01-7.04 0-10.56.97.06 1.96.03 2.94.03z"/>
          </svg>
        )
      };
    }
    
    // Default / Web
    return {
      name: 'Sitio Web',
      bgColor: 'bg-neutral-800',
      textColor: 'text-gray-400',
      icon: <span className="text-9xl">📡</span>
    };
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header */}
      <div className="space-y-6 mb-12 relative z-10">
        <BackButton />
        <SectionHeader 
          title="Festival en Vivo" 
          description="Sigue la festividad minuto a minuto a través de nuestras transmisiones oficiales."
          borderColor="border-festivo-blue"
        />
      </div>

      {/* 2. Contenedor Principal (Centrado) */}
      <div className="max-w-4xl mx-auto px-4">
        
        {loading ? (
          // SKELETON LOADING (Tarjeta compacta)
          <div className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
        ) : streams.length > 0 ? (
          // LISTA DE STREAMS (Diseño Horizontal Compacto)
          <div className="flex flex-col gap-6">
            {streams.map((stream) => {
              const platform = getPlatformConfig(stream.streaming_link || '');
              
              return (
                <div 
                  key={stream.id} 
                  // Usamos la clase animate-float definida en globals.css
                  // Al hacer hover: pausa la flotación, sube ligeramente y escala.
                  className="group relative animate-float bg-negrito-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-festivo-blue/40 hover:border-festivo-blue/50 hover:-translate-y-1 hover:scale-[1.01] flex flex-col md:flex-row"
                >
                  
                  {/* LADO IZQUIERDO: LOGO DE PLATAFORMA */}
                  <div className={`relative h-48 md:h-auto md:w-2/5 ${platform.bgColor} flex items-center justify-center text-white overflow-hidden shrink-0`}>
                    {/* Efecto de brillo de fondo */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                    
                    {/* Icono de la plataforma */}
                    <div className="transform transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl opacity-90 p-6">
                      <div className="w-24 h-24 md:w-32 md:h-32">
                        {platform.icon}
                      </div>
                    </div>
                  </div>

                  {/* LADO DERECHO: CONTENIDO Y BOTÓN */}
                  <div className="p-6 md:p-8 flex flex-col justify-center items-start text-left flex-grow bg-negrito-card relative z-10">
                    
                    {/* Nombre de la Organización */}
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 drop-shadow-lg group-hover:text-festivo-blue transition-colors">
                      {stream.nombre}
                    </h3>
                    
                    <p className="text-base text-gray-300 mb-6 leading-relaxed line-clamp-3">
                      {stream.descripcion || "Disfruta de la transmisión en vivo de esta cuadrilla y vive la emoción de la danza."}
                    </p>

                    {/* BOTÓN DE ACCIÓN (Alineado a la izquierda) */}
                    <a 
                      href={stream.streaming_link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`
                        w-full md:w-auto py-3 px-6 rounded-xl font-bold text-white text-base uppercase tracking-wider
                        flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105
                        ${platform.bgColor} shadow-lg hover:shadow-xl
                      `}
                    >
                      <span>Ver en {platform.name}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 animate-pulse">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                    
                    <p className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest opacity-60">
                      Click para abrir la app oficial
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // ESTADO VACÍO
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="text-6xl mb-4 grayscale opacity-30">📡</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No hay transmisiones activas</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              Las cuadrillas aún no han iniciado sus transmisiones. <br/>
              ¡Vuelve pronto para vivir la fiesta!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}