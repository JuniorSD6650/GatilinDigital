'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import CofradiaDetail from '@/components/CofradiaDetail';
import AgendaPanel from '@/components/agenda/AgendaPanel';
import { IconPin, IconSearch, IconCalendar, IconX } from '@/components/ui/Icons';
import { getCofradiaList, getCofradiaDetail, type CofradiaResumen, type CofradiaDetalle } from '@/services/apis/api-normal';
import { getDisplayColor, accentOnDark } from '@/lib/color';

const ACCENT = '#12c7e6';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type Orden = 'az' | 'votos' | 'recientes';
type Vista = 'cofradias' | 'agenda';

// --- Utilidades de filtrado ---
/** Minúsculas y sin tildes: "Huánuco" y "huanuco" coinciden */
const normalizar = (s?: string | null) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** "La Esperanza, Amarilis" -> ["La Esperanza", "Amarilis"] */
const zonasDe = (c: CofradiaResumen) =>
  (c.distrito ?? '')
    .split(/[,/]| - /)
    .map((z) => z.trim())
    .filter(Boolean);

const fechaToTime = (f: string) => {
  const [d, m, y] = f.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
};

const hoyDDMMYYYY = () => {
  const h = new Date();
  return `${String(h.getDate()).padStart(2, '0')}/${String(h.getMonth() + 1).padStart(2, '0')}/${h.getFullYear()}`;
};

const etiquetaFecha = (f: string) => {
  const [d, m] = f.split('/');
  return `${Number(d)} ${MESES[Number(m) - 1] ?? m}`;
};

/** ¿La ubicación en vivo se actualizó hace menos de 3 horas? */
const ubicacionReciente = (c: CofradiaResumen) => {
  if (!c.tiene_ubicacion || !c.ubicacion_link_actualizado) return false;
  const [fecha, hora] = c.ubicacion_link_actualizado.split(' ');
  const [d, m, y] = fecha.split('/').map(Number);
  const [hh, mm] = (hora ?? '0:0').split(':').map(Number);
  const t = new Date(y, m - 1, d, hh, mm).getTime();
  return Date.now() - t < 3 * 60 * 60 * 1000;
};

// Escucha el query param ?cofradia=ID (siempre montado, solo reacciona a cambios de la URL)
function QueryParamHandler({ onCofradiaSelect }: { onCofradiaSelect: (id: number) => void }) {
  const searchParams = useSearchParams();
  // Último valor procesado: evita reabrir el detalle con una URL aún no actualizada
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    const cofradiaId = searchParams.get('cofradia');
    if (cofradiaId === lastHandled.current) return;
    lastHandled.current = cofradiaId;
    if (cofradiaId) {
      const id = parseInt(cofradiaId, 10);
      if (!isNaN(id)) onCofradiaSelect(id);
    }
  }, [searchParams, onCofradiaSelect]);

  return null;
}

/** Chip de filtro reutilizable */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'border-transparent bg-[var(--accent)] text-noche shadow-md'
          : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function SigueteoContent() {
  // --- ESTADOS GLOBALES ---
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- ESTADOS DE LISTA ---
  const [list, setList] = useState<CofradiaResumen[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [zona, setZona] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [soloEnVivo, setSoloEnVivo] = useState(false);
  const [orden, setOrden] = useState<Orden>('az');

  // --- ESTADOS DE DETALLE ---
  const [detail, setDetail] = useState<CofradiaDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const router = useRouter();

  // --- PESTAÑAS: Cofradías | Agenda (?vista=agenda) ---
  const searchParams = useSearchParams();
  const vista: Vista = searchParams.get('vista') === 'agenda' ? 'agenda' : 'cofradias';
  const cofradiaAgenda = searchParams.get('cofradia_agenda') ?? '';
  const cambiarVista = (v: Vista) => router.replace(v === 'agenda' ? '/sigueteo?vista=agenda' : '/sigueteo', { scroll: false });

  // 1. Cargar lista
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getCofradiaList();
        setList(data);
      } catch (error) {
        console.error('Error al cargar lista:', error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // Selección desde query param (enlace compartido)
  const handleCofradiaFromQuery = useCallback((id: number) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setView('DETAIL');
  }, []);

  // 2. Opciones de filtros a partir de los datos
  const zonas = useMemo(() => {
    const mapa = new Map<string, { nombre: string; total: number }>();
    list.forEach((c) =>
      zonasDe(c).forEach((z) => {
        const k = normalizar(z);
        const prev = mapa.get(k);
        mapa.set(k, { nombre: prev?.nombre ?? z, total: (prev?.total ?? 0) + 1 });
      })
    );
    return [...mapa.entries()].sort((a, b) => b[1].total - a[1].total).map(([k, v]) => ({ key: k, ...v }));
  }, [list]);

  const fechas = useMemo(() => {
    const set = new Set<string>();
    list.forEach((c) => c.actividades?.forEach((a) => set.add(a.fecha)));
    return [...set].sort((a, b) => fechaToTime(a) - fechaToTime(b));
  }, [list]);

  const hoy = hoyDDMMYYYY();
  const hayActividadHoy = fechas.includes(hoy);
  const hayEnVivo = list.some((c) => c.tiene_ubicacion);

  // 3. Filtrar y ordenar
  const q = normalizar(searchTerm);
  const resultados = useMemo(() => {
    const items = list
      .map((c) => {
        const actividades = (c.actividades ?? []).filter((a) => !fecha || a.fecha === fecha);

        if (zona && !zonasDe(c).some((z) => normalizar(z) === zona)) return null;
        if (fecha && actividades.length === 0) return null;
        if (soloEnVivo && !c.tiene_ubicacion) return null;

        // Coincidencia de texto: nombre, nombre completo, distrito, sede o calles por donde pasa
        let coincidencia: string | null = null;
        if (q) {
          const enDatos = [c.nickname_cofradia, c.nombre_cofradia, c.distrito, c.sede_local].some((v) =>
            normalizar(v).includes(q)
          );
          if (!enDatos) {
            const act = actividades.find((a) => normalizar(a.direccion).includes(q));
            if (!act) return null;
            coincidencia = `${fecha ? '' : `${etiquetaFecha(act.fecha)} · `}${act.direccion}`;
          }
        }

        return { c, coincidencia, actividadesDia: fecha ? actividades : [] };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    items.sort((a, b) => {
      if (orden === 'votos') return (b.c.votos ?? 0) - (a.c.votos ?? 0);
      if (orden === 'recientes') return Number(ubicacionReciente(b.c)) - Number(ubicacionReciente(a.c)) || a.c.nickname_cofradia.localeCompare(b.c.nickname_cofradia);
      return a.c.nickname_cofradia.localeCompare(b.c.nickname_cofradia);
    });
    return items;
  }, [list, q, zona, fecha, soloEnVivo, orden]);

  const filtrosActivos = Boolean(searchTerm || zona || fecha || soloEnVivo);
  const limpiarFiltros = () => {
    setSearchTerm('');
    setZona(null);
    setFecha(null);
    setSoloEnVivo(false);
  };

  // 4. Cargar detalle al seleccionar
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null);
      try {
        const data = await getCofradiaDetail(selectedId);
        setDetail(data);
      } catch (error) {
        console.error('Error cargando detalle:', error);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedId]);

  // --- HANDLERS ---
  const handleSelectCofradia = (id: number) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setView('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    // Limpiar query params de la URL (los filtros se conservan)
    router.push('/sigueteo', { scroll: false });
    setSelectedId(null);
    setView('LIST');
    setDetail(null);
  };

  const queryHandler = (
    <Suspense fallback={null}>
      <QueryParamHandler onCofradiaSelect={handleCofradiaFromQuery} />
    </Suspense>
  );

  // ==========================================
  // VISTA: DETALLE
  // ==========================================
  if (view === 'DETAIL' && (detail || loadingDetail)) {
    return (
      <>
        {queryHandler}
        {detail ? (
          <CofradiaDetail detail={detail} onBack={handleBackToList} loading={loadingDetail} />
        ) : (
          <div className="container-fest pt-8">
            <div className="h-9 w-40 animate-pulse rounded-full bg-white/5" />
            <div className="mt-6 h-72 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="h-64 animate-pulse rounded-3xl bg-white/[0.04]" />
              <div className="h-64 animate-pulse rounded-3xl bg-white/[0.04]" />
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // VISTA: LISTA (Default)
  // ==========================================
  // queryHandler va en la misma posición (1er hijo del fragmento) que en la vista
  // de detalle, para que React lo mantenga montado al cambiar de vista.
  return (
    <>
    {queryHandler}
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Sigueteo"
        title="Sigue a tu cofradía"
        description="Encuentra a tu cofradía favorita, mira dónde está ahora y consulta su agenda de actividades."
        accent={ACCENT}
      />

      {/* ===== Pestañas ===== */}
      <div role="tablist" aria-label="Sigueteo" className="mb-6 inline-flex w-full rounded-2xl border border-white/10 bg-white/[0.03] p-1 sm:w-auto">
        {([
          ['cofradias', 'Cofradías', <IconPin key="i" className="h-4 w-4" />],
          ['agenda', 'Agenda', <IconCalendar key="i" className="h-4 w-4" />],
        ] as const).map(([v, texto, icono]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => cambiarVista(v)}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all sm:flex-none ${
              vista === v ? 'bg-[var(--accent)] text-noche shadow-md' : 'text-white/65 hover:text-white'
            }`}
          >
            {icono} {texto}
          </button>
        ))}
      </div>

      {vista === 'agenda' ? (
        <AgendaPanel key={cofradiaAgenda} cofradiaInicial={cofradiaAgenda} />
      ) : (
      <>
      {/* ===== Filtros ===== */}
      <section aria-label="Filtros de búsqueda" className="card-fest mb-8 space-y-4 p-4 sm:p-5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          label="Buscar cofradía, distrito o calle"
          placeholder="Busca por nombre, distrito, sede o calle (ej. Jr. Huallayco)"
          className="w-full"
        />

        {/* Zona */}
        {zonas.length > 1 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <IconPin className="h-3.5 w-3.5" /> Zona
            </p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
              <Chip active={!zona} onClick={() => setZona(null)}>Todas</Chip>
              {zonas.map((z) => (
                <Chip key={z.key} active={zona === z.key} onClick={() => setZona(zona === z.key ? null : z.key)}>
                  {z.nombre} <span className="tabular-nums opacity-60">{z.total}</span>
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {/* Día de actividad */}
          {fechas.length > 0 && (
            <label className="flex min-w-0 flex-col gap-2 sm:w-56">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                <IconCalendar className="h-3.5 w-3.5" /> Sale el día
              </span>
              <select
                value={fecha ?? ''}
                onChange={(e) => setFecha(e.target.value || null)}
                className="field-input !py-2 text-sm"
              >
                <option value="">Cualquier día</option>
                {fechas.map((f) => (
                  <option key={f} value={f}>
                    {f === hoy ? `Hoy (${etiquetaFecha(f)})` : etiquetaFecha(f)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-2 sm:w-48">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Ordenar por</span>
            <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="field-input !py-2 text-sm">
              <option value="az">Nombre (A–Z)</option>
              <option value="votos">Más votadas</option>
              <option value="recientes">Ubicación más reciente</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-2 sm:pb-0.5">
            {hayActividadHoy && (
              <Chip active={fecha === hoy} onClick={() => setFecha(fecha === hoy ? null : hoy)}>
                Salen hoy
              </Chip>
            )}
            {hayEnVivo && (
              <Chip active={soloEnVivo} onClick={() => setSoloEnVivo(!soloEnVivo)}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Con ubicación
              </Chip>
            )}
          </div>
        </div>

        {/* Resumen */}
        {!loadingList && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
            <p className="text-sm text-white/55">
              {resultados.length} {resultados.length === 1 ? 'cofradía' : 'cofradías'}
              {fecha && <> · salen el {fecha === hoy ? 'día de hoy' : etiquetaFecha(fecha)}</>}
            </p>
            {filtrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                <IconX className="h-3.5 w-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        )}
      </section>

      {/* ===== Tarjetas: 2 por fila en celular, hasta 5 en pantallas anchas ===== */}
      {loadingList ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-[1.25rem] border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : resultados.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {resultados.map(({ c, coincidencia, actividadesDia }, i) => {
            const color = getDisplayColor(c.color);
            const ink = accentOnDark(color);
            const enVivo = ubicacionReciente(c);
            const zonas = zonasDe(c);
            // "Negritos Barrio San Juan" -> eyebrow "Negritos" + nombre "Barrio San Juan"
            const m = c.nickname_cofradia.match(/^(negritos?|cofrad[ií]a)\s+(.+)$/i);
            const prefijo = m?.[1] ?? 'Cofradía';
            const nombre = m?.[2] ?? c.nickname_cofradia;
            return (
              <li key={c.id} className="animate-in" style={{ animationDelay: `${Math.min(i, 15) * 30}ms` }}>
                <button
                  type="button"
                  onClick={() => handleSelectCofradia(c.id)}
                  aria-label={`Ver ${c.nickname_cofradia}`}
                  className="group card-fest relative flex h-full w-full flex-col overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--c)]/60 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c)]"
                  style={{ '--c': color } as React.CSSProperties}
                >
                  {/* Franja con el color de la cofradía */}
                  <span aria-hidden className="h-1.5 w-full shrink-0" style={{ backgroundColor: color }} />
                  <span
                    aria-hidden
                    className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                    style={{ backgroundColor: color }}
                  />

                  <span className="relative flex flex-1 flex-col p-3.5 sm:p-4">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: ink }}>
                        {prefijo}
                      </span>
                      {enVivo && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-noche">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-noche" />
                          En vivo
                        </span>
                      )}
                    </span>

                    <span className="mt-1.5 line-clamp-3 font-display text-[15px] font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-base">
                      {nombre}
                    </span>

                    {/* Zona: si no está registrada se muestra "Huánuco" (general) para no dejarlo vacío */}
                    <span
                      className="mt-auto flex items-center gap-1 pt-3 text-xs text-white/55"
                      title={zonas.length ? undefined : 'Distrito no especificado: Huánuco en general'}
                    >
                      <IconPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{zonas.length ? zonas.join(' · ') : 'Huánuco'}</span>
                    </span>

                    {orden === 'votos' && typeof c.votos === 'number' && (
                      <span className="mt-1.5 text-xs font-semibold tabular-nums" style={{ color: ink }}>
                        {c.votos} {c.votos === 1 ? 'voto' : 'votos'}
                      </span>
                    )}
                    {coincidencia && (
                      <span className="mt-2 line-clamp-2 rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] leading-snug text-white/70">
                        Pasa por: {coincidencia}
                      </span>
                    )}
                    {!coincidencia && actividadesDia.length > 0 && (
                      <span className="mt-1.5 text-[11px] text-white/50">
                        {actividadesDia.length} {actividadesDia.length === 1 ? 'parada' : 'paradas'} ese día
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<IconSearch className="w-6 h-6" />}
          title={filtrosActivos ? 'Sin resultados' : 'Aún no hay cofradías'}
          description={
            filtrosActivos
              ? 'Ninguna cofradía coincide con esos filtros. Prueba con otra zona, otro día o limpia los filtros.'
              : 'Vuelve pronto para seguir a las cofradías.'
          }
        />
      )}
      </>
      )}
    </div>
    </>
  );
}

export default function SigueteoPage() {
  return (
    <Suspense
      fallback={
        <div className="container-fest pt-8">
          <div className="h-72 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
        </div>
      }
    >
      <SigueteoContent />
    </Suspense>
  );
}
