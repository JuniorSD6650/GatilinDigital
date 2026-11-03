'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getEstadisticas, type Estadisticas } from '@/services/apis/api-admin';
import {
  IconChurch, IconMask, IconCalendar, IconClipboard, IconNeedle, IconUserPlus, IconBellRing, IconKey,
  IconAlert, IconArrowRight, IconGlobe, IconSettings,
} from '@/components/ui/Icons';
import { LoadingState } from '@/components/admin/AdminUI';

type IconCmp = (p: { className?: string }) => React.ReactElement;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getEstadisticas();
        setStats(data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <LoadingState label="Cargando estadísticas..." />;

  if (error || !stats) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
        <IconAlert className="w-5 h-5 shrink-0" />
        {error || 'No se pudieron cargar las estadísticas'}
      </div>
    );
  }

  const cards: { title: string; value: number; icon: IconCmp; color: string; href: string; badge?: number }[] = [
    { title: 'Cofradías', value: stats.totalCofradias, icon: IconChurch, color: '#4f86ff', href: '/admin/cofradias' },
    { title: 'Cofrades', value: stats.totalCofrades, icon: IconMask, color: '#19c26b', href: '/admin/cofrades' },
    { title: 'Eventos', value: stats.totalEventos, icon: IconCalendar, color: '#b45cf0', href: '/admin/eventos' },
    {
      title: 'Reportes',
      value: stats.totalReportes,
      icon: IconClipboard,
      color: '#ff7a1a',
      href: '/admin/reportes',
      badge: stats.reportesPendientes > 0 ? stats.reportesPendientes : undefined,
    },
    { title: 'Bordadurías', value: stats.totalBordadurias, icon: IconNeedle, color: '#f2c14e', href: '/admin/bordadurias' },
    { title: 'Participantes', value: stats.totalParticipantes, icon: IconUserPlus, color: '#12c7e6', href: '/admin/participantes' },
    { title: 'Eventos próximos', value: stats.eventosProximos, icon: IconBellRing, color: '#ff1f8f', href: '/admin/eventos' },
    { title: 'Localizadores', value: stats.totalLocalizadores, icon: IconKey, color: '#2dd4bf', href: '/admin/usuarios' },
  ];

  const quick: { label: string; icon: IconCmp; href: string }[] = [
    { label: 'Gestionar cofradías', icon: IconChurch, href: '/admin/cofradias' },
    { label: 'Gestionar cofrades', icon: IconMask, href: '/admin/cofrades' },
    { label: 'Gestionar eventos', icon: IconCalendar, href: '/admin/eventos' },
    { label: 'Ver reportes', icon: IconClipboard, href: '/admin/reportes' },
    { label: 'Gestionar bordadurías', icon: IconNeedle, href: '/admin/bordadurias' },
    { label: 'Participantes', icon: IconUserPlus, href: '/admin/participantes' },
    { label: 'Localizadores', icon: IconKey, href: '/admin/usuarios' },
    { label: 'Configuración del sitio', icon: IconSettings, href: '/admin/configuracion' },
    { label: 'Ver sitio público', icon: IconGlobe, href: '/' },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Bienvenido al panel de administración</h2>
        <p className="mt-1 text-white/55">Gestiona las cofradías, eventos y reportes de la festividad.</p>
      </div>

      {/* Alerta de reportes pendientes */}
      {stats.reportesPendientes > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/20 text-orange-300">
            <IconAlert className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-orange-200">
              Tienes {stats.reportesPendientes} {stats.reportesPendientes === 1 ? 'reporte pendiente' : 'reportes pendientes'}
            </p>
            <p className="text-sm text-white/60">Revisa y gestiona los reportes enviados durante el festival.</p>
          </div>
          <Link
            href="/admin/reportes"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500/40 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/30"
          >
            Ver reportes <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              href={c.href}
              className="group relative rounded-2xl border border-white/10 bg-negrito-card p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 sm:p-5"
            >
              {c.badge !== undefined && (
                <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {c.badge > 99 ? '99+' : c.badge} nuevos
                </span>
              )}
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: `${c.color}1f`, color: c.color }}
              >
                <Icon className="w-5 h-5" />
              </span>
              <p className="mt-4 text-3xl font-semibold tabular-nums text-white">{c.value}</p>
              <p className="mt-0.5 flex items-center justify-between text-sm text-white/55">
                {c.title}
                <IconArrowRight className="w-4 h-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
            </Link>
          );
        })}
      </div>

      {/* Accesos rápidos */}
      <section className="rounded-2xl border border-white/10 bg-negrito-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white">Accesos rápidos</h3>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.label}
                href={q.href}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-sm font-medium text-white/85 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
              >
                <Icon className="w-5 h-5 text-white/45" />
                {q.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
