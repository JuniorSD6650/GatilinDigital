'use client';

/**
 * Componentes comunes del panel de administración.
 * Todas las vistas usan estos mismos botones y el mismo modal, para que
 * tengan igual color, tamaño y posición en todo el panel.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import BulkUploadModal from './BulkUploadModal';
import {
  IconX, IconEdit, IconTrash, IconEye, IconImage, IconKey, IconPlus, IconDownload, IconUpload, IconCamera,
  IconSearch, IconChevronLeft, IconChevronRight,
} from '@/components/ui/Icons';

/* =========================================================
   MODAL
   Se renderiza en <body> (portal). Así siempre queda centrado en la
   pantalla, sin importar el scroll ni los contenedores animados de la vista
   (un ancestro con `transform` rompe `position: fixed`).
   ========================================================= */

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
} as const;

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: keyof typeof SIZES;
  children: ReactNode;
  /** Botones inferiores (normalmente <ModalCancel/> y <ModalSave/>) */
  footer?: ReactNode;
  /** Evita cerrar con Escape o clic fuera (p. ej. mientras se guarda) */
  locked?: boolean;
}

export function AdminModal({ open, onClose, title, subtitle, size = 'lg', children, footer, locked }: AdminModalProps) {
  // Escape para cerrar + bloquear el scroll de la página detrás
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !locked) onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, locked, onClose]);

  // Solo se abre tras una acción del usuario, cuando document ya existe
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !locked) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-negrito-card shadow-2xl sm:max-h-[90vh] ${SIZES[size]}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <IconX className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ModalCancel({ onClick, disabled, children = 'Cancelar' }: { onClick: () => void; disabled?: boolean; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 rounded-lg border border-white/10 bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ModalSave({
  onClick, loading, disabled, children = 'Guardar cambios', loadingText = 'Guardando...', type = 'button', form,
}: {
  onClick?: () => void; loading?: boolean; disabled?: boolean; children?: ReactNode; loadingText?: string;
  type?: 'button' | 'submit'; form?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={loading || disabled}
      className="h-10 rounded-lg bg-gradient-to-r from-festivo-gold to-yellow-600 px-5 text-sm font-bold text-negrito-black transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? loadingText : children}
    </button>
  );
}

/* =========================================================
   BOTONES DE ACCIÓN (filas de tablas y tarjetas)
   Mismo tamaño para todos; el color depende solo del tipo de acción.
   ========================================================= */

const ACTIONS = {
  view: { label: 'Ver', icon: IconEye, cls: 'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20' },
  photo: { label: 'Foto', icon: IconImage, cls: 'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20' },
  camera: { label: 'Foto', icon: IconCamera, cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' },
  edit: { label: 'Editar', icon: IconEdit, cls: 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20' },
  key: { label: 'Contraseña', icon: IconKey, cls: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20' },
  delete: { label: 'Eliminar', icon: IconTrash, cls: 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20' },
} as const;

export type ActionKind = keyof typeof ACTIONS;

export function ActionButton({
  kind, onClick, children, title, disabled,
}: { kind: ActionKind; onClick: () => void; children?: ReactNode; title?: string; disabled?: boolean }) {
  const a = ACTIONS[kind];
  const Icon = a.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-40 ${a.cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children ?? a.label}
    </button>
  );
}

/** Contenedor de acciones: siempre alineadas a la derecha y en el mismo orden visual */
export function RowActions({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-nowrap items-center justify-end gap-2 ${className}`}>{children}</div>;
}

/* =========================================================
   BARRA SUPERIOR DE CADA VISTA (título + Plantilla / Excel / Nuevo)
   ========================================================= */

export function PageToolbar({ title, subtitle, children }: { title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="mb-1 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const TOOLBAR_BASE = 'inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm transition-colors';

export function TemplateButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${TOOLBAR_BASE} border border-white/10 bg-white/5 font-medium text-white/80 hover:bg-white/10 hover:text-white`}>
      <IconDownload className="h-4 w-4" /> Plantilla
    </button>
  );
}

/**
 * Botón "Cargar Excel": abre una vista previa validada por el servidor antes
 * de importar (errores por fila) y luego llama a onDone para recargar.
 */
export function UploadExcelButton({ endpoint, onDone }: { endpoint: string; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <label className={`${TOOLBAR_BASE} cursor-pointer border border-white/10 bg-white/5 font-medium text-white/80 hover:bg-white/10 hover:text-white`}>
        <IconUpload className="h-4 w-4" /> Cargar Excel
        <input
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </label>
      <BulkUploadModal open={!!file} file={file} endpoint={endpoint} onClose={() => setFile(null)} onDone={onDone} />
    </>
  );
}

/** Botón "Exportar" (Excel) */
export function ExportButton({ onClick, label = 'Exportar' }: { onClick: () => Promise<unknown> | void; label?: string }) {
  const [cargando, setCargando] = useState(false);
  return (
    <button
      type="button"
      disabled={cargando}
      onClick={async () => {
        setCargando(true);
        try {
          await onClick();
        } catch (err) {
          alert((err as Error).message || 'No se pudo exportar');
        } finally {
          setCargando(false);
        }
      }}
      className={`${TOOLBAR_BASE} border border-white/10 bg-white/5 font-medium text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50`}
    >
      <IconDownload className="h-4 w-4" /> {cargando ? 'Generando…' : label}
    </button>
  );
}

/**
 * Paginación y búsqueda en SERVIDOR. Devuelve la misma forma que
 * usePagination para reutilizar <Pagination/>.
 */
export function useServerList<T>(
  fetcher: (q: { page: number; pageSize: number; q?: string } & Record<string, string | number | undefined>) => Promise<{ data: T[]; total: number; totalPages: number }>,
  filtros: Record<string, string | number | undefined>,
  pageSize = 20
) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const filtrosKey = JSON.stringify(filtros);
  const [lastKey, setLastKey] = useState(filtrosKey);
  if (filtrosKey !== lastKey) {
    setLastKey(filtrosKey);
    setPage(1);
  }

  useEffect(() => {
    let activo = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetcher({ page, pageSize, ...JSON.parse(filtrosKey) })
        .then((r) => {
          if (!activo) return;
          setItems(r.data);
          setTotal(r.total);
          setTotalPages(r.totalPages);
          setError('');
        })
        .catch((e) => activo && setError(e.message))
        .finally(() => activo && setLoading(false));
    }, 250); // espera a que el usuario termine de escribir
    return () => {
      activo = false;
      clearTimeout(t);
    };
    // fetcher es estable en cada página (función de módulo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filtrosKey, version]);

  const start = (page - 1) * pageSize;
  return {
    items,
    page,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    setPage,
    loading,
    error,
    reload: () => setVersion((v) => v + 1),
  };
}

export function NewButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`${TOOLBAR_BASE} bg-festivo-gold font-bold text-negrito-black hover:bg-yellow-500`}>
      <IconPlus className="h-4 w-4" /> {children}
    </button>
  );
}

/* =========================================================
   BÚSQUEDA Y FILTROS
   ========================================================= */

/** Fila de búsqueda + filtros, igual en todas las vistas */
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

export function SearchField({
  value, onChange, placeholder = 'Buscar...',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:max-w-md sm:flex-1">
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-white/10 bg-negrito-card pl-10 pr-9 text-sm text-white placeholder-gray-500 transition-colors focus:border-festivo-gold/50 focus:outline-none focus:ring-2 focus:ring-festivo-gold/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-gray-500 hover:bg-white/10 hover:text-white"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({
  value, onChange, children, label,
}: { value: string; onChange: (v: string) => void; children: ReactNode; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={`h-10 w-full rounded-lg border bg-negrito-card px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-festivo-gold/20 sm:w-auto sm:min-w-[180px] ${
        value ? 'border-festivo-gold/40 text-white' : 'border-white/10 text-gray-300'
      }`}
    >
      {children}
    </select>
  );
}

/* =========================================================
   ESTADOS: carga, error y vacío
   ========================================================= */

export function LoadingState({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-festivo-gold border-t-transparent" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{children}</div>;
}

export function EmptyState({
  title, description, action,
}: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/5 text-gray-500">
        <IconSearch className="h-5 w-5" />
      </div>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* =========================================================
   TABLAS Y PAGINACIÓN
   ========================================================= */

/** Clases comunes de tabla (encabezado y celdas) */
export const TABLE = {
  card: 'overflow-hidden rounded-2xl border border-white/10 bg-negrito-card',
  thead: 'border-b border-white/10 bg-white/[0.03]',
  th: 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap',
  thRight: 'px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap',
  tr: 'transition-colors hover:bg-white/[0.03]',
  td: 'px-5 py-3.5 text-sm',
} as const;

/**
 * Paginación en cliente. `resetKey` debe cambiar cuando cambian los filtros
 * para volver a la página 1.
 */
export function usePagination<T>(items: T[], pageSize = 20, resetKey = '') {
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);
  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    setPage,
  };
}

export function Pagination({
  page, totalPages, total, from, to, setPage, noun = 'registros',
}: ReturnType<typeof usePagination> & { noun?: string }) {
  if (total === 0) return null;
  const ir = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const btn =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-white/10 px-2.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40';
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-5 py-3 sm:flex-row">
      <p className="text-xs text-gray-400">
        Mostrando <span className="font-semibold text-white">{from}–{to}</span> de{' '}
        <span className="font-semibold text-white">{total}</span> {noun}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} onClick={() => ir(page - 1)} disabled={page <= 1} aria-label="Página anterior">
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs text-gray-400 tabular-nums">
            Página <span className="font-semibold text-white">{page}</span> de {totalPages}
          </span>
          <button type="button" className={btn} onClick={() => ir(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
