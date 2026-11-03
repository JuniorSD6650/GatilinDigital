// Utilidades del mapa sin dependencia de Leaflet (seguras para el render estático)
import type { CofradiaMapa } from '@/services/apis/api-normal';

export const HUANUCO: [number, number] = [-9.9306, -76.2422];

export const haceCuanto = (min: number | null) => {
  if (min === null) return 'sin datos';
  if (min < 1) return 'hace instantes';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

/** En vivo = compartiendo GPS y actualizado en los últimos 15 minutos */
export const estaEnVivo = (c: CofradiaMapa) =>
  c.compartiendo && c.minutos_desde_actualizacion !== null && c.minutos_desde_actualizacion <= 15;
