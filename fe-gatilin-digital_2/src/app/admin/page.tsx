'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    cofradias: 0,
    eventos: 0,
    reportes: 0,
  });

  useEffect(() => {
    // Aquí podrías cargar estadísticas desde el backend
    // Por ahora dejamos valores de ejemplo
    setStats({
      cofradias: 25,
      eventos: 8,
      reportes: 12,
    });
  }, []);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Cofradías */}
        <StatCard
          title="Cofradías"
          value={stats.cofradias}
          icon="⛪"
          color="from-blue-500 to-cyan-500"
          onClick={() => router.push('/admin/cofradias')}
        />

        {/* Eventos */}
        <StatCard
          title="Eventos"
          value={stats.eventos}
          icon="📅"
          color="from-purple-500 to-pink-500"
        />

        {/* Reportes */}
        <StatCard
          title="Reportes"
          value={stats.reportes}
          icon="📋"
          color="from-orange-500 to-red-500"
        />

      </div>

      {/* Accesos Rápidos */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          
          <QuickAction
            label="Gestionar Cofradías"
            icon="⛪"
            onClick={() => router.push('/admin/cofradias')}
          />
          
          <QuickAction
            label="Gestionar Localizadores"
            icon="👥"
            onClick={() => router.push('/admin/usuarios')}
          />
          
          <QuickAction
            label="Gestionar Eventos"
            icon="📅"
            onClick={() => alert('Próximamente')}
          />
          
          <QuickAction
            label="Ver Sitio Público"
            icon="🌐"
            onClick={() => router.push('/')}
          />

        </div>
      </div>

      {/* Información */}
      <div className="bg-gradient-to-r from-festivo-gold/10 to-yellow-600/10 border border-festivo-gold/20 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl">💡</div>
          <div>
            <h4 className="text-base sm:text-lg font-display font-bold text-festivo-gold mb-2">
              Panel en Desarrollo
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Actualmente puedes gestionar cofradías. Más funcionalidades como eventos, 
              bordadurías y reportes se agregarán próximamente.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  onClick 
}: { 
  title: string; 
  value: number; 
  icon: string; 
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-negrito-card border border-white/10 rounded-2xl p-6 
        ${onClick ? 'cursor-pointer hover:scale-105 hover:border-white/20' : ''}
        transition-all duration-300
      `}
    >
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
