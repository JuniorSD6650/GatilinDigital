'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getAgenda, getCofradiaList, getTiposEvento, icsUrl, comoLlegarUrl, pageUrlCofradia,
  type EventoAgenda, type CofradiaResumen, type FiltrosAgenda,
} from '@/services/apis/api-normal';
import { useFavoritas } from '@/lib/favoritos';
import { getDisplayColor, accentOnDark, withAlpha } from '@/lib/color';
import { exportarTablaPDF } from '@/lib/pdf';
import { useAlert } from '@/components/AlertContext';
import { IconCalendar, IconPin, IconMusic, IconDownload, IconSearch, IconStarFilled, Spinner } from '@/components/ui/Icons';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const etiquetaDia = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} de ${MESES[m - 1]}`;
};
const tipoLegible = (t?: string) => (t && t.toLowerCase() !== 'ninguno' ? t : 'Actividad');

function AgendaContent() {
  const params = useSearchParams();
  const { showAlert } = useAlert();
  const favoritas = useFavoritas();

  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [cofradias, setCofradias] = useState<CofradiaResumen[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState('');
  const [cofradia, setCofradia] = useState(params.get('cofradia') || '');
  const [tipo, setTipo] = useState('');
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    getCofradiaList().then(setCofradias).catch(() => {});
    getTiposEvento().then(setTipos);
  }, []);

  const filtros: FiltrosAgenda = useMemo(
    () => ({ desde: desde || undefined, hasta: hasta || undefined, cod_cofradia: cofradia || undefined, tipo_evento: tipo || undefined, q: qDebounced || undefined }),
    [desde, hasta, cofradia, tipo, qDebounced]
  );

  useEffect(() => {
    let activo = true;
    setCargando(true);
    getAgenda(filtros)
      .then((data) => {
        if (!activo) return;
        setEventos(data);
        setError('');
      })
      .catch(() => activo && setError('No se pudo cargar la agenda. Revisa tu conexión.'))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [filtros]);

  const visibles = useMemo(
    () => (soloFavoritas ? eventos.filter((e) => favoritas.includes(e.cod_cofradia)) : eventos),
    [eventos, soloFavoritas, favoritas]
  );

  const porDia = useMemo(() => {
    const grupos = new Map<string, EventoAgenda[]>();
    visibles.forEach((e) => {
      const k = e.fecha_iso;
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k)!.push(e);
    });
    return [...grupos.entries()];
  }, [visibles]);

  const hoy = hoyISO();

  const descargarPDF = async () => {
    if (visibles.length === 0) return;
    setExportando(true);
    try {
      await exportarTablaPDF({
        titulo: 'Agenda de la Festividad · Negritos de Huánuco',
        columnas: [
          { titulo: 'Fecha', ancho: 12, valor: (e: EventoAgenda) => e.fecha },
          { titulo: 'Hora', ancho: 7, valor: (e) => e.hora?.slice(0, 5) },
          { titulo: 'Cofradía', ancho: 24, valor: (e) => e.nickname_cofradia },
          { titulo: 'Actividad', ancho: 14, valor: (e) => tipoLegible(e.tipo_evento) },
          { titulo: 'Dirección', ancho: 26, valor: (e) => e.direccion_actividad },
          { titulo: 'Oferente', ancho: 17, valor: (e) => e.oferente },
        ],
        filas: visibles,
        archivo: 'agenda-gatilin.pdf',
        horizontal: true,
      });
    } catch {
      showAlert('error', 'No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  const limpiar = () => {
    setDesde(hoyISO());
    setHasta('');
    setCofradia('');
    setTipo('');
    setQ('');
    setSoloFavoritas(false);
  };

  const campo = 'h-10 rounded-xl border border-white/10 bg-noche px-3 text-sm text-white focus:border-white/30 focus:outline-none';

  return (
    <div className="container-fest pb-20 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[#4f86ff]">Cronograma de cofradías</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-white sm:text-4xl">Agenda</h1>
          <p className="mt-1 text-sm text-white/60">Misas, visitas, castillos y recorridos de todas las cofradías, día por día.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={icsUrl({ ...filtros, q: undefined })} className="btn btn-ghost px-4 py-2.5 text-sm" title="Importa estos eventos a Google Calendar, iPhone u Outlook">
            <IconCalendar className="h-4 w-4" /> Agregar al calendario
          </a>
          <button type="button" onClick={descargarPDF} disabled={exportando || visibles.length === 0} className="btn btn-ghost px-4 py-2.5 text-sm disabled:opacity-50">
            {exportando ? <Spinner className="h-4 w-4" /> : <IconDownload className="h-4 w-4" />} PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-fest mt-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_1fr_1.4fr]">
        <label className="flex flex-col gap-1 text-xs text-white/55">
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/55">
          Hasta
          <input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/55">
          Cofradía
          <select value={cofradia} onChange={(e) => setCofradia(e.target.value)} className={campo}>
            <option value="">Todas</option>
            {cofradias.map((c) => <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/55">
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={campo}>
            <option value="">Todos</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/55">
          Buscar
          <span className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Dirección, oferente, banda…" className={`${campo} w-full pl-9`} />
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-5">
          <button type="button" aria-pressed={soloFavoritas} onClick={() => setSoloFavoritas((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium ${soloFavoritas ? 'border-transparent bg-oro text-noche' : 'border-white/10 bg-white/[0.04] text-white/70'}`}>
            <IconStarFilled className="h-3.5 w-3.5" /> Solo mis favoritas
          </button>
          <button type="button" onClick={() => { setDesde(hoy); setHasta(hoy); }} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/70 hover:text-white">
            Hoy
          </button>
          <button type="button" onClick={limpiar} className="ml-auto text-sm text-white/50 hover:text-white">Limpiar filtros</button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">{error}</p>}

      {cargando ? (
        <div className="mt-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />)}</div>
      ) : porDia.length === 0 ? (
        <div className="card-fest mt-6 p-10 text-center">
          <p className="font-semibold text-white">No hay actividades con estos filtros</p>
          <p className="mt-1 text-sm text-white/55">Prueba con otras fechas o quita los filtros.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <p className="text-sm text-white/45">{visibles.length} {visibles.length === 1 ? 'actividad' : 'actividades'}</p>
          {porDia.map(([dia, lista]) => (
            <section key={dia} aria-labelledby={`dia-${dia}`}>
              <h2 id={`dia-${dia}`} className="sticky top-16 z-10 -mx-2 mb-3 flex items-center gap-2 bg-noche/90 px-2 py-2 font-display text-xl font-semibold capitalize text-white backdrop-blur">
                {etiquetaDia(dia)}
                {dia === hoy && <span className="rounded-full bg-oro px-2 py-0.5 font-body text-[11px] font-bold uppercase text-noche">Hoy</span>}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {lista.map((e) => {
                  const color = getDisplayColor(e.color || '#888');
                  const ink = accentOnDark(color);
                  return (
                    <li key={e.id} className="card-fest flex flex-col gap-2 p-4" style={{ borderLeft: `4px solid ${color}` }}>
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 rounded-md px-2 py-0.5 text-sm font-bold tabular-nums"
                          style={{ backgroundColor: withAlpha(ink, 0.16), color: ink }}>
                          {e.hora?.slice(0, 5)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">{tipoLegible(e.tipo_evento)}</p>
                          <Link href={pageUrlCofradia({ id: e.cod_cofradia, slug: e.slug })} className="text-sm hover:underline" style={{ color: ink }}>
                            {favoritas.includes(e.cod_cofradia) && <IconStarFilled className="mr-1 inline h-3 w-3 text-oro" />}
                            {e.nickname_cofradia}
                          </Link>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-white/60">
                        {e.direccion_actividad && <p className="flex items-start gap-1.5"><IconPin className="mt-px h-3.5 w-3.5 shrink-0" />{e.direccion_actividad}</p>}
                        {e.oferente && <p>Oferente: {e.oferente}</p>}
                        {e.banda && e.banda !== 'Ninguna' && <p className="flex items-center gap-1.5"><IconMusic className="h-3.5 w-3.5" />{e.banda}</p>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <a href={icsUrl({ id: e.id })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:text-white">
                          <IconCalendar className="h-3.5 w-3.5" /> Agregar a mi calendario
                        </a>
                        {e.direccion_actividad && (
                          <a href={comoLlegarUrl(e.direccion_actividad)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:text-white">
                            <IconPin className="h-3.5 w-3.5" /> Cómo llegar
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={null}>
      <AgendaContent />
    </Suspense>
  );
}
