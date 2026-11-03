// URL base del backend.
// Producción: el mismo servidor sirve la web y la API, así que las rutas son
// relativas ('' -> '/api/...', '/uploads/...').
// Desarrollo (npm run dev): .env.development apunta al backend local (http://localhost:5000).
export const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

// URL para las peticiones API (BASE_URL + /api)
export const API_URL = `${BASE_URL}/api`;

// URL absoluta (necesaria para enlaces que se comparten fuera de la app, p. ej. WhatsApp)
export const absoluteUrl = (ruta: string) => {
  if (BASE_URL) return `${BASE_URL}${ruta}`;
  return typeof window !== 'undefined' ? `${window.location.origin}${ruta}` : ruta;
};
