'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logout, getCurrentUser } from '@/services/apis/api-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconGlobe, IconLogout } from '@/components/ui/Icons';

export default function LocalizadorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [cofradiaNombre, setCofradiaNombre] = useState('');

  useEffect(() => {
    // La sesión vive en localStorage: solo se puede leer en el navegador, después de montar
    const user = getCurrentUser();
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="min-h-screen bg-noche [--font-display:var(--font-body)]">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-noche/85 backdrop-blur-xl">
          <div className="plumaje-band h-[3px]" />
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <Image src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-white sm:text-base">Panel de localizador</h1>
                <p className="truncate text-xs text-white/50">{cofradiaNombre}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sigueteo"
                title="Ver sitio público"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                <IconGlobe className="w-4 h-4" />
                <span className="hidden sm:inline">Ver sitio</span>
              </Link>
              <div className="hidden items-center gap-2 border-l border-white/10 pl-3 md:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-festivo-cyan/15 text-sm font-bold text-festivo-cyan">
                  {username.charAt(0).toUpperCase() || 'L'}
                </span>
                <span className="text-sm text-white/80">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
              >
                <IconLogout className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
