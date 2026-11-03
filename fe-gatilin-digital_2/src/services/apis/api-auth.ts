import { API_URL } from '../api';

/** Datos que el backend guarda en el token */
interface TokenPayload {
  id: number;
  username: string;
  role: 'admin' | 'localizador';
  /** Expiración (segundos desde 1970) */
  exp?: number;
  cofradiaId?: number;
  cofradia_nombre?: string;
}

// Función auxiliar para decodificar JWT (sin verificar firma)
const decodeJWT = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decodificando JWT:', e);
    return null;
  }
};

// Interfaces para la autenticación
export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    rol?: 'admin' | 'localizador';
    role?: 'admin' | 'localizador'; // Backend usa 'role' en lugar de 'rol'
    cofradia_id?: number;
    cofradiaId?: number; // Backend puede usar camelCase
    cofradia_nombre?: string;
  };
  message?: string;
}

export interface User {
  id: number;
  username: string;
  rol: 'admin' | 'localizador';
  cofradia_id?: number;
  cofradia_nombre?: string;
}

/**
 * Realiza el login del usuario
 */
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al iniciar sesión',
      };
    }

    // Decodificar el JWT para obtener los datos del usuario
    const decodedToken = data.token ? decodeJWT(data.token) : null;
    
    // Normalizar la respuesta del backend
    const normalizedUser = {
      id: decodedToken?.id || data.id || 1,
      username: decodedToken?.username || credentials.username,
      rol: (decodedToken?.role || data.role || data.rol || 'admin') as 'admin' | 'localizador',
      cofradia_id: decodedToken?.cofradiaId || data.cofradiaId || data.cofradia_id || null,
      cofradia_nombre: decodedToken?.cofradia_nombre || data.cofradia_nombre || null,
    };

    // Guardar en localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    return {
      success: true,
      token: data.token,
      user: normalizedUser,
      message: data.message,
    };
  } catch (error) {
    console.error('Error en login:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor',
    };
  }
};

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

/**
 * Obtiene el usuario actual del localStorage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      // Si no hay usuario en localStorage, intentar decodificar el token
      const token = getAuthToken();
      if (!token) return null;
      
      const decodedToken = decodeJWT(token);
      if (!decodedToken) return null;
      
      // Reconstruir el usuario desde el token
      const user: User = {
        id: decodedToken.id,
        username: decodedToken.username,
        rol: decodedToken.role,
        cofradia_id: decodedToken.cofradiaId,
        cofradia_nombre: decodedToken.cofradia_nombre,
      };
      
      // Guardar en localStorage para la próxima vez
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Obtiene el token de autenticación
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  // Token vencido: se limpia la sesión para pedir login de nuevo
  const exp = decodeJWT(token)?.exp;
  if (typeof exp === 'number' && exp * 1000 < Date.now()) {
    logout();
    return false;
  }
  return true;
};

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (role: 'admin' | 'localizador'): boolean => {
  const user = getCurrentUser();
  return user?.rol === role;
};

/**
 * Headers con autorización para peticiones protegidas
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Headers de autorización para FormData (sin Content-Type)
 */
export const getAuthHeadersForFormData = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
};

