'use client';

import { useEffect, useState } from 'react';
import { type CofradiaDetalle, type Evento, getEventosByCofradiaId } from '@/services/apis/api-normal';

// Función auxiliar para formatear tiempo relativo
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

interface CofradiaDetailProps {
    detail: CofradiaDetalle;
    onBack: () => void;
    loading?: boolean;
}

export default function CofradiaDetail({ detail, onBack, loading }: CofradiaDetailProps) {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loadingEventos, setLoadingEventos] = useState(true);

    // Fix para color negro: usar #FF007F si es #000 o #000000
    const displayColor = (detail.color === '#000' || detail.color === '#000000' || !detail.color) 
        ? '#FF007F' 
        : detail.color;

    // Cargar eventos de la cofradía
    useEffect(() => {
        const fetchEventos = async () => {
            setLoadingEventos(true);
            try {
                const data = await getEventosByCofradiaId(detail.id);
                setEventos(data);
            } catch (error) {
                console.error('Error cargando eventos:', error);
            } finally {
                setLoadingEventos(false);
            }
        };

        if (detail.id) {
            fetchEventos();
        }
    }, [detail.id]);

    /* // Función para generar y descargar el tríptico (2 páginas)
    const handleDownloadTriptico = async () => {
        if (!tripticoRef.current || generatingPDF) return;
        
        setGeneratingPDF(true);
        
        try {
            // Hacer visible el tríptico temporalmente
            tripticoRef.current.style.display = 'block';
            
            // Obtener ambas páginas del tríptico
            const pages = tripticoRef.current.children;
            
            if (pages.length < 2) {
                throw new Error('No se encontraron las 2 páginas del tríptico');
            }
            
            // Crear PDF en formato horizontal (A4 landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Capturar y agregar la primera cara (página 1)
            const canvas1 = await html2canvas(pages[0] as HTMLElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#121212'
            });
            
            const imgData1 = canvas1.toDataURL('image/png');
            pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Agregar nueva página para la segunda cara
            pdf.addPage();
            
            // Capturar y agregar la segunda cara (página 2)
            const canvas2 = await html2canvas(pages[1] as HTMLElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#121212'
            });
            
            const imgData2 = canvas2.toDataURL('image/png');
            pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Ocultar nuevamente
            tripticoRef.current.style.display = 'none';
            
            // Descargar el PDF
            pdf.save(`triptico-${detail.nickname_cofradia.replace(/\s+/g, '-')}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Hubo un error al generar el tríptico. Por favor intenta nuevamente.');
        } finally {
            setGeneratingPDF(false);
        }
    }; */

    if (loading) {
        return (
            <div className="min-h-screen pb-20 animate-in fade-in zoom-in-95 duration-300 relative">
                <div className="max-w-4xl mx-auto px-4 pt-6">
                    <div className="h-96 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 animate-in fade-in zoom-in-95 duration-300 relative">
            <div className="max-w-4xl mx-auto px-4 pt-6">

                {/* Botón de regreso */}
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 mb-6 font-bold transition-opacity hover:opacity-80 bg-transparent border-none cursor-pointer"
                    style={{ color: displayColor }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Volver a la lista
                </button>

                <div className="bg-negrito-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

                    {/* Header del Detalle - FIXED: ahora el texto no se corta */}
                    <div
                        className="min-h-[120px] relative flex items-end p-6"
                        style={{ backgroundColor: displayColor }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-negrito-card to-transparent opacity-90" />
                        <div className="relative z-10 w-full">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white drop-shadow-lg leading-tight break-words">
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
                                    backgroundColor: displayColor,
                                    boxShadow: `0 10px 20px -5px ${displayColor}60`
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-bounce">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                Ver Ubicación en Google Maps
                            </a>

                            <p className="text-xs text-gray-500 font-mono">
                                Actualizado: <span className="font-bold" style={{ color: displayColor }}>{formatRelativeTime(detail.ubicacion_link_actualizado)}</span>
                            </p>
                        </div>

                        {/* 2. SECCIÓN: HISTORIA */}
                        {detail.descripcion && (
                            <div className="relative py-10 px-8 bg-white/5 rounded-2xl border border-white/5 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                <div
                                    className="absolute top-2 left-4 text-7xl font-serif opacity-20 select-none"
                                    style={{ color: displayColor }}
                                >
                                    "
                                </div>

                                <div className="relative z-10 text-center">
                                    <h3
                                        className="text-xl font-display font-bold uppercase tracking-widest mb-6"
                                        style={{ color: displayColor }}
                                    >
                                        Nuestra Historia
                                    </h3>
                                    <p className="text-gray-300 font-serif italic text-lg leading-loose whitespace-pre-line">
                                        {detail.descripcion}
                                    </p>
                                </div>

                                <div
                                    className="absolute bottom-[-20px] right-4 text-7xl font-serif opacity-20 select-none rotate-180"
                                    style={{ color: displayColor }}
                                >
                                    "
                                </div>
                            </div>
                        )}

                        {/* 3. SECCIÓN: DATOS GENERALES */}
                        <div className="space-y-4">
                            <h3
                                className="text-lg font-bold text-white border-b pb-2"
                                style={{ color: displayColor, borderColor: `${displayColor}40` }}
                            >
                                Información General
                            </h3>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-gray-300">
                                {/* Nombre completo */}
                                {detail.nombre_cofradia && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Nombre completo</span>
                                        <span className="font-medium">{detail.nombre_cofradia}</span>
                                    </li>
                                )}

                                {/* Fundación */}
                                {detail.fecha_fundacion && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Fundación</span>
                                        <span className="font-medium">{detail.fecha_fundacion}</span>
                                    </li>
                                )}

                                {/* Distrito */}
                                {detail.distrito && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Distrito</span>
                                        <span className="font-medium">{detail.distrito}</span>
                                    </li>
                                )}

                                {/* Sede Local */}
                                {detail.sede_local && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Sede Local</span>
                                        <span className="font-medium">{detail.sede_local}</span>
                                    </li>
                                )}

                                {/* Representante */}
                                {detail.nombre_representante && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Representante</span>
                                        <span className="font-medium">{detail.nombre_representante}</span>
                                    </li>
                                )}

                                {/* DNI Representante */}
                                {detail.dni_representante && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">DNI Representante</span>
                                        <span className="font-medium">{detail.dni_representante}</span>
                                    </li>
                                )}

                                {/* Celular Representante */}
                                {detail.cel_representante && (
                                    <li className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Celular</span>
                                        <span className="font-medium">{detail.cel_representante}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* 4. SECCIÓN: CRONOGRAMA DE EVENTOS */}
                        {eventos.length > 0 && (
                            <div className="space-y-4">
                                <h3
                                    className="text-xl md:text-2xl font-display font-bold uppercase tracking-wider text-center inline-block pb-1 border-b-2"
                                    style={{ color: displayColor, borderColor: displayColor }}
                                >
                                    🎉 Cronograma
                                </h3>

                                {loadingEventos ? (
                                    <div className="space-y-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Agrupar eventos por fecha */}
                                        {Object.entries(
                                            eventos.reduce((acc, evento) => {
                                                if (!acc[evento.fecha]) {
                                                    acc[evento.fecha] = [];
                                                }
                                                acc[evento.fecha].push(evento);
                                                return acc;
                                            }, {} as Record<string, Evento[]>)
                                        )
                                        .sort(([dateA], [dateB]) => {
                                            const [dayA, monthA, yearA] = dateA.split('/').map(Number);
                                            const [dayB, monthB, yearB] = dateB.split('/').map(Number);
                                            const dateObjA = new Date(yearA, monthA - 1, dayA);
                                            const dateObjB = new Date(yearB, monthB - 1, dayB);
                                            return dateObjA.getTime() - dateObjB.getTime();
                                        })
                                        .map(([fecha, eventosDelDia]) => (
                                            <div key={fecha} className="relative">
                                                {/* Header de Fecha - más compacto */}
                                                <div className="flex items-center gap-2 md:gap-3 mb-2">
                                                    <div 
                                                        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl shadow-md font-bold text-white flex-shrink-0"
                                                        style={{ backgroundColor: displayColor }}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-lg md:text-xl leading-none">{fecha.split('/')[0]}</div>
                                                            <div className="text-[10px] opacity-70">{fecha.split('/')[1]}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm md:text-base font-bold text-white truncate">{eventosDelDia[0].tipo_dia}</p>
                                                        <p className="text-xs text-gray-500">{fecha}</p>
                                                    </div>
                                                </div>

                                                {/* Eventos del día - Grid de 2 columnas */}
                                                <div className="ml-0 md:ml-2 grid grid-cols-2 gap-2">
                                                    {eventosDelDia
                                                        .sort((a, b) => a.hora.localeCompare(b.hora))
                                                        .map((evento) => (
                                                        <div
                                                            key={evento.id}
                                                            className="relative bg-gradient-to-br from-negrito-card to-neutral-900/50 border border-white/10 rounded-lg p-2 md:p-3 hover:border-white/20 transition-all"
                                                        >
                                                            {/* Hora */}
                                                            <div 
                                                                className="px-1.5 py-0.5 rounded font-bold text-xs mb-1.5 inline-block"
                                                                style={{ 
                                                                    backgroundColor: `${displayColor}20`,
                                                                    color: displayColor
                                                                }}
                                                            >
                                                                {evento.hora.substring(0, 5)}
                                                            </div>

                                                            {/* Contenido compacto */}
                                                            <div className="space-y-1">
                                                                {/* Título */}
                                                                <h4 className="text-xs md:text-sm font-bold text-white leading-tight line-clamp-2">
                                                                    {evento.tipo_evento}
                                                                </h4>

                                                                {/* Dirección */}
                                                                {evento.direccion_actividad && (
                                                                    <div className="flex items-start gap-1">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: displayColor }}>
                                                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <span className="text-[10px] md:text-xs text-gray-400 leading-tight line-clamp-1">{evento.direccion_actividad}</span>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Oferente */}
                                                                {(evento.tipo_oferente || evento.oferente) && (
                                                                    <div className="text-[10px] md:text-xs text-gray-400 truncate">
                                                                        {evento.tipo_oferente && (
                                                                            <span 
                                                                                className="text-[9px] px-1 py-0.5 rounded font-bold uppercase mr-1"
                                                                                style={{ 
                                                                                    backgroundColor: `${displayColor}15`,
                                                                                    color: displayColor
                                                                                }}
                                                                            >
                                                                                {evento.tipo_oferente}
                                                                            </span>
                                                                        )}
                                                                        {evento.oferente && (
                                                                            <span>{evento.oferente}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Banda */}
                                                                {evento.banda && evento.banda !== 'Ninguna' && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="text-xs">🎵</span>
                                                                        <span className="text-[10px] md:text-xs text-gray-400 truncate">{evento.banda}</span>
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

                                {/* Call to Action - compacto */}
                                <div 
                                    className="text-center p-4 md:p-6 rounded-xl border"
                                    style={{ 
                                        backgroundColor: `${displayColor}10`,
                                        borderColor: `${displayColor}50`
                                    }}
                                >
                                    <p className="text-base md:text-lg font-bold mb-1" style={{ color: displayColor }}>
                                        ¡Únete a nosotros! 🎭
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-300">
                                        Vive la tradición en cada evento
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
