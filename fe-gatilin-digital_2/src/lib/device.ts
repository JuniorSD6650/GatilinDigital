// Identificador aleatorio y anónimo de este dispositivo (para "un voto por día").
// No contiene datos personales; si el almacenamiento falla se usa uno temporal.
const KEY = 'gatilin_device_id';
let memoria: string | null = null;

const generar = () => {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* sin crypto.randomUUID */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

export const getDeviceId = (): string => {
  if (memoria) return memoria;
  try {
    const guardado = localStorage.getItem(KEY);
    if (guardado && /^[A-Za-z0-9-]{16,64}$/.test(guardado)) return (memoria = guardado);
    const nuevo = generar();
    localStorage.setItem(KEY, nuevo);
    return (memoria = nuevo);
  } catch {
    return (memoria = generar());
  }
};
