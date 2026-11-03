'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  deleteReporte, getPaginado, getReporteDetalle, getResumenReportes, actualizarEstadoReporte, exportExcel,
  ESTADOS_REPORTE, type Reporte, type ReporteDetalle, type EstadoReporte,
} from '@/services/apis/api-admin';
import { getCofradiasList } from '@/services/apis/api-admin';
import { BASE_URL } from '@/services/api';
import { useAlert } from '@/components/AlertContext';
import {
  AdminModal, ModalCancel, ModalSave, ActionButton, RowActions, PageToolbar, ExportButton,
  LoadingState, ErrorBanner, EmptyState, FilterBar, SearchField, FilterSelect, Pagination, useServerList,
} from '@/components/admin/AdminUI';
import { IconPhone, IconCalendar, IconHistory, IconUser } from '@/components/ui/Icons';

const ETIQUETA: Record<EstadoReporte, string> = {
  pendiente: 'Pendiente',
  revisado: 'En revisión',
  resuelto: 'Resuelto',
  descartado: 'Descartado',
};

const BADGE: Record<string, string> = {
  pendiente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  revisado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  resuelto: 'bg-green-500/10 text-green-400 border-green-500/30',
  descartado: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const fechaHora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const fotoUrl = (ruta?: string) => (!ruta ? '' : ruta.startsWith('http') ? ruta : `${BASE_URL}/${ruta}`);

const fetchReportes = (q: Record<string, string | number | undefined>) => getPaginado<Reporte & { atendido_por_username?: string }>('reportes', q);

export default function ReportesAdminPage() {
  const { showAlert, showConfirm } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('pendiente');
  const [filterCofradia, setFilterCofradia] = useState('');
  const [cofradias, setCofradias] = useState<{ id: number; nickname_cofradia: string }[]>([]);
  const [resumen, setResumen] = useState<Record<string, number>>({});

  const filtros = { q: searchTerm || undefined, estado: filterEstado || undefined, cofradia_id: filterCofradia || undefined };
  const pag = useServerList(fetchReportes, filtros, 12);

  // Detalle
  const [detalle, setDetalle] = useState<ReporteDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [nota, setNota] = useState('');
  const [notasInternas, setNotasInternas] = useState('');
  const [saving, setSaving] = useState(false);
  const [fotoGrande, setFotoGrande] = useState('');

  const cargarResumen = useCallback(() => getResumenReportes().then(setResumen).catch(() => {}), []);

  useEffect(() => {
    cargarResumen();
    getCofradiasList().then(setCofradias).catch(() => {});
  }, [cargarResumen]);

  const recargar = () => {
    pag.reload();
    cargarResumen();
  };

  const abrirDetalle = async (id: number) => {
    setCargandoDetalle(true);
    setDetalle(null);
    try {
      const d = await getReporteDetalle(id);
      setDetalle(d);
      setNuevoEstado(d.estado);
      setNota('');
      setNotasInternas(d.notas_internas || '');
    } catch (err) {
      showAlert('error', (err as Error).message);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const guardar = async () => {
    if (!detalle) return;
    const cambios: { estado?: string; nota?: string; notas_internas?: string } = {};
    if (nuevoEstado !== detalle.estado) cambios.estado = nuevoEstado;
    if (nota.trim()) cambios.nota = nota.trim();
    if (notasInternas !== (detalle.notas_internas || '')) cambios.notas_internas = notasInternas;
    if (Object.keys(cambios).length === 0) {
      showAlert('info', 'No hay cambios para guardar');
      return;
    }
    setSaving(true);
    try {
      await actualizarEstadoReporte(detalle.id, cambios);
      showAlert('success', 'Reporte actualizado');
      setDetalle(null);
      recargar();
    } catch (err) {
      showAlert('error', (err as Error).message || 'Error al actualizar el reporte');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = (r: Reporte) =>
    showConfirm({
      title: 'Eliminar reporte',
      message: `¿Eliminar el reporte de "${r.nombre_reportante}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteReporte(r.id);
          showAlert('success', 'Reporte eliminado');
          setDetalle(null);
          recargar();
        } catch (err) {
          showAlert('error', (err as Error).message || 'Error al eliminar el reporte');
        }
      },
    });

  const totalTodos = Object.values(resumen).reduce((s, n) => s + n, 0);
  const primeraCarga = pag.loading && pag.total === 0 && !searchTerm && !pag.error && Object.keys(resumen).length === 0;
  if (primeraCarga) return <LoadingState label="Cargando reportes..." />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageToolbar title="Reportes" subtitle="Atiende los reportes del público y deja constancia de cada paso">
        <ExportButton onClick={() => exportExcel('reportes', 'Reportes.xlsx', filtros)} />
      </PageToolbar>

      {/* Pestañas por estado */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {[['', 'Todos', totalTodos] as const, ...ESTADOS_REPORTE.map((e) => [e, ETIQUETA[e], resumen[e] ?? 0] as const)].map(([valor, texto, n]) => (
          <button
            key={valor || 'todos'}
            type="button"
            onClick={() => setFilterEstado(valor)}
            aria-pressed={filterEstado === valor}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filterEstado === valor ? 'border-festivo-gold/60 bg-festivo-gold/15 text-white' : 'border-white/10 bg-white/[0.03] text-gray-400 hover:text-white'
            }`}
          >
            {texto}
            <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${valor === 'pendiente' && n > 0 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>{n}</span>
          </button>
        ))}
      </div>

      <FilterBar>
        <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por reportante, cofradía o descripción..." />
        <FilterSelect value={filterCofradia} onChange={setFilterCofradia} label="Cofradía">
          <option value="">Todas las cofradías</option>
          {cofradias.map((c) => <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>)}
        </FilterSelect>
      </FilterBar>

      <ErrorBanner>{pag.error}</ErrorBanner>

      <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 ${pag.loading ? 'opacity-60' : ''}`}>
        {pag.items.map((r) => (
          <article key={r.id} className="flex flex-col rounded-2xl border border-white/10 bg-negrito-card p-5 transition-colors hover:border-white/20">
            {r.ruta_foto && (
              <button type="button" onClick={() => setFotoGrande(fotoUrl(r.ruta_foto))} className="mb-4 overflow-hidden rounded-lg bg-white/5" title="Ver foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoUrl(r.ruta_foto)} alt="Foto del reporte" loading="lazy" className="h-44 w-full object-cover" />
              </button>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-white">{r.nombre_reportante}</h3>
                {r.nickname_cofradia && <p className="truncate text-sm text-gray-400">{r.nickname_cofradia}</p>}
              </div>
              <span className={`shrink-0 rounded-lg border px-2 py-1 text-xs font-medium ${BADGE[r.estado] || BADGE.descartado}`}>
                {ETIQUETA[r.estado as EstadoReporte] || r.estado}
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-gray-300">{r.descripcion}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              {r.numero_contacto && <p className="flex items-center gap-1.5"><IconPhone className="h-3.5 w-3.5" /> {r.numero_contacto}</p>}
              <p className="flex items-center gap-1.5"><IconCalendar className="h-3.5 w-3.5" /> {fechaHora(r.created_at)}</p>
              {r.atendido_por_username && <p className="flex items-center gap-1.5"><IconUser className="h-3.5 w-3.5" /> Atendido por {r.atendido_por_username}</p>}
            </div>
            <RowActions className="mt-auto border-t border-white/5 pt-3">
              <ActionButton kind="view" onClick={() => abrirDetalle(r.id)}>Atender</ActionButton>
              <ActionButton kind="delete" onClick={() => eliminar(r)} />
            </RowActions>
          </article>
        ))}
      </div>

      {!pag.loading && pag.total === 0 && (
        <div className="rounded-2xl border border-white/10 bg-negrito-card">
          <EmptyState
            title={filterEstado === 'pendiente' && !searchTerm ? '¡Todo al día! No hay reportes pendientes' : 'No se encontraron reportes'}
            description="Prueba con otra búsqueda o cambia de pestaña."
          />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-negrito-card empty:hidden">
        <Pagination {...pag} noun="reportes" />
      </div>

      {/* Detalle / atención */}
      <AdminModal
        open={cargandoDetalle || !!detalle}
        onClose={() => setDetalle(null)}
        locked={saving}
        size="lg"
        title={detalle ? `Reporte #${detalle.id}` : 'Cargando…'}
        subtitle={detalle ? `Recibido ${fechaHora(detalle.created_at)}` : undefined}
        footer={
          detalle && (
            <>
              <ModalCancel onClick={() => setDetalle(null)} disabled={saving} />
              <ModalSave onClick={guardar} loading={saving} />
            </>
          )
        }
      >
        {cargandoDetalle && <LoadingState label="Cargando reporte..." />}
        {detalle && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-400">Reportante</p>
                <p className="font-medium text-white">{detalle.nombre_reportante}</p>
                {detalle.numero_contacto && (
                  <a href={`tel:${detalle.numero_contacto}`} className="text-sm text-festivo-gold hover:underline">{detalle.numero_contacto}</a>
                )}
              </div>
              {detalle.nickname_cofradia && (
                <div>
                  <p className="text-sm text-gray-400">Cofradía</p>
                  <p className="text-white">{detalle.nickname_cofradia}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Descripción</p>
                <p className="whitespace-pre-line text-white/90">{detalle.descripcion}</p>
              </div>
              {detalle.ruta_foto && (
                <button type="button" onClick={() => setFotoGrande(fotoUrl(detalle.ruta_foto))} className="block overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fotoUrl(detalle.ruta_foto)} alt="Foto del reporte" className="max-h-64 w-full object-cover" />
                </button>
              )}

              <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-300">Estado</span>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-negrito-bg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  >
                    {ESTADOS_REPORTE.map((e) => <option key={e} value={e}>{ETIQUETA[e]}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-300">Nota de este paso <span className="text-gray-500">(queda en el historial)</span></span>
                  <input
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    maxLength={1000}
                    placeholder="Ej.: Se llamó a la cofradía y se resolvió"
                    className="w-full rounded-lg border border-white/10 bg-negrito-bg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-300">Notas internas <span className="text-gray-500">(solo el equipo)</span></span>
                  <textarea
                    value={notasInternas}
                    onChange={(e) => setNotasInternas(e.target.value)}
                    rows={3}
                    maxLength={5000}
                    className="w-full rounded-lg border border-white/10 bg-negrito-bg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  />
                </label>
              </div>
            </div>

            <aside>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><IconHistory className="h-4 w-4" /> Historial</p>
              {detalle.historial.length === 0 ? (
                <p className="text-sm text-gray-500">Sin cambios todavía.</p>
              ) : (
                <ol className="space-y-3 border-l border-white/10 pl-4">
                  {detalle.historial.map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-festivo-gold ring-4 ring-negrito-card" />
                      <p className="text-xs text-gray-500">{fechaHora(h.created_at)} · {h.username || 'sistema'}</p>
                      <p className="text-sm text-white">
                        {h.estado_anterior && h.estado_anterior !== h.estado_nuevo
                          ? <>{ETIQUETA[h.estado_anterior as EstadoReporte] || h.estado_anterior} → <strong>{ETIQUETA[h.estado_nuevo as EstadoReporte] || h.estado_nuevo}</strong></>
                          : 'Nota agregada'}
                      </p>
                      {h.nota && <p className="mt-0.5 text-sm text-gray-400">“{h.nota}”</p>}
                    </li>
                  ))}
                </ol>
              )}
            </aside>
          </div>
        )}
      </AdminModal>

      <AdminModal open={!!fotoGrande} onClose={() => setFotoGrande('')} title="Foto del reporte" size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotoGrande} alt="Foto del reporte" className="mx-auto h-auto max-h-[70vh] w-full rounded-xl object-contain" />
      </AdminModal>
    </div>
  );
}
