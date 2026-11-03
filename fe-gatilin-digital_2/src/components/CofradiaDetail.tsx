'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  type CofradiaDetalle, type Evento, getEventosByCofradiaId, votarCofradia, quitarVotoCofradia, getEstadoVoto,
  shareUrlCofradia, icsUrl, comoLlegarUrl,
} from '@/services/apis/api-normal';
import CofradesSection from './CofradesSection';
import SeguirButton from './SeguirButton';
import { useAlert } from './AlertContext';
import Cintas from './decor/Cintas';
import Campana from './decor/Campana';
import {
  IconArrowLeft, IconPin, IconShare, IconHeart, IconHeartFilled, IconChevronLeft, IconChevronRight,
  IconMusic, IconCalendar, IconExternal, IconClock, Spinner,
} from './ui/Icons';
import { getDisplayColor, readableTextOn, withAlpha, accentOnDark } from '@/lib/color';

// Función auxiliar para formatear tiempo relativo
const formatRelativeTime = (dateString: string) => {
  try {
    if (!dateString) return 'Fecha desconocida';

    const [datePart, timePart] = dateString.split(' ');
    if (!datePart || !timePart) return dateString;

    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    const updateDate = new Date(year, month - 1, day, hours, minutes, seconds);
    const diffMs = Date.now() - updateDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24 && diffHours >= 0) {
      if (diffHours < 1) return `Hace ${Math.floor(diffMs / (1000 * 60))} min`;
      const h = Math.floor(diffHours);
      return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
};

// dd/mm/yyyy -> timestamp
const fechaToTime = (f: string) => {
  const [d, m, y] = f.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface CofradiaDetailProps {
  detail: CofradiaDetalle;
  onBack: () => void;
  loading?: boolean;
  backLabel?: string;
}

export default function CofradiaDetail({ detail, onBack, loading, backLabel = 'Volver a la lista' }: CofradiaDetailProps) {
  const { showAlert } = useAlert();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [votos, setVotos] = useState(detail.votos || 0);
  const [votando, setVotando] = useState(false);
  const [haVotadoEnEstaSesion, setHaVotadoEnEstaSesion] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>('');

  // Scroll del selector de fechas
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const color = getDisplayColor(detail.color);
  const onColor = readableTextOn(color);
  // Color de la cofradía ajustado para que el texto sea legible sobre el fondo oscuro
  const ink = accentOnDark(color);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  }, []);

  const scroll = React.useCallback((direction: 'left' | 'right') => {
    scrollContainerRef.current?.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  }, []);

  // Fechas únicas ordenadas
  const fechasUnicas = useMemo(
    () => [...new Set(eventos.map((e) => e.fecha))].sort((a, b) => fechaToTime(a) - fechaToTime(b)),
    [eventos]
  );

  // Cargar eventos de la cofradía
  useEffect(() => {
    const fetchEventos = async () => {
      setLoadingEventos(true);
      try {
        const data = await getEventosByCofradiaId(detail.id);
        setEventos(data);

        // Seleccionar el día actual o el primero disponible
        if (data.length > 0) {
          const fechas = [...new Set(data.map((e) => e.fecha))].sort((a, b) => fechaToTime(a) - fechaToTime(b));
          const hoy = new Date();
          const fechaHoy = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
          setDiaSeleccionado(fechas.includes(fechaHoy) ? fechaHoy : fechas[0]);
        }
      } catch (error) {
        console.error('Error cargando eventos:', error);
      } finally {
        setLoadingEventos(false);
      }
    };

    if (detail.id) fetchEventos();
  }, [detail.id]);

  // Listener para scroll
  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, eventos]);

  // ¿Este dispositivo ya votó hoy? (lo decide el servidor, no la sesión del navegador)
  useEffect(() => {
    let activo = true;
    getEstadoVoto(detail.id)
      .then((r) => {
        if (!activo) return;
        setVotos(r.votos);
        setHaVotadoEnEstaSesion(r.yaVotaste);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [detail.id]);

  const handleVotar = async () => {
    if (votando || haVotadoEnEstaSesion) return;
    setVotando(true);
    try {
      const response = await votarCofradia(detail.id);
      setVotos(response.votos);
      setHaVotadoEnEstaSesion(true);
      if (response.message && response.yaVotaste) showAlert('info', response.message);
    } catch (error) {
      showAlert('error', (error as Error).message || 'No se pudo registrar tu voto. Inténtalo nuevamente.');
    } finally {
      setVotando(false);
    }
  };

  const handleQuitarVoto = async () => {
    if (votando || !haVotadoEnEstaSesion) return;
    setVotando(true);
    try {
      const response = await quitarVotoCofradia(detail.id);
      setVotos(response.votos);
      setHaVotadoEnEstaSesion(false);
    } catch (error) {
      showAlert('error', (error as Error).message || 'No se pudo quitar tu voto. Inténtalo nuevamente.');
    } finally {
      setVotando(false);
    }
  };

  const handleCompartir = async () => {
    if (!baseUrl) return;

    // El enlace pasa por el backend para que WhatsApp muestre la vista previa de la cofradía
    const url = shareUrlCofradia(detail);
    const texto = `¡Vota por ${detail.nickname_cofradia}! 🎭✨\n\nApoya a mi cuadrilla favorita en la festividad.`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `Vota por ${detail.nickname_cofradia}`, text: texto, url });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error('Error compartiendo:', error);
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${texto}\n\n${url}`);
        showAlert('success', 'Enlace copiado al portapapeles. ¡Compártelo con tus amigos!');
      } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        showAlert('info', `Comparte este enlace: ${url}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fest pt-8">
        <div className="h-72 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
      </div>
    );
  }

  const eventosDelDia = eventos
    .filter((e) => e.fecha === diaSeleccionado)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // Información general (no se muestra el DNI del representante por protección de datos personales)
  const info = [
    { label: 'Nombre completo', value: detail.nombre_cofradia },
    { label: 'Fundación', value: detail.fecha_fundacion },
    { label: 'Distrito', value: detail.distrito },
    { label: 'Sede local', value: detail.sede_local },
    { label: 'Representante', value: detail.nombre_representante },
    { label: 'Celular', value: detail.cel_representante, href: detail.cel_representante ? `tel:${detail.cel_representante}` : undefined },
  ].filter((i) => i.value);

  return (
    <div
      className="container-fest pt-8 animate-in"
      style={{ '--accent': color, '--on-accent': onColor } as React.CSSProperties}
    >
      {/* Volver */}
      <button
        type="button"
        onClick={onBack}
        className="group mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/25 hover:text-white"
      >
        <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {backLabel}
      </button>

      {/* ===== HÉROE DE LA COFRADÍA ===== */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-20"
          style={{ background: `linear-gradient(135deg, ${withAlpha(color, 0.55)} 0%, ${withAlpha(color, 0.18)} 45%, #120c1a 100%)` }}
        />
        <div aria-hidden className="bordado absolute inset-0 -z-10 opacity-[0.08]" />
        <Cintas className="pointer-events-none absolute -top-1 right-4 h-44 w-20 sm:right-10 sm:h-56 sm:w-28" count={7} />

        <div className="relative px-6 pb-10 pt-10 sm:px-10 sm:pt-14">
          <p className="eyebrow text-white/80">
            <Campana className="w-3.5 h-4" ring="none" />
            Cofradía
          </p>
          <h1 className="mt-3 max-w-3xl pr-20 font-display text-3xl font-semibold leading-[1.05] text-white [overflow-wrap:anywhere] sm:pr-32 sm:text-5xl">
            {detail.nickname_cofradia}
          </h1>
          {(detail.distrito || detail.fecha_fundacion) && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
              {detail.distrito && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 backdrop-blur">
                  <IconPin className="w-3.5 h-3.5" /> {detail.distrito}
                </span>
              )}
              {detail.fecha_fundacion && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 backdrop-blur">
                  <IconCalendar className="w-3.5 h-3.5" /> Fundada: {detail.fecha_fundacion}
                </span>
              )}
            </div>
          )}

          {/* Ubicación en vivo */}
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">¿Dónde están ahora?</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
                <IconClock className="w-4 h-4" />
                Actualizado: <span className="font-semibold text-white">{formatRelativeTime(detail.ubicacion_link_actualizado)}</span>
                {detail.compartiendo && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> EN VIVO
                  </span>
                )}
              </p>
            </div>
            {detail.ubicacion_link ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/sigueteo?vista=mapa&cofradia_mapa=${encodeURIComponent(detail.slug || String(detail.id))}`}
                  className="btn px-6 py-3.5 text-sm sm:text-base hover:-translate-y-0.5"
                  style={{ backgroundColor: color, color: onColor, boxShadow: `0 12px 28px -10px ${withAlpha(color, 0.8)}` }}
                >
                  <IconPin className="w-5 h-5" />
                  Ver en el mapa
                </Link>
                <a
                  href={detail.ubicacion_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost px-5 py-3.5 text-sm"
                >
                  Google Maps
                  <IconExternal className="w-4 h-4 opacity-70" />
                </a>
              </div>
            ) : (
              <span className="text-sm text-white/55">Ubicación aún no disponible</span>
            )}
          </div>
          <div className="mt-3">
            <SeguirButton cofradiaId={detail.id} nombre={detail.nickname_cofradia} color={color} />
          </div>
        </div>
        <div className="plumaje-band" />
      </section>

      {/* ===== CONTENIDO ===== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Columna lateral (primero en móvil) */}
        <aside className="space-y-6 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          {/* Votación */}
          <div className="card-fest overflow-hidden p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Apoya a tu cuadrilla</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <IconHeartFilled className="w-7 h-7" style={{ color: ink }} />
              <span className="font-display text-5xl font-semibold tabular-nums text-white">{votos}</span>
            </div>
            <p className="text-sm text-white/50">{votos === 1 ? 'voto' : 'votos'}</p>

            {!haVotadoEnEstaSesion ? (
              <button
                type="button"
                onClick={handleVotar}
                disabled={votando}
                className="btn mt-5 w-full py-3.5 text-base hover:-translate-y-0.5"
                style={{ backgroundColor: color, color: onColor, boxShadow: `0 10px 24px -10px ${withAlpha(color, 0.8)}` }}
              >
                {votando ? <><Spinner className="w-4 h-4" /> Votando...</> : <><IconHeart className="w-5 h-5" /> ¡Votar!</>}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleQuitarVoto}
                disabled={votando}
                className="btn mt-5 w-full border-2 bg-transparent py-3 text-base"
                style={{ borderColor: ink, color: ink }}
              >
                {votando ? <><Spinner className="w-4 h-4" /> Quitando...</> : 'Quitar voto'}
              </button>
            )}

            <button type="button" onClick={handleCompartir} className="btn btn-ghost mt-3 w-full py-3 text-sm">
              <IconShare className="w-4 h-4" />
              Compartir y pedir votos
            </button>
          </div>

          {/* Información general */}
          {info.length > 0 && (
            <div className="card-fest p-6">
              <h2 className="font-display text-lg font-semibold text-white">Información general</h2>
              <dl className="mt-4 divide-y divide-white/5">
                {info.map((i) => (
                  <div key={i.label} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-white/45">{i.label}</dt>
                    <dd className="text-sm text-white/90 [overflow-wrap:anywhere]">
                      {i.href ? (
                        <a href={i.href} className="hover:underline" style={{ color: ink }}>{i.value}</a>
                      ) : (
                        i.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>

        {/* Columna principal */}
        <div className="min-w-0 space-y-6 lg:order-1">
          {/* Historia */}
          {detail.descripcion && (
            <section className="card-fest relative overflow-hidden p-6 sm:p-8">
              <span aria-hidden className="absolute left-4 top-0 font-display text-8xl leading-none opacity-20" style={{ color: ink }}>“</span>
              <h2 className="eyebrow relative" style={{ color: ink }}>Nuestra historia</h2>
              <p className="relative mt-4 whitespace-pre-line font-display text-lg italic leading-relaxed text-white/85">
                {detail.descripcion}
              </p>
            </section>
          )}

          {/* Cronograma */}
          {(loadingEventos || eventos.length > 0) && (
            <section className="card-fest p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-white">Cronograma</h2>
                {!loadingEventos && (
                  <span className="text-xs text-white/45">{fechasUnicas.length} {fechasUnicas.length === 1 ? 'día' : 'días'}</span>
                )}
              </div>

              {loadingEventos ? (
                <div className="mt-5 space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />)}
                </div>
              ) : (
                <>
                  {/* Selector de días */}
                  <div className="group relative mt-5">
                    {showLeftArrow && (
                      <button
                        type="button"
                        onClick={() => scroll('left')}
                        aria-label="Días anteriores"
                        className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-noche/90 text-white md:grid"
                      >
                        <IconChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    <div ref={scrollContainerRef} className="no-scrollbar -mx-1 overflow-x-auto px-1 pb-1">
                      <div className="flex gap-2">
                        {fechasUnicas.map((fecha) => {
                          const primerEvento = eventos.find((e) => e.fecha === fecha);
                          const [dia, mes] = fecha.split('/');
                          const sel = fecha === diaSeleccionado;
                          return (
                            <button
                              key={fecha}
                              type="button"
                              onClick={() => setDiaSeleccionado(fecha)}
                              aria-pressed={sel}
                              className={`flex w-[92px] shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-all ${
                                sel ? 'border-transparent shadow-lg' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                              }`}
                              style={sel ? { backgroundColor: color, color: onColor } : { color: 'rgba(255,255,255,0.75)' }}
                            >
                              <span className="font-display text-2xl font-semibold leading-none">{dia}</span>
                              <span className="mt-1 text-xs capitalize opacity-80">{MESES[Number(mes) - 1] ?? mes}</span>
                              {primerEvento?.tipo_dia && (
                                <span className="mt-1 w-full truncate text-[10px] font-medium opacity-90">{primerEvento.tipo_dia}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {showRightArrow && (
                      <button
                        type="button"
                        onClick={() => scroll('right')}
                        aria-label="Días siguientes"
                        className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-noche/90 text-white md:grid"
                      >
                        <IconChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Eventos del día */}
                  {eventosDelDia.length > 0 && (
                    <ol className="relative mt-6 space-y-3 border-l border-white/10 pl-5">
                      {eventosDelDia.map((evento) => (
                        <li key={evento.id} className="relative">
                          <span
                            aria-hidden
                            className="absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-noche"
                            style={{ backgroundColor: ink }}
                          />
                          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 transition-colors hover:border-white/15">
                            <div className="flex items-start gap-3">
                              <span
                                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums"
                                style={{ backgroundColor: withAlpha(ink, 0.16), color: ink, boxShadow: `inset 0 0 0 1px ${withAlpha(ink, 0.35)}` }}
                              >
                                {evento.hora.substring(0, 5)}
                              </span>
                              <p className="flex-1 font-semibold leading-snug text-white [overflow-wrap:anywhere]">{evento.tipo_evento}</p>
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-white/60">
                              {evento.direccion_actividad && (
                                <p className="flex items-start gap-1.5">
                                  <IconPin className="mt-px w-3.5 h-3.5 shrink-0" style={{ color: ink }} />
                                  <span className="[overflow-wrap:anywhere]">{evento.direccion_actividad}</span>
                                </p>
                              )}
                              {(evento.tipo_oferente || evento.oferente) && (
                                <p className="[overflow-wrap:anywhere]">
                                  {evento.tipo_oferente && (
                                    <span
                                      className="mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                                      style={{ backgroundColor: withAlpha(ink, 0.16), color: ink, boxShadow: `inset 0 0 0 1px ${withAlpha(ink, 0.3)}` }}
                                    >
                                      {evento.tipo_oferente}
                                    </span>
                                  )}
                                  {evento.oferente}
                                </p>
                              )}
                              {evento.banda && evento.banda !== 'Ninguna' && (
                                <p className="flex items-center gap-1.5">
                                  <IconMusic className="w-3.5 h-3.5 shrink-0" />
                                  {evento.banda}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={icsUrl({ id: evento.id })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:border-white/25 hover:text-white"
                              >
                                <IconCalendar className="h-3.5 w-3.5" /> Agregar a mi calendario
                              </a>
                              {evento.direccion_actividad && (
                                <a
                                  href={comoLlegarUrl(evento.direccion_actividad)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:border-white/25 hover:text-white"
                                >
                                  <IconPin className="h-3.5 w-3.5" /> Cómo llegar
                                </a>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div
                    className="mt-6 rounded-xl border p-4 text-center"
                    style={{ backgroundColor: withAlpha(color, 0.07), borderColor: withAlpha(color, 0.3) }}
                  >
                    <p className="font-display text-lg font-semibold" style={{ color: ink }}>¡Únete a nosotros!</p>
                    <p className="text-sm text-white/65">Vive la tradición en cada evento</p>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ===== Integrantes ===== */}
      <section className="card-fest mt-6 p-5 sm:p-7">
        <CofradesSection cofradiaId={detail.id} cofradiaColor={color} cofradiaNombre={detail.nickname_cofradia} />
      </section>
    </div>
  );
}
