import { API_URL } from '../api';

// Interfaz para los datos de creación/edición
export interface OrganizacionPayload {
  nombre: string;
  descripcion?: string;
  streaming_link?: string;
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