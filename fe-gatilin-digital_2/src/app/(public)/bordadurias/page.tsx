'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import Cintas from '@/components/decor/Cintas';
import { IconArrowLeft, IconArrowRight, IconFacebook, IconNeedle, IconPhone, IconPin, IconSearch, IconUser } from '@/components/ui/Icons';
import { getBordaduriasList, getBordaduriaDetail, type BordaduriaResumen, type BordaduriaDetalle } from '@/services/apis/api-normal';

const ACCENT = '#ef2b3c';

export default function BordaduriasPage() {
  // --- ESTADOS GLOBALES ---
  const [view, setView] = useState<'LIST' | 'DETAIL'>('LIST');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // --- ESTADOS DE LA LISTA ---
  const [list, setList] = useState<BordaduriaResumen[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS DEL DETALLE ---
  const [detail, setDetail] = useState<BordaduriaDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Cargar la lista al iniciar
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getBordaduriasList();
        setList(data);
      } catch (error) {
        console.error('Error al cargar bordadurías:', error);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // 2. Filtrar lista
  const filteredList = list.filter((t) => t.razon_social.toLowerCase().includes(searchTerm.toLowerCase()));

  // 3. Cargar detalle cuando se selecciona un ID
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetail(null);
      try {
        const data = await getBordaduriaDetail(selectedId);
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
  const handleSelectBordaduria = (id: number) => {
    setSelectedId(id);
    setView('DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setView('LIST');
    setDetail(null);
  };

  // ==========================================
  // VISTA: DETALLE
  // ==========================================
  if (view === 'DETAIL') {
    return (
      <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
        <button
          type="button"
          onClick={handleBackToList}
          className="group mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/25 hover:text-white"
        >
          <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Volver al catálogo
        </button>

        {loadingDetail || !detail ? (
          loadingDetail ? (
            <div className="h-96 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
          ) : (
            <EmptyState title="No se pudo cargar la bordaduría" description="Vuelve al catálogo e inténtalo nuevamente." />
          )
        ) : (
          <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-terciopelo/60">
            {/* Encabezado */}
            <header className="relative isolate overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
              <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-br from-[#5a0d16] via-[#2a0b14] to-noche" />
              <div aria-hidden className="bordado absolute inset-0 -z-10 opacity-[0.14]" />
              <Cintas className="pointer-events-none absolute -top-1 left-4 hidden h-44 w-20 sm:block" count={5} />
              <Cintas className="pointer-events-none absolute -top-1 right-4 hidden h-44 w-20 sm:block" count={5} mirror />

              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-oro/40 bg-black/30 text-oro shadow-[0_0_40px_-10px_rgba(239,43,60,0.8)]">
                <IconNeedle className="w-8 h-8" />
              </span>
              <p className="eyebrow mt-5 justify-center text-[#ff8a95]">Bordaduría & arte textil</p>
              <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-5xl">
                {detail.razon_social}
              </h1>
              <div className="plumaje-band absolute inset-x-0 bottom-0" />
            </header>

            <div className="space-y-8 p-6 sm:p-10">
              {detail.descripcion && (
                <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-white/75">{detail.descripcion}</p>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Datos comerciales */}
                <section className="card-fest p-6">
                  <h2 className="eyebrow text-[var(--accent)]">Datos comerciales</h2>
                  <dl className="mt-4 space-y-4 text-sm">
                    <div className="flex gap-3">
                      <IconUser className="mt-0.5 w-4 h-4 shrink-0 text-white/40" />
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-white/45">Representante</dt>
                        <dd className="text-white">{detail.representante}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="mt-0.5 w-4 shrink-0 text-center text-[10px] font-bold text-white/40">RUC</span>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-white/45">RUC</dt>
                        <dd className="font-mono text-white">{detail.ruc}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <IconPin className="mt-0.5 w-4 h-4 shrink-0 text-white/40" />
                      <div>
                        <dt className="text-[11px] uppercase tracking-wider text-white/45">Dirección</dt>
                        <dd className="text-white">{detail.direccion}</dd>
                      </div>
                    </div>
                  </dl>
                </section>

                {/* Contacto */}
                <section className="card-fest flex flex-col p-6">
                  <h2 className="eyebrow text-[var(--accent)]">Contacto directo</h2>
                  <div className="mt-4 flex flex-1 flex-col justify-center gap-3">
                    <a href={`tel:${detail.celular}`} className="btn bg-pluma-verde py-3.5 text-white hover:-translate-y-0.5 hover:bg-[#16ad5f]">
                      <IconPhone className="w-5 h-5" />
                      {detail.celular}
                    </a>
                    {detail.web_fb && (
                      <a
                        href={detail.web_fb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-[#1877F2] py-3.5 text-white hover:-translate-y-0.5 hover:bg-[#1468d8]"
                      >
                        <IconFacebook className="w-5 h-5" />
                        Ver trabajos en Facebook
                      </a>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </article>
        )}
      </div>
    );
  }

  // ==========================================
  // VISTA: LISTA (Default)
  // ==========================================
  return (
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Bordadurías"
        title="Maestros del bordado"
        description="Los talleres que, hilo a hilo de oro y plata, visten de gala nuestra tradición."
        accent={ACCENT}
      />

      <div className="mb-8 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar taller o bordaduría..." className="w-full sm:max-w-md" />
        {!loadingList && (
          <p className="text-sm text-white/50">
            {filteredList.length} {filteredList.length === 1 ? 'taller' : 'talleres'}
          </p>
        )}
      </div>

      {loadingList ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : filteredList.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((taller) => (
            <li key={taller.id}>
              <button
                type="button"
                onClick={() => handleSelectBordaduria(taller.id)}
                className="group card-fest relative flex h-full w-full flex-col items-start overflow-hidden p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50 hover:shadow-[0_20px_40px_-20px_rgba(239,43,60,0.55)]"
              >
                <div aria-hidden className="bordado absolute inset-0 opacity-[0.04] transition-opacity group-hover:opacity-[0.1]" />
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--accent)] via-oro to-[var(--accent)]" />

                <span className="relative grid h-12 w-12 place-items-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[#ff8a95] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <IconNeedle className="w-6 h-6" />
                </span>
                <h3 className="relative mt-5 flex-1 font-display text-xl font-semibold leading-snug text-white [overflow-wrap:anywhere]">
                  {taller.razon_social}
                </h3>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/45 transition-colors group-hover:text-[#ff8a95]">
                  Ver detalles
                  <IconArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<IconSearch className="w-6 h-6" />}
          title={searchTerm ? 'Sin resultados' : 'Aún no hay talleres registrados'}
          description={searchTerm ? 'No se encontraron bordadurías con ese nombre.' : 'Vuelve pronto para conocer a los maestros bordadores.'}
        />
      )}
    </div>
  );
}
