'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import Panuelo, { PANUELO_CLIP } from '@/components/ui/Panuelo';
import CofradiaDetail from '@/components/CofradiaDetail';
import { IconPin, IconSearch, IconCalendar, IconX } from '@/components/ui/Icons';
import { getCofradiaList, getCofradiaDetail, type CofradiaResumen, type CofradiaDetalle } from '@/services/apis/api-normal';
import { getDisplayColor, accentOnDark, readableTextOn } from '@/lib/color';

const ACCENT = '#12c7e6';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type Orden = 'az' | 'votos' | 'recientes';

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
        description="Encuentra a tu cofradía favorita, mira dónde está ahora y acompáñala en su recorrido."
        accent={ACCENT}
      />

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

      {/* ===== Pañuelos (2 por fila: el nombre va dentro y la forma es el botón) ===== */}
      {loadingList ? (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mx-auto aspect-square w-full max-w-[360px] p-[12%]">
              <div className="h-full w-full rotate-45 animate-pulse rounded-[12%] bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : resultados.length > 0 ? (
        <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-8">
          {resultados.map(({ c, coincidencia, actividadesDia }, i) => {
            const color = getDisplayColor(c.color);
            const ink = accentOnDark(color);
            const onColor = readableTextOn(color);
            const sombraTexto = onColor === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.55)' : '0 1px 2px rgba(255,255,255,0.35)';
            const enVivo = ubicacionReciente(c);
            // "Negritos Barrio San Juan" -> eyebrow "Negritos" + nombre "Barrio San Juan"
            const m = c.nickname_cofradia.match(/^(negritos?|cofrad[ií]a)\s+(.+)$/i);
            const prefijo = m?.[1];
            const nombre = m?.[2] ?? c.nickname_cofradia;
            return (
              <li key={c.id} className="flex flex-col items-center animate-in" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
                {/* Contenedor: no recibe clics; solo el rombo (botón recortado) es interactivo */}
                <div className="group pointer-events-none relative aspect-square w-full max-w-[360px] [container-type:inline-size]">
                  <div className="panuelo-sway absolute inset-0 origin-top transition-transform duration-300 group-hover:scale-[1.03] group-focus-within:scale-[1.03]">
                    <span
                      aria-hidden
                      className="absolute inset-[22%] rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                      style={{ backgroundColor: color }}
                    />
                    <Panuelo color={color} pliegue={false} className="relative h-full w-full" />

                    {/* Nombre centrado dentro del pañuelo */}
                    <div
                      aria-hidden
                      className="absolute inset-x-[15%] inset-y-[29%] flex flex-col items-center justify-center text-center"
                      style={{ color: onColor, textShadow: sombraTexto }}
                    >
                      {enVivo && (
                        <span
                          className="mb-[2.5cqw] inline-flex items-center gap-[1.2cqw] rounded-full bg-emerald-500 px-[2.4cqw] py-[0.6cqw] font-bold uppercase tracking-wide text-noche shadow"
                          style={{ fontSize: 'clamp(8px, 3.2cqw, 12px)', textShadow: 'none' }}
                        >
                          <span className="h-[1.6cqw] w-[1.6cqw] min-h-1 min-w-1 animate-pulse rounded-full bg-noche" />
                          En vivo
                        </span>
                      )}
                      {prefijo && (
                        <span
                          className="font-semibold uppercase tracking-[0.18em] opacity-80"
                          style={{ fontSize: 'clamp(8px, 3.4cqw, 13px)' }}
                        >
                          {prefijo}
                        </span>
                      )}
                      <span
                        className="line-clamp-3 font-display font-bold leading-[1.08] [overflow-wrap:anywhere]"
                        style={{ fontSize: nombre.length > 26 ? 'clamp(12px, 5.8cqw, 21px)' : 'clamp(13px, 6.8cqw, 25px)' }}
                      >
                        {nombre}
                      </span>

                      {/* Zona: si no está registrada se muestra "HUÁNUCO" (general) para no dejarlo vacío */}
                      <span
                        className="mt-[1.8cqw] inline-flex max-w-full items-center justify-center gap-[1cqw] font-semibold opacity-85"
                        style={{ fontSize: 'clamp(9px, 3.6cqw, 14px)' }}
                        title={zonasDe(c).length ? undefined : 'Distrito no especificado: Huánuco en general'}
                      >
                        <IconPin className="h-[1.15em] w-[1.15em] shrink-0" />
                        {zonasDe(c).length ? (
                          <span className="truncate">{zonasDe(c).join(' · ')}</span>
                        ) : (
                          <span className="uppercase tracking-[0.14em]">Huánuco</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCofradia(c.id)}
                    aria-label={`Ver ${c.nickname_cofradia}`}
                    className="pointer-events-auto absolute inset-0 cursor-pointer outline-none focus-visible:bg-white/10"
                    style={{ clipPath: PANUELO_CLIP, WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>

                {/* Datos de apoyo (fuera del pañuelo, no clicables) */}
                <div className="mt-1 flex max-w-[260px] flex-col items-center gap-1 px-1 text-center">
                  {orden === 'votos' && typeof c.votos === 'number' && (
                    <span className="text-xs font-semibold tabular-nums" style={{ color: ink }}>
                      {c.votos} {c.votos === 1 ? 'voto' : 'votos'}
                    </span>
                  )}
                  {coincidencia && (
                    <span className="line-clamp-2 rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] leading-snug text-white/70">
                      Pasa por: {coincidencia}
                    </span>
                  )}
                  {!coincidencia && actividadesDia.length > 0 && (
                    <span className="text-[11px] text-white/50">
                      {actividadesDia.length} {actividadesDia.length === 1 ? 'parada' : 'paradas'} ese día
                    </span>
                  )}
                </div>
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
