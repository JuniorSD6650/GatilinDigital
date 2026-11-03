// Utilidades del mapa sin dependencia de Leaflet (seguras para el render estático)

export const HUANUCO: [number, number] = [-9.9306, -76.2422];

export const haceCuanto = (min: number | null) => {
  if (min === null) return 'sin datos';
  if (min < 1) return 'hace instantes';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

/** Minutos sin actualizar la ubicación a partir de los cuales deja de considerarse "en vivo" */
export const MINUTOS_EN_VIVO = 15;

/**
 * En vivo = compartiendo GPS y actualizado en los últimos 15 minutos.
 * Regla única para el mapa, la lista de Sigueteo y la pestaña "Mapa".
 */
export const estaEnVivo = (c: { compartiendo?: boolean; minutos_desde_actualizacion?: number | null }) =>
  Boolean(c.compartiendo) && c.minutos_desde_actualizacion != null && c.minutos_desde_actualizacion <= MINUTOS_EN_VIVO;
