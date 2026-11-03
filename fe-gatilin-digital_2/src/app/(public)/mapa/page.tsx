'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getMapaCofradias, type CofradiaMapa } from '@/services/apis/api-normal';
import { useFavoritas } from '@/lib/favoritos';
import { getDisplayColor } from '@/lib/color';
import { useAlert } from '@/components/AlertContext';
import { IconNavigation, IconSearch, IconStarFilled, IconX, Spinner } from '@/components/ui/Icons';
import { estaEnVivo, haceCuanto } from '@/components/mapa/utils';

// Leaflet usa window: se carga solo en el navegador
const MapaLeaflet = dynamic(() => import('@/components/mapa/MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-white/[0.03] text-sm text-white/50">Cargando mapa…</div>
  ),
});

const REFRESCO_MS = 30_000;
const RADIO_CERCA_M = 500;

// Distancia en metros entre dos coordenadas (fórmula de Haversine)
const distanciaM = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const normalizar = (s?: string | null) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function MapaContent() {
  const params = useSearchParams();
  const { showAlert } = useAlert();
  const favoritas = useFavoritas();

  const [cofradias, setCofradias] = useState<CofradiaMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ultimaCarga, setUltimaCarga] = useState<Date | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [soloVivo, setSoloVivo] = useState(false);
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [distrito, setDistrito] = useState('');
  const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);

  const [miUbicacion, setMiUbicacion] = useState<{ lat: number; lng: number; precision: number } | null>(null);
  const [siguiendoYo, setSiguiendoYo] = useState(false);
  const [centrarEnMi, setCentrarEnMi] = useState(0);
  const watchRef = useRef<number | null>(null);
  const avisadasRef = useRef<Set<number>>(new Set());

  // Carga + refresco automático (se pausa con la pestaña oculta)
  const cargar = useCallback(async () => {
    try {
      const data = await getMapaCofradias();
      setCofradias(data);
      setUltimaCarga(new Date());
      setError('');
    } catch {
      setError('No se pudo actualizar el mapa. Reintentando…');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') cargar();
    }, REFRESCO_MS);
    const onVis = () => document.visibilityState === 'visible' && cargar();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [cargar]);

  // ?cofradia=slug|id → seleccionar al cargar
  const pedida = params.get('cofradia');
  const pedidaAplicada = useRef(false);
  useEffect(() => {
    if (!pedida || pedidaAplicada.current || cofradias.length === 0) return;
    const c = cofradias.find((x) => x.slug === pedida || String(x.id) === pedida);
    pedidaAplicada.current = true;
    if (c) {
      if (c.lat === null) showAlert('info', `${c.nickname_cofradia} todavía no compartió su ubicación.`);
      else setSeleccionadaId(c.id);
    }
  }, [pedida, cofradias, showAlert]);

  const distritos = useMemo(
    () => [...new Set(cofradias.map((c) => c.distrito).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
    [cofradias]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return cofradias.filter((c) => {
      if (soloVivo && !estaEnVivo(c)) return false;
      if (soloFavoritas && !favoritas.includes(c.id)) return false;
      if (distrito && c.distrito !== distrito) return false;
      if (q && !normalizar(c.nickname_cofradia).includes(q)) return false;
      return true;
    });
  }, [cofradias, busqueda, soloVivo, soloFavoritas, distrito, favoritas]);

  const conUbicacion = filtradas.filter((c) => c.lat !== null);
  const sinUbicacion = filtradas.length - conUbicacion.length;
  const enVivo = cofradias.filter(estaEnVivo).length;

  // ---- Mi ubicación ----
  const detenerYo = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    setSiguiendoYo(false);
    setMiUbicacion(null);
  }, []);

  const iniciarYo = () => {
    if (!('geolocation' in navigator)) {
      showAlert('error', 'Tu navegador no permite obtener la ubicación.');
      return;
    }
    setSiguiendoYo(true);
    let primera = true;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setMiUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude, precision: Math.round(pos.coords.accuracy) });
        if (primera) {
          primera = false;
          setCentrarEnMi((n) => n + 1);
        }
      },
      (err) => {
        detenerYo();
        showAlert('error', err.code === err.PERMISSION_DENIED ? 'No diste permiso para usar tu ubicación.' : 'No se pudo obtener tu ubicación.');
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 }
    );
  };

  useEffect(() => () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  // ---- Aviso de cercanía: una cofradía favorita en vivo a menos de 500 m ----
  useEffect(() => {
    if (!miUbicacion) return;
    for (const c of cofradias) {
      if (!favoritas.includes(c.id) || !estaEnVivo(c) || c.lat === null || c.lng === null) continue;
      if (avisadasRef.current.has(c.id)) continue;
      const d = distanciaM(miUbicacion, { lat: c.lat, lng: c.lng });
      if (d <= RADIO_CERCA_M) {
        avisadasRef.current.add(c.id);
        const texto = `${c.nickname_cofradia} está a unos ${Math.round(d / 10) * 10} m de ti`;
        showAlert('success', `¡${texto}!`);
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker?.getRegistration().then((reg) => {
              if (reg) reg.showNotification('¡Tu cofradía está cerca!', { body: texto, tag: `cerca-${c.id}`, icon: '/icons/icon-192.png' });
              else new Notification('¡Tu cofradía está cerca!', { body: texto });
            });
          }
          navigator.vibrate?.(200);
        } catch {
          /* notificaciones no disponibles */
        }
      }
    }
  }, [miUbicacion, cofradias, favoritas, showAlert]);

  const seleccionar = useCallback((id: number) => setSeleccionadaId(id), []);

  return (
    <div className="container-fest pb-16 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[#12c7e6]">En vivo</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-white sm:text-4xl">Mapa de cofradías</h1>
          <p className="mt-1 text-sm text-white/60">
            {enVivo > 0 ? `${enVivo} ${enVivo === 1 ? 'cofradía está' : 'cofradías están'} compartiendo su recorrido ahora.` : 'Ninguna cofradía está compartiendo su recorrido en este momento.'}
            {ultimaCarga && <span className="text-white/40"> · Actualizado {ultimaCarga.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={siguiendoYo ? detenerYo : iniciarYo}
          className={`btn shrink-0 px-4 py-2.5 text-sm ${siguiendoYo ? 'bg-[#4f86ff] text-white' : 'btn-ghost'}`}
        >
          <IconNavigation className="h-4 w-4" />
          {siguiendoYo ? 'Ocultar mi ubicación' : 'Mostrar mi ubicación'}
        </button>
      </div>

      {/* Filtros */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative w-full sm:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cofradía…"
            aria-label="Buscar cofradía"
            className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={soloVivo} onClick={() => setSoloVivo((v) => !v)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${soloVivo ? 'border-transparent bg-emerald-400 text-noche' : 'border-white/10 bg-white/[0.04] text-white/70'}`}>
            ● Solo en vivo
          </button>
          <button type="button" aria-pressed={soloFavoritas} onClick={() => setSoloFavoritas((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium ${soloFavoritas ? 'border-transparent bg-oro text-noche' : 'border-white/10 bg-white/[0.04] text-white/70'}`}>
            <IconStarFilled className="h-3.5 w-3.5" /> Mis favoritas {favoritas.length > 0 && `(${favoritas.length})`}
          </button>
          {distritos.length > 1 && (
            <select value={distrito} onChange={(e) => setDistrito(e.target.value)} aria-label="Distrito"
              className="h-9 rounded-full border border-white/10 bg-noche px-3 text-sm text-white/80">
              <option value="">Todos los distritos</option>
              {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative h-[62vh] min-h-[380px] overflow-hidden rounded-2xl border border-white/10">
          <MapaLeaflet
            cofradias={conUbicacion}
            seleccionadaId={seleccionadaId}
            onSelect={seleccionar}
            miUbicacion={miUbicacion}
            centrarEnMi={centrarEnMi}
          />
          {cargando && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-noche/60"><Spinner className="h-6 w-6" /></div>
          )}
        </div>

        {/* Lista */}
        <aside className="card-fest max-h-[62vh] overflow-y-auto p-2" aria-label="Cofradías en el mapa">
          {filtradas.length === 0 && !cargando && (
            <div className="p-6 text-center text-sm text-white/55">
              No hay cofradías con estos filtros.
              {(soloVivo || soloFavoritas || distrito || busqueda) && (
                <button type="button" className="mt-3 inline-flex items-center gap-1 text-oro" onClick={() => { setSoloVivo(false); setSoloFavoritas(false); setDistrito(''); setBusqueda(''); }}>
                  <IconX className="h-3.5 w-3.5" /> Quitar filtros
                </button>
              )}
            </div>
          )}
          <ul className="space-y-1">
            {[...filtradas]
              .sort((a, b) => Number(estaEnVivo(b)) - Number(estaEnVivo(a)) || Number(b.lat !== null) - Number(a.lat !== null))
              .map((c) => {
                const color = getDisplayColor(c.color);
                const tiene = c.lat !== null;
                const vivo = estaEnVivo(c);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={!tiene}
                      onClick={() => setSeleccionadaId(c.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${seleccionadaId === c.id ? 'bg-white/10' : 'hover:bg-white/5'} disabled:cursor-default disabled:opacity-50`}
                    >
                      <span className={`h-3 w-3 shrink-0 rounded-full ${vivo ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
                          {favoritas.includes(c.id) && <IconStarFilled className="h-3 w-3 shrink-0 text-oro" />}
                          <span className="truncate">{c.nickname_cofradia}</span>
                        </span>
                        <span className="block text-xs text-white/50">
                          {vivo ? <span className="font-semibold text-emerald-300">En vivo · </span> : null}
                          {tiene ? `Actualizado ${haceCuanto(c.minutos_desde_actualizacion)}` : 'Sin ubicación todavía'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
          {sinUbicacion > 0 && (
            <p className="px-3 pb-2 pt-3 text-xs text-white/40">
              {sinUbicacion} {sinUbicacion === 1 ? 'cofradía aún no comparte' : 'cofradías aún no comparten'} su ubicación.
            </p>
          )}
        </aside>
      </div>

      <p className="mt-4 text-xs text-white/40">
        Las ubicaciones las comparten los propios localizadores de cada cofradía. Marca tus cofradías como favoritas desde su{' '}
        <Link href="/sigueteo" className="text-white/70 underline">página</Link> y activa «Mostrar mi ubicación» para que te avisemos cuando estén cerca.
      </p>
    </div>
  );
}

export default function MapaPage() {
  return (
    <Suspense fallback={null}>
      <MapaContent />
    </Suspense>
  );
}
