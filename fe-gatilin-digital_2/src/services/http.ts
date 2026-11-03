import { API_URL } from './api';
import { getAuthToken, logout } from './apis/api-auth';

/** Error de la API con el mensaje legible que envía el servidor */
export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

export const buildQuery = (query?: Query) => {
  if (!query) return '';
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  formData?: FormData;
  query?: Query;
  headers?: Record<string, string>;
  /** Respuesta binaria (Excel, .ics) */
  blob?: boolean;
}

/** Sesión vencida o revocada: limpiar y volver al login (solo en páginas privadas) */
const manejarSesionVencida = () => {
  if (typeof window === 'undefined') return;
  const enPanel = /^\/(admin|localizador)/.test(window.location.pathname);
  if (!getAuthToken() || !enPanel) return;
  logout();
  window.location.href = `/login?expirado=1&volver=${encodeURIComponent(window.location.pathname)}`;
};

export async function apiFetch<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined && !opts.formData) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${buildQuery(opts.query)}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }

  if (!res.ok) {
    let data: { message?: string; error?: string } | null = null;
    try {
      data = await res.json();
    } catch {
      /* respuesta sin JSON */
    }
    if (res.status === 401) manejarSesionVencida();
    const msg =
      data?.message || data?.error ||
      (res.status === 429 ? 'Demasiadas solicitudes. Espera un momento.' : `Error ${res.status}`);
    throw new ApiError(msg, res.status, data);
  }

  if (opts.blob) return (await res.blob()) as T;
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Descarga un archivo protegido (Excel/ICS) respetando el token */
export async function downloadFile(path: string, filename: string, query?: Query) {
  const blob = await apiFetch<Blob>(path, { blob: true, query });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
