// URL Base del Backend
// Al tenerla aquí, si cambias de localhost a producción, solo editas este archivo.
export const BASE_URL = 'http://localhost:5000';
// export const BASE_URL = 'https://gatilinback.sistemasudh.com';

// URL para las peticiones API (BASE_URL + /api)
export const API_URL = `${BASE_URL}/api`;

// Aquí podrías agregar funciones helpers compartidas, por ejemplo:
// export const getAuthHeaders = () => { ... }