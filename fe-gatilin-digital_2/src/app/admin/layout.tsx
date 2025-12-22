'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logout, getCurrentUser } from '@/services/apis/api-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute allowedRole="admin">
      <div className="fixed inset-0 bg-negrito-bg overflow-hidden">
        
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-negrito-card border-r border-white/10 
          transition-all duration-300 
          fixed left-0 top-0 h-full z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          
          {/* Logo / Título */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-festivo-gold to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-sm font-display font-bold text-festivo-gold">
                    Panel Admin
                  </h1>
                  <p className="text-xs text-gray-400">Gatilín Digital</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-festivo-gold to-yellow-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-2xl">⚙️</span>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/10 hidden lg:block"
          >
            <span className="text-xl">{sidebarOpen ? '◀' : '▶'}</span>
          </button>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors border-b border-white/10 lg:hidden"
          >
            <span className="text-xl">✕</span>
          </button>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              <NavLink href="/admin" label="Dashboard" icon="📊" collapsed={!sidebarOpen} />
              <NavLink href="/admin/cofradias" label="Cofradías" icon="⛪" collapsed={!sidebarOpen} />
              <NavLink href="/admin/usuarios" label="Localizadores" icon="👥" collapsed={!sidebarOpen} />
              <NavLink href="/admin/organizaciones" label="Organizaciones" icon="🏢" collapsed={!sidebarOpen} />
              <NavLink href="/admin/bordadurias" label="Bordadurías" icon="🧵" collapsed={!sidebarOpen} />
              <NavLink href="/admin/cofrades" label="Cofrades" icon="🎭" collapsed={!sidebarOpen} />
              <NavLink href="/admin/eventos" label="Eventos" icon="📅" collapsed={!sidebarOpen} />
              <NavLink href="/admin/reportes" label="Reportes" icon="📋" collapsed={!sidebarOpen} />
              <NavLink href="/admin/participantes" label="Participantes" icon="📝" collapsed={!sidebarOpen} />
            </div>
          </nav>

          {/* User info at bottom */}
          <div className="p-4 border-t border-white/10">
            {sidebarOpen ? (
              <div className="mb-3">
                <p className="text-sm font-medium text-white truncate">{username}</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <div className="w-8 h-8 bg-festivo-gold/20 rounded-full flex items-center justify-center">
                  <span className="text-festivo-gold font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`
                w-full px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg 
                hover:bg-red-500/20 transition-colors text-sm font-medium
                ${!sidebarOpen && 'flex items-center justify-center'}
              `}
              title="Cerrar Sesión"
            >
              {sidebarOpen ? 'Cerrar Sesión' : '🚪'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`absolute inset-0 overflow-y-auto pt-16 ${sidebarOpen ? 'lg:left-64' : 'lg:left-20'} transition-all duration-300`}>
          {/* Mobile Header */}
          <div className="lg:hidden bg-negrito-card border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-festivo-gold text-2xl"
            >
              ☰
            </button>
            <h1 className="text-lg font-display font-bold text-festivo-gold">
              Panel Admin
            </h1>
            <div className="w-8 h-8 bg-festivo-gold/20 rounded-full flex items-center justify-center">
              <span className="text-festivo-gold font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <main className="p-4 lg:p-8 w-full">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}

// Componente auxiliar para links de navegación
function NavLink({ 
  href, 
  label, 
  icon, 
  collapsed 
}: { 
  href: string; 
  label: string; 
  icon: string; 
  collapsed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
        ${isActive 
          ? 'bg-festivo-gold text-negrito-bg font-bold shadow-lg shadow-festivo-gold/20' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
        ${collapsed && 'justify-center'}
      `}
      title={collapsed ? label : undefined}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="text-sm">{label}</span>}
    </a>
  );
}
