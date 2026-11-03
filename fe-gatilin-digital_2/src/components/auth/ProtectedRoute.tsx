'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '@/services/apis/api-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'localizador';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Verificar rol si se especifica
    if (allowedRole) {
      const user = getCurrentUser();
      
      if (!user || user.rol !== allowedRole) {
        // Redirigir a la vista correcta según el rol del usuario
        if (user?.rol === 'admin') {
          router.push('/admin');
        } else if (user?.rol === 'localizador') {
          router.push('/localizador');
        } else {
          router.push('/login');
        }
        return;
      }
    }

    // La sesión vive en localStorage: solo se puede leer en el navegador, después de montar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, allowedRole]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-festivo-gold border-t-transparent"></div>
          <p className="text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar contenido solo si está autorizado
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
