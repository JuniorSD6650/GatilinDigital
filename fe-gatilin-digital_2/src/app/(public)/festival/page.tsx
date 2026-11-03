'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import { IconChevronLeft, IconChevronRight, IconPin, IconSearch, IconCalendar, IconX } from '@/components/ui/Icons';
import { getFestivalEventos, type FestivalEvento } from '@/services/apis/api-normal';

const ACCENT = '#4f86ff';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
/** Si una presentación es la última del día, se considera en curso durante este tiempo */
const DURACION_ULTIMA_MIN = 30;

// ---------- Utilidades ----------
const fechaDe = (e: FestivalEvento) => e.fecha.split('T')[0];
const parseFecha = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const minutosDe = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
};
const fechaLarga = (iso: string) =>
  parseFecha(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'el', 'en']);
/** "COFRADÍA DE NEGRITOS NIÑO JESÚS (VÍSPERA)" -> "Cofradía de Negritos Niño Jesús" */
const nombreLegible = (nombre: string) => {
  const sinTipo = nombre.replace(/\s*\((v[íi]spera|presentaci[óo]n|despedida)\)\s*$/i, '').trim();
  if (sinTipo !== sinTipo.toUpperCase()) return sinTipo; // ya viene con mayúsculas y minúsculas
  return sinTipo
    .toLowerCase()
    .split(/\s+/)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
};

const TIPOS: Record<string, { color: string; texto: string }> = {
  víspera: { color: '#b45cf0', texto: '#d3a6f7' },
  presentación: { color: '#4f86ff', texto: '#9dbaff' },
  despedida: { color: '#ff7a1a', texto: '#ffb27a' },
};
const estiloTipo = (t: string) => TIPOS[t.toLowerCase()] ?? { color: '#9ca3af', texto: '#d1d5db' };

const FRANJAS = [
  { id: 'manana', nombre: 'Mañana', desde: 0, hasta: 12 * 60 },
  { id: 'tarde', nombre: 'Tarde', desde: 12 * 60, hasta: 18 * 60 },
  { id: 'noche', nombre: 'Noche', desde: 18 * 60, hasta: 24 * 60 },
];

type Estado = 'en_curso' | 'finalizado' | 'programado';

/**
 * Estado real según la hora: la base guarda "programado" para todas; si el comité
 * marca otro estado, se respeta. Una presentación dura hasta que empieza la siguiente.
 */
const calcularEstados = (delDia: FestivalEvento[], iso: string, ahora: Date): Map<number, Estado> => {
  const m = new Map<number, Estado>();
  const hoy = hoyISO();
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
  delDia.forEach((e, i) => {
    if (e.estado === 'en_curso' || e.estado === 'finalizado') return m.set(e.id, e.estado);
    if (iso < hoy) return m.set(e.id, 'finalizado');
    if (iso > hoy) return m.set(e.id, 'programado');
    const inicio = minutosDe(e.hora_inicio);
    const sig = delDia[i + 1];
    const fin = sig ? minutosDe(sig.hora_inicio) : inicio + DURACION_ULTIMA_MIN;
    m.set(e.id, ahoraMin >= fin ? 'finalizado' : ahoraMin >= inicio ? 'en_curso' : 'programado');
  });
  return m;
};

// ---------- Componentes ----------
function Fila({ e, estado, siguiente, mostrarLugar }: { e: FestivalEvento; estado: Estado; siguiente: boolean; mostrarLugar: boolean }) {
  const tipo = estiloTipo(e.tipo_actividad);
  const enCurso = estado === 'en_curso';
  return (
    <li
      className={`flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 ${enCurso ? 'bg-pluma-verde/[0.08]' : ''} ${
        estado === 'finalizado' ? 'opacity-55' : ''
      }`}
    >
      <time className="w-[4.6rem] shrink-0 font-display text-base font-semibold tabular-nums text-white sm:w-24 sm:text-lg">
        {e.hora_texto}
      </time>
      <span aria-hidden className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: tipo.color }} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-[15px]">
          {nombreLegible(e.nombre_cofradia)}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-white/50">
          <span style={{ color: tipo.texto }}>{e.tipo_actividad}</span>
          {mostrarLugar && (
            <span className="inline-flex items-center gap-1">
              <IconPin className="h-3 w-3" /> {e.lugar}
            </span>
          )}
        </p>
      </div>
      {enCurso ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pluma-verde/15 px-2.5 py-1 text-[11px] font-bold text-[#5ee39b]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pluma-verde opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pluma-verde" />
          </span>
          Ahora
        </span>
      ) : siguiente ? (
        <span className="shrink-0 rounded-full bg-oro px-2.5 py-1 text-[11px] font-bold text-noche">Sigue</span>
      ) : estado === 'finalizado' ? (
        <span className="hidden shrink-0 text-[11px] text-white/40 sm:inline">Terminó</span>
      ) : null}
    </li>
  );
}

function Chip({ activo, onClick, children, color }: { activo: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
        activo ? 'border-transparent bg-[var(--accent)] text-white shadow-md' : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white'
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  );
}

export default function FestivalPage() {
  const [eventos, setEventos] = useState<FestivalEvento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [diaElegido, setDia] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<string | null>(null);
  const [ocultarPasadas, setOcultarPasadas] = useState(false);
  const [ahora, setAhora] = useState(() => new Date());
  const diasRef = useRef<HTMLDivElement>(null);

  // Todo el programa en una sola carga: permite buscar en todos los días a la vez
  useEffect(() => {
    getFestivalEventos()
      .then((data) => setEventos(data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  // Reloj: actualiza "ahora / sigue" cada minuto
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const porDia = useMemo(() => {
    const mapa = new Map<string, FestivalEvento[]>();
    [...eventos]
      .sort((a, b) => fechaDe(a).localeCompare(fechaDe(b)) || minutosDe(a.hora_inicio) - minutosDe(b.hora_inicio))
      .forEach((e) => {
        const k = fechaDe(e);
        if (!mapa.has(k)) mapa.set(k, []);
        mapa.get(k)!.push(e);
      });
    return mapa;
  }, [eventos]);

  const dias = useMemo(() => [...porDia.keys()], [porDia]);
  const hoy = hoyISO();

  // Día mostrado: el elegido, o por defecto hoy / el próximo con presentaciones (o el último si ya terminó)
  const dia = diaElegido || (dias.find((d) => d >= hoy) ?? dias[dias.length - 1] ?? '');

  // Centrar el día seleccionado en la tira (solo desplazamiento horizontal)
  useEffect(() => {
    const c = diasRef.current;
    const el = c?.querySelector<HTMLElement>('[data-selected="true"]');
    if (!c || !el) return;
    const offset = el.getBoundingClientRect().left - c.getBoundingClientRect().left + c.scrollLeft;
    c.scrollTo({ left: offset - (c.clientWidth - el.clientWidth) / 2, behavior: 'smooth' });
  }, [dia, dias.length]);

  const tiposConConteo = useMemo(() => {
    const m = new Map<string, number>();
    eventos.forEach((e) => m.set(e.tipo_actividad, (m.get(e.tipo_actividad) ?? 0) + 1));
    return [...m.entries()];
  }, [eventos]);
  const lugares = useMemo(() => new Set(eventos.map((e) => e.lugar)), [eventos]);
  const variosLugares = lugares.size > 1;
  const totalCofradias = useMemo(() => new Set(eventos.map((e) => normalizar(nombreLegible(e.nombre_cofradia)).replace(/s+/g, " "))).size, [eventos]);

  // ---- Ahora en la plaza (solo si hoy hay festival) ----
  const delHoy = useMemo(() => porDia.get(hoy) ?? [], [porDia, hoy]);
  const estadosHoy = useMemo(() => calcularEstados(delHoy, hoy, ahora), [delHoy, hoy, ahora]);
  const enCursoHoy = delHoy.find((e) => estadosHoy.get(e.id) === 'en_curso');
  const siguienteHoy = delHoy.find((e) => estadosHoy.get(e.id) === 'programado');
  const proximoDia = dias.find((d) => d > hoy);

  // ---- Modo búsqueda (todos los días) ----
  const q = normalizar(busqueda);
  const coincidencias = useMemo(() => {
    if (!q) return [];
    return [...porDia.entries()]
      .map(([d, lista]) => [d, lista.filter((e) => (!tipo || e.tipo_actividad === tipo) && normalizar(e.nombre_cofradia).includes(q))] as const)
      .filter(([, lista]) => lista.length > 0);
  }, [porDia, q, tipo]);
  const totalCoincidencias = coincidencias.reduce((n, [, l]) => n + l.length, 0);

  // ---- Modo día ----
  const delDia = useMemo(() => porDia.get(dia) ?? [], [porDia, dia]);
  const estadosDia = useMemo(() => calcularEstados(delDia, dia, ahora), [delDia, dia, ahora]);
  const siguienteDiaId = dia === hoy ? delDia.find((e) => estadosDia.get(e.id) === 'programado')?.id : undefined;
  const visiblesDia = delDia.filter(
    (e) => (!tipo || e.tipo_actividad === tipo) && !(ocultarPasadas && estadosDia.get(e.id) === 'finalizado')
  );
  const idx = dias.indexOf(dia);

  const irA = (d: string) => {
    setDia(d);
    setBusqueda('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-fest pt-8 pb-16 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Festival"
        title="Festival Oficial"
        description="Cronograma de presentaciones de las cofradías en la plaza: busca a tu cofradía o recorre el programa día por día."
        accent={ACCENT}
      />

      {/* ===== Resumen / Ahora en la plaza ===== */}
      {!cargando && eventos.length > 0 && (
        <section aria-label="Resumen del festival" className="mb-6 grid gap-3 md:grid-cols-[1.6fr_1fr]">
          {delHoy.length > 0 ? (
            <div className="card-fest overflow-hidden p-5">
              <p className="eyebrow text-[#5ee39b]">Hoy en la plaza</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/45">Ahora</p>
                  <p className="mt-1 font-display text-lg font-semibold leading-snug text-white">
                    {enCursoHoy ? nombreLegible(enCursoHoy.nombre_cofradia) : 'Sin presentación en este momento'}
                  </p>
                  {enCursoHoy && <p className="text-sm text-white/55">{enCursoHoy.hora_texto} · {enCursoHoy.tipo_actividad}</p>}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/45">A continuación</p>
                  <p className="mt-1 font-display text-lg font-semibold leading-snug text-white">
                    {siguienteHoy ? nombreLegible(siguienteHoy.nombre_cofradia) : 'Terminaron las presentaciones de hoy'}
                  </p>
                  {siguienteHoy && <p className="text-sm text-oro">{siguienteHoy.hora_texto}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-fest flex flex-col justify-center p-5">
              <p className="eyebrow text-oro">{proximoDia ? 'Próximo día del festival' : 'El festival terminó'}</p>
              <p className="mt-2 font-display text-xl font-semibold text-white first-letter:uppercase">
                {proximoDia ? fechaLarga(proximoDia) : 'Gracias por acompañar a las cofradías'}
              </p>
              {proximoDia && (
                <p className="text-sm text-white/55">
                  {(() => {
                    const n = Math.round((parseFecha(proximoDia).getTime() - parseFecha(hoy).getTime()) / 86_400_000);
                    return n === 1 ? 'Mañana' : `En ${n} días`;
                  })()}{' '}
                  · {porDia.get(proximoDia)?.length} presentaciones
                </p>
              )}
            </div>
          )}
          <dl className="grid grid-cols-3 gap-2">
            {[
              ['Días', dias.length],
              ['Presentaciones', eventos.length],
              ['Cofradías', totalCofradias],
            ].map(([k, v]) => (
              <div key={k} className="card-fest flex flex-col items-center justify-center px-2 py-4 text-center">
                <dd className="font-display text-2xl font-semibold text-white sm:text-3xl">{v}</dd>
                <dt className="mt-0.5 text-[11px] uppercase tracking-wider text-white/45">{k}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ===== Controles ===== */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 space-y-3 border-b border-white/5 bg-noche/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          label="Buscar cofradía en todo el festival"
          placeholder="¿Cuándo se presenta mi cofradía? Escribe su nombre…"
          className="w-full"
        />

        {tiposConConteo.length > 1 && (
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <Chip activo={!tipo} onClick={() => setTipo(null)}>Todas</Chip>
            {tiposConConteo.map(([t, n]) => (
              <Chip key={t} activo={tipo === t} onClick={() => setTipo(tipo === t ? null : t)} color={estiloTipo(t).color}>
                {t} <span className="tabular-nums opacity-60">{n}</span>
              </Chip>
            ))}
          </div>
        )}

        {!q && dias.length > 0 && (
          <div className="relative">
            <div ref={diasRef} className="no-scrollbar flex gap-1.5 overflow-x-auto pt-1.5" role="tablist" aria-label="Días del festival">
              {dias.map((d) => {
                const f = parseFecha(d);
                const sel = d === dia;
                const pasado = d < hoy;
                return (
                  <button
                    key={d}
                    role="tab"
                    aria-selected={sel}
                    data-selected={sel}
                    onClick={() => setDia(d)}
                    className={`relative flex w-[58px] shrink-0 flex-col items-center rounded-xl border px-1 py-1.5 transition-all ${
                      sel
                        ? 'border-transparent bg-[var(--accent)] text-white shadow-[0_8px_24px_-8px_var(--accent)]'
                        : `border-white/10 bg-white/[0.03] hover:border-white/25 hover:text-white ${pasado ? 'text-white/35' : 'text-white/70'}`
                    }`}
                  >
                    {d === hoy && (
                      <span className="absolute -top-1.5 rounded-full bg-oro px-1.5 text-[9px] font-bold uppercase leading-4 text-noche">Hoy</span>
                    )}
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{DIAS[f.getDay()]}</span>
                    <span className="font-display text-xl font-semibold leading-tight">{f.getDate()}</span>
                    <span className="text-[10px] opacity-75">
                      {MESES[f.getMonth()]} · {porDia.get(d)?.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Contenido ===== */}
      {cargando ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={<IconCalendar className="w-6 h-6" />} title="No se pudo cargar el programa" description="Revisa tu conexión e intenta de nuevo." />
      ) : eventos.length === 0 ? (
        <EmptyState icon={<IconCalendar className="w-6 h-6" />} title="Programa aún no publicado" description="El cronograma del festival se publicará pronto." />
      ) : q ? (
        /* --- Resultados de búsqueda en todos los días --- */
        totalCoincidencias === 0 ? (
          <EmptyState
            icon={<IconSearch className="w-6 h-6" />}
            title={`No se encontró “${busqueda}”`}
            description="Revisa el nombre o prueba con una palabra clave (por ejemplo: “Rosavero”, “Huallayco”)."
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-white/60">
                <strong className="text-white">{totalCoincidencias}</strong> {totalCoincidencias === 1 ? 'presentación' : 'presentaciones'} en{' '}
                <strong className="text-white">{coincidencias.length}</strong> {coincidencias.length === 1 ? 'día' : 'días'}
              </p>
              <button type="button" onClick={() => setBusqueda('')} className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white">
                <IconX className="h-3.5 w-3.5" /> Limpiar búsqueda
              </button>
            </div>
            {coincidencias.map(([d, lista]) => {
              const est = calcularEstados(porDia.get(d) ?? [], d, ahora);
              return (
                <section key={d} aria-label={fechaLarga(d)}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold text-white first-letter:uppercase">
                      {fechaLarga(d)}
                      {d === hoy && <span className="ml-2 rounded-full bg-oro px-2 py-0.5 align-middle font-body text-[10px] font-bold uppercase text-noche">Hoy</span>}
                    </h2>
                    <button type="button" onClick={() => irA(d)} className="shrink-0 text-xs font-semibold text-[var(--accent)] hover:underline">
                      Ver día completo
                    </button>
                  </div>
                  <ul className="card-fest divide-y divide-white/5 overflow-hidden">
                    {lista.map((e) => (
                      <Fila key={e.id} e={e} estado={est.get(e.id) ?? 'programado'} siguiente={false} mostrarLugar={variosLugares} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )
      ) : (
        /* --- Programa del día, por franjas --- */
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white first-letter:uppercase sm:text-3xl">{dia && fechaLarga(dia)}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/55">
                <span>
                  {visiblesDia.length} {visiblesDia.length === 1 ? 'presentación' : 'presentaciones'}
                </span>
                {!variosLugares && lugares.size === 1 && (
                  <span className="inline-flex items-center gap-1">
                    <IconPin className="h-3.5 w-3.5" /> Todas en {[...lugares][0]}
                  </span>
                )}
              </p>
            </div>
            {dia === hoy && (
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/65">
                <input type="checkbox" checked={ocultarPasadas} onChange={(e) => setOcultarPasadas(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                Ocultar las que ya pasaron
              </label>
            )}
          </div>

          {visiblesDia.length === 0 ? (
            <EmptyState
              icon={<IconCalendar className="w-6 h-6" />}
              title="Nada que mostrar"
              description={tipo ? `No hay presentaciones de tipo “${tipo}” este día.` : 'Ya pasaron todas las presentaciones de hoy.'}
            />
          ) : (
            <div className="space-y-5">
              {FRANJAS.map((fr) => {
                const lista = visiblesDia.filter((e) => {
                  const m = minutosDe(e.hora_inicio);
                  return m >= fr.desde && m < fr.hasta;
                });
                if (lista.length === 0) return null;
                return (
                  <section key={fr.id} aria-labelledby={`franja-${fr.id}`}>
                    <h3 id={`franja-${fr.id}`} className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                      {fr.nombre}
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="tabular-nums tracking-normal">{lista.length}</span>
                    </h3>
                    <ul className="card-fest divide-y divide-white/5 overflow-hidden">
                      {lista.map((e) => (
                        <Fila
                          key={e.id}
                          e={e}
                          estado={estadosDia.get(e.id) ?? 'programado'}
                          siguiente={e.id === siguienteDiaId}
                          mostrarLugar={variosLugares}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}

          {/* Navegación entre días */}
          <nav aria-label="Cambiar de día" className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={idx <= 0}
              onClick={() => irA(dias[idx - 1])}
              className="btn btn-ghost px-4 py-2.5 text-sm capitalize disabled:invisible"
            >
              <IconChevronLeft className="h-4 w-4" /> {idx > 0 && fechaLarga(dias[idx - 1]).split(',')[0]}
            </button>
            <button
              type="button"
              disabled={idx < 0 || idx >= dias.length - 1}
              onClick={() => irA(dias[idx + 1])}
              className="btn btn-ghost px-4 py-2.5 text-sm capitalize disabled:invisible"
            >
              {idx >= 0 && idx < dias.length - 1 && fechaLarga(dias[idx + 1]).split(',')[0]} <IconChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
