'use client';

import { useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import { IconChevronLeft, IconChevronRight, IconPin, IconSearch, IconCalendar } from '@/components/ui/Icons';
import { getFestivalEventos, getFestivalDias, type FestivalEvento } from '@/services/apis/api-normal';

const ACCENT = '#4f86ff';

// Función para extraer solo la fecha en formato YYYY-MM-DD
const extractDate = (isoString: string): string => isoString.split('T')[0];

const parseFecha = (fechaStr: string) => {
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Día actual o el más cercano a hoy
const getDefaultDay = (fechas: string[]): string => {
  if (fechas.length === 0) return '';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  for (const fecha of fechas) {
    if (parseFecha(fecha).getTime() >= hoy.getTime()) return fecha;
  }
  // Si todos los días ya pasaron, devolver el último
  return fechas[fechas.length - 1];
};

const formatFechaCorta = (fechaStr: string) => {
  const fecha = parseFecha(fechaStr);
  return {
    diaSemana: fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '').toUpperCase(),
    dia: fechaStr.split('-')[2],
    mes: fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', ''),
  };
};

const formatFechaCompleta = (fechaStr: string) =>
  parseFecha(fechaStr).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const isToday = (fechaStr: string) => {
  const hoy = new Date();
  const f = parseFecha(fechaStr);
  return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
};

const getActividadBadge = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case 'víspera':
      return { dot: '#b45cf0', className: 'bg-pluma-violeta/15 text-[#d3a6f7] border-pluma-violeta/30' };
    case 'presentación':
      return { dot: '#4f86ff', className: 'bg-pluma-azul/15 text-[#9dbaff] border-pluma-azul/30' };
    case 'despedida':
      return { dot: '#ff7a1a', className: 'bg-pluma-naranja/15 text-[#ffb27a] border-pluma-naranja/30' };
    default:
      return { dot: '#9ca3af', className: 'bg-white/5 text-white/70 border-white/15' };
  }
};

const ESTADOS: Record<string, { label: string; className: string; live?: boolean }> = {
  en_curso: { label: 'En vivo', className: 'bg-pluma-verde/15 text-[#5ee39b]', live: true },
  finalizado: { label: 'Finalizado', className: 'bg-white/5 text-white/45' },
  programado: { label: 'Programado', className: 'bg-pluma-azul/10 text-[#9dbaff]' },
};

export default function FestivalPage() {
  const [eventos, setEventos] = useState<FestivalEvento[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const diasRef = useRef<HTMLDivElement>(null);

  // Cargar días disponibles
  useEffect(() => {
    const fetchDias = async () => {
      try {
        const data = await getFestivalDias();
        const fechasLimpias = data.map((d) => extractDate(d.fecha));
        setDias(fechasLimpias);
        if (fechasLimpias.length > 0) {
          setSelectedFecha(getDefaultDay(fechasLimpias));
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error cargando días:', error);
        setLoading(false);
      }
    };
    fetchDias();
  }, []);

  // Cargar eventos cuando cambia la fecha
  useEffect(() => {
    const fetchEventos = async () => {
      if (!selectedFecha) return;
      setLoading(true);
      try {
        const data = await getFestivalEventos(selectedFecha);
        setEventos(data);
      } catch (error) {
        console.error('Error cargando eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [selectedFecha]);

  // Centrar el día seleccionado en el carrusel
  useEffect(() => {
    // (solo desplazamiento horizontal: scrollIntoView movería también la página)
    const c = diasRef.current;
    const el = c?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!c || !el) return;
    const offset = el.getBoundingClientRect().left - c.getBoundingClientRect().left + c.scrollLeft;
    c.scrollTo({ left: offset - (c.clientWidth - el.clientWidth) / 2, behavior: 'smooth' });
  }, [selectedFecha, dias]);

  const scrollDias = (dir: -1 | 1) => diasRef.current?.scrollBy({ left: 220 * dir, behavior: 'smooth' });

  // Filtrar eventos por búsqueda
  const eventosFiltrados = eventos.filter((evento) =>
    evento.nombre_cofradia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Próximo = primer evento que aún no ha finalizado
  const proximoId = eventosFiltrados.find((e) => e.estado !== 'finalizado')?.id;

  return (
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Festival"
        title="Festival Oficial"
        description="Cronograma completo de presentaciones de las cofradías, día por día."
        accent={ACCENT}
      />

      {/* ===== Controles ===== */}
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-b border-white/5 bg-noche/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollDias(-1)}
            aria-label="Días anteriores"
            className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-noche text-white hover:border-[var(--accent)] md:grid"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>

          <div ref={diasRef} className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth pt-2 md:px-11" role="tablist" aria-label="Días del festival">
            {dias.map((dia) => {
              const f = formatFechaCorta(dia);
              const esHoy = isToday(dia);
              const seleccionado = selectedFecha === dia;
              return (
                <button
                  key={dia}
                  role="tab"
                  aria-selected={seleccionado}
                  data-selected={seleccionado}
                  onClick={() => setSelectedFecha(dia)}
                  className={`relative flex w-[68px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition-all ${
                    seleccionado
                      ? 'border-transparent bg-[var(--accent)] text-white shadow-[0_8px_24px_-8px_var(--accent)]'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {esHoy && (
                    <span className="absolute -top-1.5 rounded-full bg-oro px-1.5 text-[9px] font-bold uppercase leading-4 text-noche">Hoy</span>
                  )}
                  <span className="text-[10px] font-semibold tracking-wider opacity-80">{f.diaSemana}</span>
                  <span className="font-display text-2xl font-semibold leading-tight">{f.dia}</span>
                  <span className="text-[11px] capitalize opacity-80">{f.mes}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollDias(1)}
            aria-label="Días siguientes"
            className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-noche text-white hover:border-[var(--accent)] md:grid"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>

        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar cofradía..." className="mx-auto mt-4 max-w-md" />
      </div>

      {/* ===== Fecha seleccionada ===== */}
      {selectedFecha && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white first-letter:uppercase">
            {formatFechaCompleta(selectedFecha)}
          </h2>
          {!loading && (
            <span className="text-sm text-white/50">
              {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'presentación' : 'presentaciones'}
            </span>
          )}
        </div>
      )}

      {/* ===== Lista de eventos ===== */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : eventosFiltrados.length > 0 ? (
        <ol className="relative space-y-3">
          {eventosFiltrados.map((evento) => {
            const badge = getActividadBadge(evento.tipo_actividad);
            const estado = ESTADOS[evento.estado] ?? ESTADOS.programado;
            const isProximo = evento.id === proximoId;
            const finalizado = evento.estado === 'finalizado';

            return (
              <li
                key={evento.id}
                className={`card-fest flex gap-4 p-4 transition-all duration-300 hover:border-white/20 sm:gap-6 sm:p-5 ${
                  isProximo ? '!border-[var(--accent)]/60 shadow-[0_10px_40px_-20px_var(--accent)]' : ''
                } ${finalizado ? 'opacity-70' : ''}`}
              >
                {/* Hora */}
                <div
                  className={`flex w-[86px] shrink-0 flex-col items-center justify-center rounded-xl px-1.5 py-3 text-center sm:w-28 ${
                    isProximo ? 'bg-[var(--accent)] text-white' : 'bg-white/[0.05] text-white/85'
                  }`}
                >
                  <span className="whitespace-nowrap font-display text-base font-semibold leading-tight sm:text-xl">{evento.hora_texto}</span>
                </div>

                {/* Información */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: badge.dot }} />
                      {evento.tipo_actividad}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.className}`}>
                      {estado.live && (
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pluma-verde opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-pluma-verde" />
                        </span>
                      )}
                      {estado.label}
                    </span>
                    {isProximo && (
                      <span className="rounded-full bg-oro px-2.5 py-0.5 text-xs font-bold text-noche">Próximo</span>
                    )}
                  </div>

                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-xl line-clamp-3">
                    {evento.nombre_cofradia}
                  </h3>

                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/55">
                    <IconPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{evento.lugar}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : searchTerm ? (
        <EmptyState
          icon={<IconSearch className="w-6 h-6" />}
          title={`No se encontró “${searchTerm}”`}
          description="No hay presentaciones que coincidan con tu búsqueda. Intenta con otro nombre."
        />
      ) : (
        <EmptyState
          icon={<IconCalendar className="w-6 h-6" />}
          title="No hay eventos programados"
          description={dias.length ? 'Selecciona otro día para ver las presentaciones disponibles.' : 'El cronograma del festival se publicará pronto.'}
        />
      )}
    </div>
  );
}
