import { API_URL } from '../api';
import { getAuthHeaders } from './api-auth';

// Interfaz para los datos de creación/edición
export interface OrganizacionPayload {
  nombre: string;
  descripcion?: string;
  streaming_link?: string;
}

// Interfaz para usuarios localizadores
export interface Usuario {
  id: number;
  username: string;
  role: string;
  cofradia_id: number | null;
  cofradia_nombre?: string;
  nickname_cofradia?: string;
}

/**
 * Crea una nueva organización/cuadrilla.
 * Requiere autenticación de administrador.
 */
export const createOrganizacion = async (data: OrganizacionPayload) => {
  try {
    const response = await fetch(`${API_URL}/organizacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aquí agregaríamos el token en el futuro:
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al crear organización: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createOrganizacion:", error);
    throw error; // Re-lanzamos el error para manejarlo en la UI (ej. mostrar alerta)
  }
};

/**
 * Actualiza una organización existente.
 */
export const updateOrganizacion = async (id: number, data: Partial<OrganizacionPayload>) => {
  try {
    const response = await fetch(`${API_URL}/organizacion/${id}`, {
      method: 'PUT', // o PATCH
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar organización: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateOrganizacion:", error);
    throw error;
  }
};

/**
 * Elimina una organización.
 */
export const deleteOrganizacion = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/organizacion/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error en deleteOrganizacion:", error);
    throw error;
  }
};

// ============================================
// GESTIÓN DE USUARIOS LOCALIZADORES
// ============================================

/**
 * Obtiene la lista de usuarios localizadores con su cofradía asignada
 */
export const getLocalizadores = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener localizadores: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Mapear nickname_cofradia a cofradia_nombre para consistencia
    return data.map((u: any) => ({
      ...u,
      cofradia_nombre: u.nickname_cofradia || u.cofradia_nombre
    }));
  } catch (error) {
    console.error("Error en getLocalizadores:", error);
    throw error;
  }
};

/**
 * Actualiza la contraseña de un localizador
 */
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