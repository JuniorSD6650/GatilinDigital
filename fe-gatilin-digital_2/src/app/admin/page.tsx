'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEstadisticas, type Estadisticas } from '@/services/apis/api-admin';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getEstadisticas();
      setStats(data);
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
        {error || 'No se pudieron cargar las estadísticas'}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Título */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
          Bienvenido al Panel de Administración
        </h2>
        <p className="text-gray-400">
          Gestiona las cofradías, eventos y reportes de la festividad
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Cofradías */}
        <StatCard
          title="Cofradías"
          value={stats.totalCofradias}
          icon="⛪"
          color="from-blue-500 to-cyan-500"
          onClick={() => router.push('/admin/cofradias')}
        />

        {/* Cofrades */}
        <StatCard
          title="Cofrades"
          value={stats.totalCofrades}
          icon="👥"
          color="from-green-500 to-emerald-500"
          onClick={() => router.push('/admin/cofrades')}
        />

        {/* Eventos */}
        <StatCard
          title="Eventos"
          value={stats.totalEventos}
          icon="📅"
          color="from-purple-500 to-pink-500"
          onClick={() => router.push('/admin/eventos')}
        />

        {/* Reportes */}
        <StatCard
          title="Reportes"
          value={stats.totalReportes}
          icon="📋"
          color="from-orange-500 to-red-500"
          onClick={() => router.push('/admin/reportes')}
          badge={stats.reportesPendientes > 0 ? stats.reportesPendientes : undefined}
        />

        {/* Bordadurías */}
        <StatCard
          title="Bordadurías"
          value={stats.totalBordadurias}
          icon="🧵"
          color="from-yellow-500 to-amber-500"
          onClick={() => router.push('/admin/bordadurias')}
        />

        {/* Participantes */}
        <StatCard
          title="Participantes"
          value={stats.totalParticipantes}
          icon="🎭"
          color="from-indigo-500 to-purple-500"
          onClick={() => router.push('/admin/participantes')}
        />

        {/* Eventos Próximos */}
        <StatCard
          title="Eventos Próximos"
          value={stats.eventosProximos}
          icon="🔔"
          color="from-pink-500 to-rose-500"
          onClick={() => router.push('/admin/eventos')}
        />

        {/* Usuarios Localizadores */}
        <StatCard
          title="Localizadores"
          value={stats.totalLocalizadores}
          icon="🔑"
          color="from-teal-500 to-cyan-500"
          onClick={() => router.push('/admin/usuarios')}
        />

      </div>

      {/* Accesos Rápidos */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <QuickAction
            label="Gestionar Cofradías"
            icon="⛪"
            onClick={() => router.push('/admin/cofradias')}
          />
          
          <QuickAction
            label="Gestionar Cofrades"
            icon="👥"
            onClick={() => router.push('/admin/cofrades')}
          />
          
          <QuickAction
            label="Gestionar Eventos"
            icon="📅"
            onClick={() => router.push('/admin/eventos')}
          />

          <QuickAction
            label="Ver Reportes"
            icon="📋"
            onClick={() => router.push('/admin/reportes')}
          />
          
          <QuickAction
            label="Gestionar Bordadurías"
            icon="🧵"
            onClick={() => router.push('/admin/bordadurias')}
          />

          <QuickAction
            label="Participantes"
            icon="🎭"
            onClick={() => router.push('/admin/participantes')}
          />

          <QuickAction
            label="Localizadores"
            icon="🔑"
            onClick={() => router.push('/admin/usuarios')}
          />
          
          <QuickAction
            label="Ver Sitio Público"
            icon="🌐"
            onClick={() => router.push('/')}
          />

        </div>
      </div>

      {/* Resumen de Reportes Pendientes */}
      {stats.reportesPendientes > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="text-2xl sm:text-3xl">⚠️</div>
            <div className="flex-1">
              <h4 className="text-base sm:text-lg font-display font-bold text-orange-400 mb-2">
                Tienes {stats.reportesPendientes} {stats.reportesPendientes === 1 ? 'reporte pendiente' : 'reportes pendientes'}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Revisa y gestiona los reportes enviados durante el festival.
              </p>
              <button
                onClick={() => router.push('/admin/reportes')}
                className="mt-3 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm font-medium border border-orange-500/30"
              >
                Ver Reportes →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  onClick,
  badge
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-negrito-card border border-white/10 rounded-2xl p-6 
        ${onClick ? 'cursor-pointer hover:scale-105 hover:border-white/20' : ''}
        transition-all duration-300 relative
      `}
    >
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-negrito-bg">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className={`text-4xl bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
    </div>
  );
}

// Componente de acción rápida
function QuickAction({ 
  label, 
  icon, 
  onClick 
}: { 
  label: string; 
  icon: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-neutral-900 border border-white/10 rounded-xl hover:bg-neutral-800 hover:border-white/20 transition-all text-left"
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );
}
