'use client';
import { useState, useEffect, useMemo } from 'react';
import { getCofradesbyCofradia, getFotosCuadrilla, type Cofrade, type FotoCuadrilla } from '@/services/apis/api-normal';
import { BASE_URL } from '@/services/api';
import { IconPhone, IconUsers, IconImage, IconSearch, IconX } from './ui/Icons';
import { readableTextOn, withAlpha, accentOnDark } from '@/lib/color';

interface CofradesSeccionProps {
  cofradiaId: number;
  cofradiaColor: string;
  cofradiaNombre?: string;
}

// Año por defecto: de enero a junio se muestra la temporada anterior
const getDefaultYear = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  return now.getMonth() + 1 <= 6 ? currentYear - 1 : currentYear;
};

const esNinguno = (v?: string | null) => !v || v.trim().toLowerCase() === 'ninguno';

// Es bailante si su personaje o cargo lo indica, o si tiene un personaje asignado
const esBailante = (c: Cofrade) => {
  const personaje = c.personaje_cofradia?.toLowerCase() || '';
  const cargo = c.cargo_cofrade?.toLowerCase() || '';
  if (personaje.includes('bailant') || cargo.includes('bailant')) return true;
  return !esNinguno(personaje);
};

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function Titulo({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
        <IconUsers className="w-6 h-6 text-white/50" />
        Integrantes de la cuadrilla
      </h2>
      {children}
    </div>
  );
}

/** Foto grupal de la temporada, o un aviso discreto si aún no hay */
function FotoGrupal({ foto, anio, nombre, color }: { foto?: FotoCuadrilla; anio: number; nombre?: string; color: string }) {
  if (!foto) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/45">
        <IconImage className="w-5 h-5 shrink-0" />
        Aún no hay foto grupal de la cuadrilla para {anio}.
      </div>
    );
  }
  const src = foto.ruta_foto.startsWith('http') ? foto.ruta_foto : `${BASE_URL}/${foto.ruta_foto}`;
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <a href={src} target="_blank" rel="noopener noreferrer" className="group relative block" aria-label="Ver foto en tamaño completo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Foto grupal de la cuadrilla ${nombre ?? ''} ${anio}`.trim()}
          loading="lazy"
          className="max-h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ backgroundColor: color }} />
      </a>
      <figcaption className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-white/55">
        <span>Cuadrilla {anio}</span>
        <span className="text-white/35">Toca la foto para ampliarla</span>
      </figcaption>
    </figure>
  );
}

export default function CofradesSection({ cofradiaId, cofradiaColor, cofradiaNombre }: CofradesSeccionProps) {
  const [cofrades, setCofrades] = useState<Cofrade[]>([]);
  const [fotos, setFotos] = useState<FotoCuadrilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(getDefaultYear());
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'bailantes' | 'sociales'>('bailantes');
  const [busqueda, setBusqueda] = useState('');

  const onColor = readableTextOn(cofradiaColor);
  const ink = accentOnDark(cofradiaColor);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dataCofrades, dataFotos] = await Promise.all([
          getCofradesbyCofradia(cofradiaId),
          getFotosCuadrilla(cofradiaId),
        ]);
        setCofrades(dataCofrades);
        setFotos(dataFotos);

        // Si el año por defecto no tiene datos, mostrar el más reciente disponible
        const anios = new Set([...dataCofrades.map((c) => c.anio), ...dataFotos.map((f) => f.anio)]);
        if (anios.size > 0 && !anios.has(getDefaultYear())) {
          setSelectedYear(Math.max(...anios));
        }
      } catch (err) {
        console.error('Error cargando cofrades:', err);
        setError('No se pudieron cargar los cofrades');
      } finally {
        setLoading(false);
      }
    };

    if (cofradiaId) fetchData();
  }, [cofradiaId]);

  const availableYears = useMemo(
    () =>
      Array.from(new Set([...cofrades.map((c) => c.anio), ...fotos.map((f) => f.anio)]))
        .filter((year) => year >= 2025)
        .sort((a, b) => b - a),
    [cofrades, fotos]
  );

  if (loading) {
    return (
      <div className="space-y-5">
        <Titulo />
        <div className="aspect-[16/7] animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (error || (cofrades.length === 0 && fotos.length === 0)) {
    return (
      <div className="space-y-5">
        <Titulo />
        <p className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-white/50">
          {error ?? 'No hay cofrades registrados en esta cuadrilla'}
        </p>
      </div>
    );
  }

  const fotoDelAno = fotos.find((f) => f.anio === selectedYear);
  const cofradesDelAno = cofrades.filter((c) => c.anio === selectedYear);

  const bailantes = cofradesDelAno.filter(esBailante);
  // Sociales: todos los que NO tengan cargo bailante
  const sociales = cofradesDelAno.filter((c) => !(c.cargo_cofrade?.toLowerCase() || '').includes('bailant'));

  const bailantesOrdenados = [...bailantes].sort((a, b) => a.nombres_apellidos.localeCompare(b.nombres_apellidos));
  // Sociales: primero los que tienen cargo, luego alfabético
  const socialesOrdenados = [...sociales].sort((a, b) => {
    const conCargoA = !esNinguno(a.cargo_cofrade);
    const conCargoB = !esNinguno(b.cargo_cofrade);
    if (conCargoA !== conCargoB) return conCargoA ? -1 : 1;
    return a.nombres_apellidos.localeCompare(b.nombres_apellidos);
  });

  // Si solo hay un grupo, se muestra ese aunque la pestaña diga otra cosa
  const tipoEfectivo =
    bailantes.length === 0 ? 'sociales' : sociales.length === 0 ? 'bailantes' : tipoSeleccionado;
  const lista = tipoEfectivo === 'bailantes' ? bailantesOrdenados : socialesOrdenados;

  const q = normalizar(busqueda.trim());
  const cofradesAMostrar = q
    ? lista.filter((c) =>
        normalizar(`${c.nombres_apellidos} ${c.personaje_cofradia ?? ''} ${c.cargo_cofrade ?? ''}`).includes(q)
      )
    : lista;

  const pill = (active: boolean) => (active ? { backgroundColor: cofradiaColor, color: onColor } : undefined);

  return (
    <div className="space-y-5">
      <Titulo>
        {/* Selector de años */}
        {availableYears.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Temporada">
            {availableYears.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                aria-pressed={selectedYear === year}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold tabular-nums transition-all ${
                  selectedYear === year ? 'shadow-md' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                style={pill(selectedYear === year)}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </Titulo>

      <FotoGrupal foto={fotoDelAno} anio={selectedYear} nombre={cofradiaNombre} color={cofradiaColor} />

      {cofradesDelAno.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-white/50">
          No hay cofrades registrados para el año {selectedYear}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Selector Bailantes / Sociales */}
            {bailantes.length > 0 && sociales.length > 0 ? (
              <div className="inline-flex self-start rounded-full border border-white/10 bg-black/30 p-1" role="tablist" aria-label="Tipo de integrante">
                {(['bailantes', 'sociales'] as const).map((tipo) => {
                  const active = tipoEfectivo === tipo;
                  const count = tipo === 'bailantes' ? bailantes.length : sociales.length;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTipoSeleccionado(tipo)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all ${active ? 'shadow' : 'text-white/60 hover:text-white'}`}
                      style={pill(active)}
                    >
                      {tipo} <span className="ml-1 tabular-nums opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/55">
                {lista.length} {tipoEfectivo}
              </p>
            )}

            {/* Buscar integrante */}
            {lista.length > 8 && (
              <div className="relative sm:w-64">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar integrante..."
                  aria-label="Buscar integrante"
                  className="field-input !rounded-full !py-2 !pl-9 !pr-9 text-sm [&::-webkit-search-cancel-button]:hidden"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    aria-label="Limpiar"
                    className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {cofradesAMostrar.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-white/50">
              {q ? 'Ningún integrante coincide con tu búsqueda' : `No hay ${tipoEfectivo} registrados para este año`}
            </p>
          ) : (
            <ol className="grid gap-x-3 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {cofradesAMostrar.map((cofrade, idx) => {
                const etiqueta =
                  tipoEfectivo === 'bailantes'
                    ? (!esNinguno(cofrade.personaje_cofradia) ? cofrade.personaje_cofradia : null)
                    : (!esNinguno(cofrade.cargo_cofrade) ? cofrade.cargo_cofrade : null);

                return (
                  <li
                    key={cofrade.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 transition-colors hover:border-white/15"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums"
                      style={{ backgroundColor: withAlpha(ink, 0.14), color: ink }}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug text-white [overflow-wrap:anywhere]">
                        {cofrade.nombres_apellidos}
                      </p>
                      {(etiqueta || cofrade.celular) && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          {etiqueta && <span className="font-semibold" style={{ color: ink }}>{etiqueta}</span>}
                          {cofrade.celular && (
                            <a href={`tel:${cofrade.celular}`} className="inline-flex items-center gap-1 text-white/45 hover:text-white">
                              <IconPhone className="h-3 w-3" />
                              {cofrade.celular}
                            </a>
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
