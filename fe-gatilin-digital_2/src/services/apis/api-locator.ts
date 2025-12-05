import { API_URL } from '../api';

// Interfaz para el envío de coordenadas
export interface LocationPayload {
  lat: number;
  lng: number;
  organizacionId: number; // ID de la cuadrilla que se está rastreando
  timestamp?: string;
}

/**
 * Envía la ubicación actual de una cuadrilla al servidor.
 * Esta función se llamará repetidamente (polling o sockets) desde el dispositivo del localizador.
 */
export const updateLocation = async (data: LocationPayload) => {
  try {
    // Asumimos un endpoint '/ubicacion' o similar en tu backend
    const response = await fetch(`${API_URL}/ubicacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`, // Token del localizador
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      // No lanzamos error crítico para no detener el rastreo, solo logueamos
      console.warn(`Fallo al enviar ubicación: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error de red en updateLocation:", error);
    return null;
  }
};

/**
 * Finaliza la sesión de rastreo (opcional, para limpiar estado en backend).
 */
export const stopTracking = async (organizacionId: number) => {
  try {
    await fetch(`${API_URL}/ubicacion/${organizacionId}/stop`, {
      method: 'POST',
    });
  } catch (error) {
    console.error("Error al detener rastreo:", error);
  }
};