'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logout, getCurrentUser } from '@/services/apis/api-auth';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  IconDashboard, IconChurch, IconMask, IconCalendar, IconSettings, IconUserPlus, IconClipboard,
  IconNeedle, IconKey, IconLogout, IconGlobe, IconMenu, IconX, IconChevronLeft, IconChevronRight, IconHistory,
} from '@/components/ui/Icons';

type NavItem = { href: string; label: string; icon: (p: { className?: string }) => React.ReactElement };

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'General',
    items: [{ href: '/admin', label: 'Dashboard', icon: IconDashboard }],
  },
  {
    title: 'Festividad',
    items: [
      { href: '/admin/cofradias', label: 'Cofradías', icon: IconChurch },
      { href: '/admin/cofrades', label: 'Cofrades', icon: IconMask },
      { href: '/admin/eventos', label: 'Eventos', icon: IconCalendar },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { href: '/admin/participantes', label: 'Participantes', icon: IconUserPlus },
      { href: '/admin/reportes', label: 'Reportes', icon: IconClipboard },
      { href: '/admin/bordadurias', label: 'Bordadurías', icon: IconNeedle },
    ],
  },
  {
    title: 'Accesos',
    items: [
      { href: '/admin/usuarios', label: 'Localizadores', icon: IconKey },
      { href: '/admin/auditoria', label: 'Auditoría', icon: IconHistory },
    ],
  },
  {
    title: 'Configuración',
    items: [{ href: '/admin/configuracion', label: 'Configuración del sitio', icon: IconSettings }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setUsername(user.username);
  }, []);

  // Cerrar menú móvil al navegar (ajuste de estado durante el render)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileMenuOpen(false);
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const current = ALL_ITEMS.find((i) => i.href === pathname) ?? ALL_ITEMS[0];
  const collapsed = !sidebarOpen;
  const initial = username.charAt(0).toUpperCase() || 'A';

  return (
    <ProtectedRoute allowedRole="admin">
      {/* En el panel los títulos usan la tipografía sans para un aspecto más sobrio */}
      <div className="min-h-screen bg-noche [--font-display:var(--font-body)]">
        {/* Overlay móvil */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* ===== Barra lateral ===== */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#110b18]
            transition-all duration-300 lg:z-30
            ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'} w-72
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="plumaje-band h-[3px] shrink-0" />

          {/* Marca */}
          <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <Image src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-semibold text-white">Gatilín Digital</p>
              <p className="text-xs text-white/45">Panel de administración</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white lg:hidden"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Panel">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 ${collapsed ? 'lg:hidden' : ''}`}>
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <NavLink item={item} active={pathname === item.href} collapsed={collapsed} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Usuario */}
          <div className="shrink-0 border-t border-white/5 p-3">
            <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? 'lg:justify-center' : ''}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-oro/15 text-sm font-bold text-oro">{initial}</span>
              <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="truncate text-sm font-medium text-white">{username}</p>
                <p className="text-xs text-white/45">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-300/90 transition-colors hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'lg:justify-center' : ''}`}
            >
              <IconLogout className="w-5 h-5 shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>Cerrar sesión</span>
            </button>
          </div>

          {/* Colapsar (escritorio) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
            className="absolute -right-3 top-20 hidden h-6 w-6 place-items-center rounded-full border border-white/15 bg-[#1a1224] text-white/60 shadow hover:text-white lg:grid"
          >
            {sidebarOpen ? <IconChevronLeft className="w-3.5 h-3.5" /> : <IconChevronRight className="w-3.5 h-3.5" />}
          </button>
        </aside>

        {/* ===== Contenido ===== */}
        <div className={`flex min-h-screen flex-col transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
          {/* Barra superior */}
          <header className="sticky top-0 z-20 border-b border-white/5 bg-noche/85 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/80 hover:bg-white/5 lg:hidden"
              >
                <IconMenu className="w-5 h-5" />
              </button>

              {/* Ruta actual (el título grande lo pone cada vista) */}
              <nav aria-label="Ruta" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                <Link href="/admin" className="text-white/45 transition-colors hover:text-white">Panel</Link>
                {current.href !== '/admin' && (
                  <>
                    <IconChevronRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
                    <span className="truncate font-medium text-white">{current.label}</span>
                  </>
                )}
              </nav>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                <IconGlobe className="w-4 h-4" />
                <span className="hidden sm:inline">Ver sitio público</span>
              </Link>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-oro/15 text-sm font-bold text-oro lg:hidden">{initial}</span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`
        group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
        ${active ? 'bg-oro/10 font-semibold text-oro' : 'text-white/60 hover:bg-white/5 hover:text-white'}
        ${collapsed ? 'lg:justify-center lg:px-0' : ''}
      `}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-oro" />}
      <Icon className="w-5 h-5 shrink-0" />
      <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
    </Link>
  );
}
