import { API_URL, BASE_URL } from '../api';
import { getDeviceId } from '@/lib/device';

// --- SECCIÓN FESTIVAL (Organizaciones) ---
export interface Organizacion {
  id: number;
  nombre: string;
  descripcion: string | null;
  streaming_link: string | null;
}

export const getOrganizaciones = async (): Promise<Organizacion[]> => {
  try {
    const response = await fetch(`${API_URL}/organizacion`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo organizaciones:", error);
    return []; 
  }
};

// --- SECCIÓN SIGUETEO (Cofradías) ---
export interface CofradiaActividad {
  /** dd/mm/yyyy */
  fecha: string;
  direccion: string;
}

export interface CofradiaResumen {
  id: number;
  slug?: string | null;
  compartiendo?: boolean;
  nickname_cofradia: string;
  nombre_cofradia?: string;
  color: string;
  distrito?: string | null;
  sede_local?: string | null;
  votos?: number;
  tiene_ubicacion?: boolean;
  /** dd/mm/yyyy HH:mm:ss */
  ubicacion_link_actualizado?: string | null;
  actividades?: CofradiaActividad[];
}

export interface CofradiaRanking {
  id: number;
  nickname_cofradia: string;
  color: string;
  votos: number;
}

export interface CofradiaDetalle {
  id: number;
  slug?: string | null;
  lat?: number | null;
  lng?: number | null;
  compartiendo?: boolean;
  ubicacion_actualizado_iso?: string | null;
  nickname_cofradia: string;
  nombre_cofradia: string;
  fecha_fundacion: string;
  sede_local: string;
  dni_representante: string;
  nombre_representante: string;
  cel_representante: string;
  distrito: string;
  color: string;
  descripcion: string;
  ubicacion_link: string;
  ubicacion_link_actualizado: string;
  organizacion_id: number;
  votos: number;
}

export const getCofradiaList = async (): Promise<CofradiaResumen[]> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/list`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo lista de cofradías:", error);
    return [];
  }
};

export const getCofradiaDetail = async (id: number): Promise<CofradiaDetalle | null> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo detalle de cofradía ${id}:`, error);
    return null;
  }
};

// Votos: un voto por dispositivo, por cofradía y por día (el servidor lo controla)
export interface VotoRespuesta {
  votos: number;
  yaVotaste: boolean;
  message?: string;
}

const votoHeaders = () => ({ 'Content-Type': 'application/json', 'X-Device-Id': getDeviceId() });

const llamarVoto = async (id: number, method: 'GET' | 'POST' | 'DELETE'): Promise<VotoRespuesta> => {
  const response = await fetch(`${API_URL}/cofradia/${id}/${method === 'GET' ? 'voto' : 'votar'}`, {
    method,
    headers: votoHeaders(),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  // 409 = ya votó hoy: no es un error para la interfaz
  if (response.status === 409) return { votos: data.votos, yaVotaste: true, message: data.message };
  if (!response.ok) throw new Error(data.message || data.error || `Error HTTP: ${response.status}`);
  return data;
};

export const getEstadoVoto = (id: number) => llamarVoto(id, 'GET');
export const votarCofradia = (id: number) => llamarVoto(id, 'POST');
export const quitarVotoCofradia = (id: number) => llamarVoto(id, 'DELETE');

// --- Página pública por slug ---
export const getCofradiaBySlug = async (slug: string): Promise<CofradiaDetalle | null> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

/** Enlace para compartir: el backend añade la vista previa (Open Graph) y redirige a la página */
export const shareUrlCofradia = (c: { slug?: string | null; id: number }) => `${BASE_URL}/share/cofradia/${encodeURIComponent(c.slug || String(c.id))}`;
export const pageUrlCofradia = (c: { slug?: string | null; id: number }) =>
  c.slug ? `/cofradia?slug=${encodeURIComponent(c.slug)}` : `/sigueteo?cofradia=${c.id}`;

// --- Mapa en vivo ---
export interface CofradiaMapa {
  id: number;
  slug: string | null;
  nickname_cofradia: string;
  color: string;
  distrito: string | null;
  sede_local: string | null;
  lat: number | null;
  lng: number | null;
  precision: number | null;
  ubicacion_link: string | null;
  compartiendo: boolean;
  actualizado: string | null;
  minutos_desde_actualizacion: number | null;
}

export const getMapaCofradias = async (): Promise<CofradiaMapa[]> => {
  const response = await fetch(`${API_URL}/cofradia/mapa`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  return response.json();
};

// --- Agenda ---
export interface EventoAgenda extends Evento {
  fecha_iso: string;
  cod_cofradia: number;
  color?: string;
  slug?: string | null;
}

export interface FiltrosAgenda {
  desde?: string;
  hasta?: string;
  cod_cofradia?: number | string;
  tipo_evento?: string;
  q?: string;
}

export const getAgenda = async (filtros: FiltrosAgenda = {}): Promise<EventoAgenda[]> => {
  const p = new URLSearchParams({ orden: 'agenda' });
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const response = await fetch(`${API_URL}/eventos?${p}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  return response.json();
};

export const getTiposEvento = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/eventos/tipos`);
    return response.ok ? response.json() : [];
  } catch {
    return [];
  }
};

/** URL del calendario .ics (un evento, o la agenda filtrada) */
export const icsUrl = (filtros: FiltrosAgenda & { id?: number } = {}) => {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const q = p.toString();
  return `${API_URL}/eventos/ics${q ? `?${q}` : ''}`;
};

/** Google Maps: cómo llegar a una dirección de Huánuco */
export const comoLlegarUrl = (direccion: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${direccion}, Huánuco, Perú`)}`;

export const getRankingCofradias = async (): Promise<CofradiaRanking[]> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/ranking/votos`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo ranking de cofradías:", error);
    return [];
  }
};

// --- SECCIÓN FESTIVAL OFICIAL (Cronograma) ---
export interface FestivalEvento {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_texto: string;
  nombre_cofradia: string;
  lugar: string;
  tipo_actividad: string;
  estado: string;
}

export interface FestivalDia {
  fecha: string;
}

export const getFestivalEventos = async (fecha?: string): Promise<FestivalEvento[]> => {
  try {
    const url = fecha 
      ? `${API_URL}/festival?fecha=${fecha}` 
      : `${API_URL}/festival`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo eventos del festival:", error);
    return [];
  }
};

export const getFestivalDias = async (): Promise<FestivalDia[]> => {
  try {
    const response = await fetch(`${API_URL}/festival/dias`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo días del festival:", error);
    return [];
  }
};

// --- SECCIÓN COFRADES ---
export interface Cofrade {
  id: number;
  dni_cofrade: string;
  nombres_apellidos: string;
  celular: string | null;
  personaje_cofradia: string;
  cargo_cofrade: string;
  ruta_foto: string | null;
  cod_cofradia: number;
  anio: number;
  nickname_cofradia?: string;
  color?: string;
}

export const getCofradesbyCofradia = async (cofradiaId: number): Promise<Cofrade[]> => {
  try {
    const response = await fetch(`${API_URL}/cofrades/by-cofradia/${cofradiaId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo cofrades de cofradía ${cofradiaId}:`, error);
    return [];
  }
};

// Foto grupal de la cuadrilla (una por temporada)
export interface FotoCuadrilla {
  id: number;
  anio: number;
  ruta_foto: string;
  actualizado: string;
}

export const getFotosCuadrilla = async (cofradiaId: number): Promise<FotoCuadrilla[]> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/${cofradiaId}/fotos`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo fotos de la cuadrilla ${cofradiaId}:`, error);
    return [];
  }
};

// --- SECCIÓN EVENTOS (Cronograma de Cofradías) ---
export interface Evento {
  id: number;
  fecha: string;
  tipo_dia: string;
  tipo_evento: string;
  hora: string;
  direccion_actividad: string;
  oferente: string;
  tipo_oferente: string;
  banda: string;
  cofradia: number;
  nickname_cofradia?: string;
}

export const getEventosByCofradiaId = async (cofradiaId: number): Promise<Evento[]> => {
  try {
    const response = await fetch(`${API_URL}/eventos?cod_cofradia=${cofradiaId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo eventos de cofradía ${cofradiaId}:`, error);
    return [];
  }
};

// --- SECCIÓN BORDADURÍAS ---
export interface BordaduriaResumen {
  id: number;
  razon_social: string;
}

export interface BordaduriaDetalle {
  id: number;
  ruc: string;
  razon_social: string;
  descripcion: string;
  direccion: string;
  web_fb: string;
  representante: string;
  celular: string;
}

export const getBordaduriasList = async (): Promise<BordaduriaResumen[]> => {
  try {
    const response = await fetch(`${API_URL}/bordadurias/list`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo lista de bordadurías:", error);
    return [];
  }
};

export const getBordaduriaDetail = async (id: number): Promise<BordaduriaDetalle | null> => {
  try {
    const response = await fetch(`${API_URL}/bordadurias/${id}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error obteniendo detalle de bordaduría ${id}:`, error);
    return null;
  }
};

// --- SECCIÓN REPORTES ---

export const createReporte = async (formData: FormData): Promise<{ message: string; id: number }> => {
  try {
    const response = await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      body: formData, 
      // IMPORTANTE: No establecer 'Content-Type': 'application/json' 
      // cuando enviamos FormData (para archivos), el navegador lo hace automático.
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creando reporte:", error);
    throw error;
  }
};

// --- SECCIÓN PARTICIPANTES (Registro) ---
export interface ParticipantePayload {
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_registro: string; // ISO Date
  estado: string; // 'pendiente', 'contactado', etc.
  comentario: string;
}

export const createParticipante = async (data: ParticipantePayload) => {
  try {
    const response = await fetch(`${API_URL}/participantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || `Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error registrando participante:", error);
    throw error;
  }
};