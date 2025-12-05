'use client';

import { type CofradiaDetalle } from '@/services/apis/api-normal';

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
    // Fix para color negro: usar #FF007F si es #000 o #000000
    const displayColor = (detail.color === '#000' || detail.color === '#000000' || !detail.color) 
        ? '#FF007F' 
        : detail.color;

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
            </div>
        </div>
    );
}
