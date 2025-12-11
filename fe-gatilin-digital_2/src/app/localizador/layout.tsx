'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logout, getCurrentUser } from '@/services/apis/api-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LocalizadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [cofradiaNombre, setCofradiaNombre] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsername(user.username);
      setCofradiaNombre(user.cofradia_nombre || 'Sin asignar');
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute allowedRole="localizador">
      <div className="min-h-screen bg-negrito-bg">
        
        {/* Header de Localizador */}
        <header className="bg-negrito-card border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              
              {/* Logo / Título */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-festivo-cyan to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-festivo-cyan">
                    Panel de Localizador
                  </h1>
                  <p className="text-xs text-gray-400">{cofradiaNombre}</p>
                </div>
              </div>

              {/* Usuario y Logout */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{username}</p>
                  <p className="text-xs text-gray-400">Localizador</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* Navegación */}
        <nav className="bg-negrito-card/50 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              <NavLink href="/localizador" label="Mi Ubicación" icon="📍" />
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

      </div>
    </ProtectedRoute>
  );
}

// Componente auxiliar para links de navegación
function NavLink({ href, label, icon, external }: { href: string; label: string; icon: string; external?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    if (!external) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
        ${isActive 
          ? 'bg-negrito-bg text-festivo-cyan border-b-2 border-festivo-cyan' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}
