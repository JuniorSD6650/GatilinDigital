'use client';

import { useEffect, useState } from 'react';
import { exportExcel, getAuditoriaFiltros, getPaginado, type RegistroAuditoria } from '@/services/apis/api-admin';
import {
  PageToolbar, ExportButton, ErrorBanner, EmptyState, FilterBar, SearchField, FilterSelect, Pagination, TABLE, useServerList,
} from '@/components/admin/AdminUI';

const ACCIONES: Record<string, { texto: string; cls: string }> = {
  crear: { texto: 'Creó', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  editar: { texto: 'Editó', cls: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  eliminar: { texto: 'Eliminó', cls: 'bg-red-500/10 text-red-300 border-red-500/30' },
  carga_masiva: { texto: 'Carga Excel', cls: 'bg-violet-500/10 text-violet-300 border-violet-500/30' },
  estado: { texto: 'Cambió estado', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  ubicacion: { texto: 'Ubicación', cls: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  login: { texto: 'Inició sesión', cls: 'bg-white/5 text-gray-300 border-white/10' },
  login_fallido: { texto: 'Login fallido', cls: 'bg-red-500/10 text-red-300 border-red-500/30' },
};

const ENTIDADES: Record<string, string> = {
  cofradia: 'Cofradía', cofrade: 'Cofrade', evento: 'Evento', reporte: 'Reporte', usuario: 'Usuario', participante: 'Participante',
  bordaduria: 'Bordaduría', organizacion: 'Organización', foto_cuadrilla: 'Foto de cuadrilla',
};

/** Convierte el detalle JSON en texto legible */
const describir = (detalle: unknown): string => {
  if (!detalle || typeof detalle !== 'object') return detalle ? String(detalle) : '';
  return Object.entries(detalle as Record<string, unknown>)
    .map(([k, v]) => {
      if (Array.isArray(v) && v.length === 2 && k !== 'campos') return `${k}: «${v[0] ?? '—'}» → «${v[1] ?? '—'}»`;
      if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
      return `${k}: ${v}`;
    })
    .join(' · ');
};

const fetchAuditoria = (q: Record<string, string | number | undefined>) => getPaginado<RegistroAuditoria>('auditoria', q);

export default function AuditoriaPage() {
  const [q, setQ] = useState('');
  const [entidad, setEntidad] = useState('');
  const [accion, setAccion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [opciones, setOpciones] = useState<{ entidades: string[]; acciones: string[]; usuarios: { id: number; username: string }[] }>({ entidades: [], acciones: [], usuarios: [] });

  const filtros = {
    q: q || undefined, entidad: entidad || undefined, accion: accion || undefined, usuario_id: usuario || undefined,
    desde: desde || undefined, hasta: hasta || undefined,
  };
  const pag = useServerList(fetchAuditoria, filtros, 25);

  useEffect(() => {
    getAuditoriaFiltros().then(setOpciones).catch(() => {});
  }, []);

  const inputFecha = 'h-10 rounded-lg border border-white/10 bg-negrito-card px-3 text-sm text-gray-300';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageToolbar title="Auditoría" subtitle="Quién cambió qué y cuándo, en el panel y en el localizador">
        <ExportButton onClick={() => exportExcel('auditoria', 'Auditoria.xlsx', filtros)} />
      </PageToolbar>

      <FilterBar>
        <SearchField value={q} onChange={setQ} placeholder="Buscar en usuario o detalle..." />
        <FilterSelect value={entidad} onChange={setEntidad} label="Entidad">
          <option value="">Todo</option>
          {opciones.entidades.map((e) => <option key={e} value={e}>{ENTIDADES[e] || e}</option>)}
        </FilterSelect>
        <FilterSelect value={accion} onChange={setAccion} label="Acción">
          <option value="">Todas las acciones</option>
          {opciones.acciones.map((a) => <option key={a} value={a}>{ACCIONES[a]?.texto || a}</option>)}
        </FilterSelect>
        <FilterSelect value={usuario} onChange={setUsuario} label="Usuario">
          <option value="">Todos los usuarios</option>
          {opciones.usuarios.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
        </FilterSelect>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} aria-label="Desde" className={inputFecha} />
        <input type="date" value={hasta} min={desde || undefined} onChange={(e) => setHasta(e.target.value)} aria-label="Hasta" className={inputFecha} />
      </FilterBar>

      <ErrorBanner>{pag.error}</ErrorBanner>

      <div className={TABLE.card}>
        <div className={`overflow-x-auto ${pag.loading ? 'opacity-60' : ''}`}>
          <table className="w-full">
            <thead className={TABLE.thead}>
              <tr>
                <th className={TABLE.th}>Fecha</th>
                <th className={TABLE.th}>Usuario</th>
                <th className={TABLE.th}>Acción</th>
                <th className={TABLE.th}>Sobre</th>
                <th className={TABLE.th}>Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pag.items.map((r) => {
                const a = ACCIONES[r.accion] || { texto: r.accion, cls: 'bg-white/5 text-gray-300 border-white/10' };
                return (
                  <tr key={r.id} className={TABLE.tr}>
                    <td className={`${TABLE.td} whitespace-nowrap text-gray-400`}>
                      {new Date(r.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className={`${TABLE.td} whitespace-nowrap font-medium text-white`}>{r.username || '—'}</td>
                    <td className={TABLE.td}>
                      <span className={`whitespace-nowrap rounded-lg border px-2 py-1 text-xs font-medium ${a.cls}`}>{a.texto}</span>
                    </td>
                    <td className={`${TABLE.td} whitespace-nowrap text-gray-300`}>
                      {ENTIDADES[r.entidad] || r.entidad}{r.entidad_id ? ` #${r.entidad_id}` : ''}
                    </td>
                    <td className={`${TABLE.td} max-w-md text-xs text-gray-400 [overflow-wrap:anywhere]`}>{describir(r.detalle)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!pag.loading && pag.total === 0 && <EmptyState title="Sin registros" description="Los cambios hechos en el panel aparecerán aquí." />}
        </div>
        <Pagination {...pag} noun="registros" />
      </div>
    </div>
  );
}
