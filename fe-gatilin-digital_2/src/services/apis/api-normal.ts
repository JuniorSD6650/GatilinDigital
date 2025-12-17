import { API_URL } from '../api';

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
export interface CofradiaResumen {
  id: number;
  nickname_cofradia: string;
  color: string;
}

export interface CofradiaRanking {
  id: number;
  nickname_cofradia: string;
  color: string;
  votos: number;
}

export interface CofradiaDetalle {
  id: number;
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

export const votarCofradia = async (id: number): Promise<{ votos: number }> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/${id}/votar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error votando cofradía ${id}:`, error);
    throw error;
  }
};

export const quitarVotoCofradia = async (id: number): Promise<{ votos: number }> => {
  try {
    const response = await fetch(`${API_URL}/cofradia/${id}/votar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error quitando voto de cofradía ${id}:`, error);
    throw error;
  }
};

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