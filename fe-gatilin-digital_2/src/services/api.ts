// URL Base del Backend
// Al tenerla aquí, si cambias de localhost a producción, solo editas este archivo.
// En desarrollo (npm run dev) se toma de .env.development -> http://localhost:5000
// En build de producción, si no hay variable, se usa el backend publicado.
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gatilinback.sistemasudh.com';

// URL para las peticiones API (BASE_URL + /api)
export const API_URL = `${BASE_URL}/api`;

// Aquí podrías agregar funciones helpers compartidas, por ejemplo:
// export const getAuthHeaders = () => { ... }