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
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h3
                                        className="text-2xl font-display font-bold uppercase tracking-widest inline-block pb-2 border-b-4"
                                        style={{ color: displayColor, borderColor: displayColor }}
                                    >
                                        🎉 Cronograma de Actividades
                                    </h3>
                                    <p className="text-gray-400">Únete a nosotros en cada evento</p>
                                </div>

                                {loadingEventos ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
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
                                            // Ordenar por fecha (formato dd/MM/yyyy)
                                            const [dayA, monthA, yearA] = dateA.split('/').map(Number);
                                            const [dayB, monthB, yearB] = dateB.split('/').map(Number);
                                            const dateObjA = new Date(yearA, monthA - 1, dayA);
                                            const dateObjB = new Date(yearB, monthB - 1, dayB);
                                            return dateObjA.getTime() - dateObjB.getTime();
                                        })
                                        .map(([fecha, eventosDelDia]) => (
                                            <div key={fecha} className="relative">
                                                {/* Línea temporal vertical */}
                                                <div 
                                                    className="absolute left-8 top-0 bottom-0 w-1 hidden md:block"
                                                    style={{ backgroundColor: `${displayColor}30` }}
                                                />

                                                {/* Header de Fecha */}
                                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                                    <div 
                                                        className="flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg font-bold text-white"
                                                        style={{ backgroundColor: displayColor }}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-2xl leading-none">{fecha.split('/')[0]}</div>
                                                            <div className="text-xs opacity-80">{fecha.split('/')[1]}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-white">{eventosDelDia[0].tipo_dia}</p>
                                                        <p className="text-sm text-gray-500">{fecha}</p>
                                                    </div>
                                                </div>

                                                {/* Eventos del día */}
                                                <div className="md:ml-24 space-y-4">
                                                    {eventosDelDia
                                                        .sort((a, b) => a.hora.localeCompare(b.hora))
                                                        .map((evento) => (
                                                        <div
                                                            key={evento.id}
                                                            className="relative bg-gradient-to-br from-negrito-card to-neutral-900 border border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                                        >
                                                            {/* Hora destacada */}
                                                            <div className="absolute -left-3 top-6 md:left-auto md:-right-3 bg-negrito-bg px-4 py-2 rounded-xl border-2 shadow-lg"
                                                                style={{ borderColor: displayColor }}
                                                            >
                                                                <p className="text-lg font-bold" style={{ color: displayColor }}>
                                                                    {evento.hora.substring(0, 5)}
                                                                </p>
                                                            </div>

                                                            <div className="ml-20 md:ml-0 space-y-4">
                                                                {/* Tipo de evento */}
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-3xl">📍</span>
                                                                    <div className="flex-1">
                                                                        <h4 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">
                                                                            {evento.tipo_evento}
                                                                        </h4>
                                                                        {evento.tipo_dia && (
                                                                            <p className="text-sm text-gray-500 mt-1">
                                                                                {evento.tipo_dia}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Dirección */}
                                                                {evento.direccion_actividad && (
                                                                    <div className="bg-white/5 rounded-xl p-3 flex items-start gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: displayColor }}>
                                                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                                        </svg>
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                                                                            <p className="text-white font-medium">{evento.direccion_actividad}</p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Detalles adicionales */}
                                                                <div className="space-y-2">
                                                                    {/* Oferente */}
                                                                    {(evento.tipo_oferente || evento.oferente) && (
                                                                        <div className="bg-white/5 rounded-xl p-3">
                                                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ofrece</p>
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                {evento.tipo_oferente && (
                                                                                    <span 
                                                                                        className="text-xs px-2 py-1 rounded-full font-bold"
                                                                                        style={{ 
                                                                                            backgroundColor: `${displayColor}20`,
                                                                                            color: displayColor
                                                                                        }}
                                                                                    >
                                                                                        {evento.tipo_oferente}
                                                                                    </span>
                                                                                )}
                                                                                {evento.oferente && (
                                                                                    <span className="text-white font-medium">{evento.oferente}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {/* Banda */}
                                                                    {evento.banda && evento.banda !== 'Ninguna' && (
                                                                        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                                                                            <span className="text-2xl">🎵</span>
                                                                            <div>
                                                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Banda</p>
                                                                                <p className="text-white font-medium">{evento.banda}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Call to Action */}
                                <div 
                                    className="relative overflow-hidden text-center p-8 rounded-2xl border-2"
                                    style={{ 
                                        backgroundColor: `${displayColor}10`,
                                        borderColor: displayColor
                                    }}
                                >
                                    <div className="absolute top-0 right-0 text-9xl opacity-10">🎭</div>
                                    <h4 className="text-2xl font-bold mb-2" style={{ color: displayColor }}>
                                        ¡Ven y Participa!
                                    </h4>
                                    <p className="text-gray-300 max-w-2xl mx-auto">
                                        Únete a nosotros en cada evento y vive la tradición huanuqueña. ¡Te esperamos con los brazos abiertos!
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
