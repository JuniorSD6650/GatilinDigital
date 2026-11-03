'use client';

// Cofradías favoritas del visitante (guardadas en este navegador).
import { useEffect, useState } from 'react';

const KEY = 'gatilin_favoritas';
const EVENTO = 'gatilin:favoritas';

export const getFavoritas = (): number[] => {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
};

const guardar = (ids: number[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* almacenamiento no disponible */
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
};

export const toggleFavorita = (id: number) => {
  const actuales = getFavoritas();
  const nuevas = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id];
  guardar(nuevas);
  return nuevas;
};

/** Hook reactivo: se actualiza en todas las vistas abiertas */
export function useFavoritas() {
  const [favoritas, setFavoritas] = useState<number[]>([]);
  useEffect(() => {
    const leer = () => setFavoritas(getFavoritas());
    leer();
    window.addEventListener(EVENTO, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(EVENTO, leer);
      window.removeEventListener('storage', leer);
    };
  }, []);
  return favoritas;
}
