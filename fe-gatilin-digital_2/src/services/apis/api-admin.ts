import { API_URL } from '../api';
import { getAuthHeaders, getAuthHeadersForFormData } from './api-auth';
import { apiFetch, downloadFile, type Paginated } from '../http';

export type { Paginated };

/** Lanza un error con el mensaje del servidor (p. ej. qué campo es inválido) */
const lanzarError = async (response: Response, porDefecto: string): Promise<never> => {
  let msg = porDefecto;
  try {
    const data = await response.json();
    msg = data.message || data.error || porDefecto;
  } catch {
    /* sin cuerpo JSON */
  }
  if (response.status === 401 && typeof window !== 'undefined' && /^\/admin/.test(window.location.pathname)) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login?expirado=1';
  }
  throw new Error(msg);
};

// ============================================
// USUARIOS LOCALIZADORES
// ============================================

export interface Usuario {
  id: number;
  username: string;
  role: string;
  cofradia_id: number | null;
  cofradia_nombre?: string;
  nickname_cofradia?: string;
}

export const getLocalizadores = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener localizadores: ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data as Usuario[]).map((u) => ({
      ...u,
      cofradia_nombre: u.nickname_cofradia || u.cofradia_nombre
    }));
  } catch (error) {
    console.error("Error en getLocalizadores:", error);
    throw error;
  }
};

export const updateLocalizadorPassword = async (id: number, password: string) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Error al actualizar contraseña');
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateLocalizadorPassword:", error);
    throw error;
  }
};

// ============================================
// ORGANIZACIONES
// ============================================

export interface Organizacion {
  id: number;
  nombre: string;
  descripcion?: string;
  streaming_link?: string;
}

export const getOrganizaciones = async (): Promise<Organizacion[]> => {
  const response = await fetch(`${API_URL}/organizacion`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener organizaciones');
  return await response.json();
};

export const createOrganizacion = async (data: Partial<Organizacion>) => {
  const response = await fetch(`${API_URL}/organizacion`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al crear organización');
  return await response.json();
};

export const updateOrganizacion = async (id: number, data: Partial<Organizacion>) => {
  const response = await fetch(`${API_URL}/organizacion/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar organización');
  return await response.json();
};

export const deleteOrganizacion = async (id: number) => {
  const response = await fetch(`${API_URL}/organizacion/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar organización');
  return await response.json();
};

// ============================================
// BORDADURÍAS
// ============================================

export interface Bordaduria {
  id: number;
  ruc: string;
  razon_social: string;
  descripcion?: string;
  direccion?: string;
  web_fb?: string;
  representante?: string;
  celular?: string;
}

export const getBordadurias = async (): Promise<Bordaduria[]> => {
  const response = await fetch(`${API_URL}/bordadurias`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener bordadurías');
  return await response.json();
};

export const createBordaduria = async (data: Partial<Bordaduria>) => {
  const response = await fetch(`${API_URL}/bordadurias`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al crear bordaduría');
  return await response.json();
};

export const updateBordaduria = async (id: number, data: Partial<Bordaduria>) => {
  const response = await fetch(`${API_URL}/bordadurias/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar bordaduría');
  return await response.json();
};

export const deleteBordaduria = async (id: number) => {
  const response = await fetch(`${API_URL}/bordadurias/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar bordaduría');
  return await response.json();
};

// ============================================
// COFRADES
// ============================================

export interface Cofrade {
  id: number;
  dni_cofrade: string;
  nombres_apellidos: string;
  celular?: string;
  personaje_cofradia?: string;
  cargo_cofrade?: string;
  cod_cofradia: number;
  anio?: number;
  ruta_foto?: string;
}

export const getCofrades = async (): Promise<Cofrade[]> => {
  const response = await fetch(`${API_URL}/cofrades`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener cofrades');
  return await response.json();
};

export const createCofrade = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/cofrades`, {
    method: 'POST',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  if (!response.ok) await lanzarError(response, 'Error al crear cofrade');
  return await response.json();
};

export const updateCofrade = async (id: number, formData: FormData) => {
  const response = await fetch(`${API_URL}/cofrades/${id}`, {
    method: 'PUT',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar cofrade');
  return await response.json();
};

export const deleteCofrade = async (id: number) => {
  const response = await fetch(`${API_URL}/cofrades/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar cofrade');
  return await response.json();
};

// ============================================
// EVENTOS
// ============================================

export interface Evento {
  id: number;
  fecha: string;
  tipo_dia?: string;
  tipo_evento?: string;
  hora?: string;
  direccion_actividad?: string;
  oferente?: string;
  tipo_oferente?: string;
  banda?: string;
  cod_cofradia?: number;
  nickname_cofradia?: string;
}

export const getEventos = async (): Promise<Evento[]> => {
  const response = await fetch(`${API_URL}/eventos`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener eventos');
  return await response.json();
};

export const createEvento = async (data: Partial<Evento>) => {
  const response = await fetch(`${API_URL}/eventos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al crear evento');
  return await response.json();
};

export const updateEvento = async (id: number, data: Partial<Evento>) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar evento');
  return await response.json();
};

export const deleteEvento = async (id: number) => {
  const response = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar evento');
  return await response.json();
};

// ============================================
// REPORTES
// ============================================

export interface Reporte {
  id: number;
  nombre_reportante: string;
  descripcion: string;
  numero_contacto?: string;
  ruta_foto?: string;
  cofradia_id?: number;
  nickname_cofradia?: string;
  estado: string;
  created_at?: string;
}

export const getReportes = async (): Promise<Reporte[]> => {
  const response = await fetch(`${API_URL}/reportes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener reportes');
  return await response.json();
};

export const updateReporte = async (id: number, formData: FormData) => {
  const response = await fetch(`${API_URL}/reportes/${id}`, {
    method: 'PUT',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar reporte');
  return await response.json();
};

export const deleteReporte = async (id: number) => {
  const response = await fetch(`${API_URL}/reportes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar reporte');
  return await response.json();
};

// ============================================
// PARTICIPANTES
// ============================================

export interface Participante {
  id: number;
  nombre: string;
  dni?: string;
  email?: string;
  telefono?: string;
  fecha_registro?: string;
  estado?: string;
  comentario?: string;
}

export const getParticipantes = async (): Promise<Participante[]> => {
  const response = await fetch(`${API_URL}/participantes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al obtener participantes');
  return await response.json();
};

export const createParticipante = async (data: Partial<Participante>) => {
  const response = await fetch(`${API_URL}/participantes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await lanzarError(response, 'Error al crear participante');
  return await response.json();
};

export const updateParticipante = async (id: number, data: Partial<Participante>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await fetch(`${API_URL}/participantes/${id}`, {
    method: 'PUT',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  if (!response.ok) await lanzarError(response, 'Error al actualizar participante');
  return await response.json();
};

export const deleteParticipante = async (id: number) => {
  const response = await fetch(`${API_URL}/participantes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) await lanzarError(response, 'Error al eliminar participante');
  return await response.json();
};

// ============================================
// UTILIDADES - DESCARGA/CARGA EXCEL
// ============================================

// Obtener lista de organizaciones para selectores
export const getOrganizacionesList = async (): Promise<{ id: number; nombre: string }[]> => {
  const response = await fetch(`${API_URL}/organizacion/list`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error obteniendo la lista de organizaciones');
  }

  return response.json();
};

// Obtener lista de cofradías para selectores
export const getCofradiasList = async (): Promise<{ id: number; nickname_cofradia: string; nombre_cofradia: string }[]> => {
  const response = await fetch(`${API_URL}/cofradia/list`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error obteniendo la lista de cofradías');
  }

  return response.json();
};

// Las plantillas requieren sesión de admin: se descargan con el token
export const downloadTemplate = (endpoint: string, filename: string) =>
  downloadFile(`/${endpoint}/template`, filename).catch((err) => {
    alert(err.message || 'No se pudo descargar la plantilla');
  });

/** Exporta a Excel un listado (con los filtros indicados) */
export const exportExcel = (endpoint: string, filename: string, query?: Record<string, string | number | undefined>) =>
  downloadFile(`/${endpoint}/export`, filename, query);

export interface FilaConError {
  fila: number;
  errores: string[];
  datos?: Record<string, unknown>;
}

export interface BulkPreview {
  dryRun: true;
  total: number;
  validos: number;
  invalidos: number;
  preview: Record<string, unknown>[];
  errores: FilaConError[];
}

export interface BulkResultado {
  message: string;
  total: number;
  insertados: number;
  fallidos: number;
  errores: FilaConError[];
}

const formDataArchivo = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fd;
};

/** Paso 1: valida el Excel en el servidor SIN guardar nada */
export const previewExcel = (endpoint: string, file: File) =>
  apiFetch<BulkPreview>(`/${endpoint}/bulk-upload`, { method: 'POST', formData: formDataArchivo(file), query: { dryRun: 1 } });

/** Paso 2: importa las filas válidas */
export const uploadExcel = (endpoint: string, file: File) =>
  apiFetch<BulkResultado>(`/${endpoint}/bulk-upload`, { method: 'POST', formData: formDataArchivo(file) });

// ============================================
// LISTADOS PAGINADOS EN SERVIDOR
// ============================================

export const getPaginado = <T,>(endpoint: string, query: Record<string, string | number | undefined>) =>
  apiFetch<Paginated<T>>(`/${endpoint}`, { query });

// ============================================
// REPORTES: seguimiento
// ============================================

export const ESTADOS_REPORTE = ['pendiente', 'revisado', 'resuelto', 'descartado'] as const;
export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

export interface HistorialReporte {
  id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  nota: string | null;
  username: string | null;
  created_at: string;
}

export interface ReporteDetalle extends Reporte {
  notas_internas?: string | null;
  atendido_por_username?: string | null;
  updated_at?: string | null;
  historial: HistorialReporte[];
}

export const getReporteDetalle = (id: number) => apiFetch<ReporteDetalle>(`/reportes/${id}`);
export const getResumenReportes = () => apiFetch<Record<EstadoReporte, number>>('/reportes/resumen');
export const actualizarEstadoReporte = (id: number, data: { estado?: string; nota?: string; notas_internas?: string }) =>
  apiFetch(`/reportes/${id}/estado`, { method: 'PATCH', body: data });

// ============================================
// AUDITORÍA
// ============================================

export interface RegistroAuditoria {
  id: number;
  usuario_id: number | null;
  username: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  detalle: unknown;
  ip: string | null;
  created_at: string;
}

export const getAuditoriaFiltros = () =>
  apiFetch<{ entidades: string[]; acciones: string[]; usuarios: { id: number; username: string }[] }>('/auditoria/filtros');

// ============================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================

export interface Estadisticas {
  totalCofradias: number;
  totalCofrades: number;
  totalEventos: number;
  totalReportes: number;
  totalParticipantes: number;
  totalBordadurias: number;
  totalLocalizadores: number;
  reportesPendientes: number;
  eventosProximos: number;
}

export const getEstadisticas = async (): Promise<Estadisticas> => {
  try {
    const response = await fetch(`${API_URL}/estadisticas`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getEstadisticas:', error);
    throw error;
  }
};