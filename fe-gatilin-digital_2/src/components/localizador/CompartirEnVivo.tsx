'use client';

// Comparte la ubicación GPS del localizador en tiempo real.
// Envía la posición como máximo cada 15 s (o antes si se movió más de 25 m),
// y mantiene la pantalla encendida mientras comparte (Wake Lock).
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/services/http';
import { IconNavigation, IconPin, Spinner } from '@/components/ui/Icons';

const INTERVALO_MIN_MS = 15_000;
const INTERVALO_MAX_MS = 60_000;
const DISTANCIA_MIN_M = 25;

const distanciaM = (a: GeolocationCoordinates, b: GeolocationCoordinates) => {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

type WakeLockSentinelLike = { release: () => Promise<void> } | null;

export default function CompartirEnVivo({ onActualizado }: { onActualizado?: (link: string) => void }) {
  const [activo, setActivo] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [error, setError] = useState('');
  const [ultimoEnvio, setUltimoEnvio] = useState<Date | null>(null);
  const [precision, setPrecision] = useState<number | null>(null);
  const [envios, setEnvios] = useState(0);
  const [pantallaFija, setPantallaFija] = useState(false);
  const [, forzarRender] = useState(0);

  const watchRef = useRef<number | null>(null);
  const ultimoRef = useRef<{ coords: GeolocationCoordinates; t: number } | null>(null);
  const pendienteRef = useRef<GeolocationPosition | null>(null);
  const enviandoRef = useRef(false);
  const wakeRef = useRef<WakeLockSentinelLike>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pedirWakeLock = useCallback(async () => {
    try {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock;
      if (!wl) return;
      wakeRef.current = await wl.request('screen');
      setPantallaFija(true);
    } catch {
      setPantallaFija(false);
    }
  }, []);

  const enviar = useCallback(async (pos: GeolocationPosition, forzar = false) => {
    const ahora = Date.now();
    const prev = ultimoRef.current;
    if (!forzar && prev) {
      const dt = ahora - prev.t;
      const movido = distanciaM(prev.coords, pos.coords);
      if (dt < INTERVALO_MIN_MS) return;
      if (movido < DISTANCIA_MIN_M && dt < INTERVALO_MAX_MS) return;
    }
    if (enviandoRef.current) {
      pendienteRef.current = pos;
      return;
    }
    enviandoRef.current = true;
    try {
      const r = await apiFetch<{ ubicacion_link: string }>('/cofradia/mi-ubicacion', {
        method: 'PATCH',
        body: { lat: pos.coords.latitude, lng: pos.coords.longitude, precision: Math.round(pos.coords.accuracy) },
      });
      ultimoRef.current = { coords: pos.coords, t: ahora };
      setUltimoEnvio(new Date());
      setEnvios((n) => n + 1);
      setError('');
      onActualizado?.(r.ubicacion_link);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      enviandoRef.current = false;
    }
  }, [onActualizado]);

  const detenerLocal = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
    setPantallaFija(false);
    setActivo(false);
  }, []);

  const iniciar = () => {
    setError('');
    if (!('geolocation' in navigator)) {
      setError('Este navegador no permite obtener la ubicación GPS. Usa el enlace de Google Maps.');
      return;
    }
    setIniciando(true);
    let primera = true;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPrecision(Math.round(pos.coords.accuracy));
        pendienteRef.current = pos;
        if (primera) {
          primera = false;
          setIniciando(false);
          setActivo(true);
          pedirWakeLock();
          enviar(pos, true);
        } else {
          enviar(pos);
        }
      },
      (err) => {
        setIniciando(false);
        detenerLocal();
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Debes permitir el acceso a la ubicación en tu navegador (ícono del candado junto a la dirección).'
            : err.code === err.TIMEOUT
              ? 'El GPS tardó demasiado. Sal a un lugar abierto e intenta otra vez.'
              : 'No se pudo obtener la ubicación GPS.'
        );
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 }
    );
    // Aunque el teléfono no se mueva, reenviar cada minuto para mostrar "en vivo"
    timerRef.current = setInterval(() => {
      if (pendienteRef.current) enviar(pendienteRef.current);
      forzarRender((n) => n + 1);
    }, INTERVALO_MIN_MS);
  };

  const detener = async () => {
    detenerLocal();
    try {
      await apiFetch('/cofradia/mi-ubicacion', { method: 'DELETE' });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // El Wake Lock se pierde al cambiar de pestaña: se vuelve a pedir al regresar
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && activo) {
        pedirWakeLock();
        if (pendienteRef.current) enviar(pendienteRef.current, true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [activo, pedirWakeLock, enviar]);

  // Avisar antes de cerrar la página mientras se comparte
  useEffect(() => {
    if (!activo) return;
    const onBefore = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [activo]);

  useEffect(() => () => detenerLocal(), [detenerLocal]);

  const hace = ultimoEnvio ? Math.round((Date.now() - ultimoEnvio.getTime()) / 1000) : null;

  return (
    <div className={`rounded-2xl border p-6 ${activo ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-negrito-card'}`}>
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${activo ? 'bg-emerald-400/20 text-emerald-300' : 'bg-festivo-cyan/15 text-festivo-cyan'}`}>
          <IconNavigation className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-white">
            {activo ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" /> Compartiendo en vivo
              </span>
            ) : (
              'Compartir ubicación GPS en vivo'
            )}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {activo
              ? 'Tu cofradía aparece en el mapa público y se actualiza sola mientras caminan.'
              : 'Recomendado: un solo toque y el público verá a tu cofradía moverse en el mapa. Ya no hace falta pegar enlaces.'}
          </p>
        </div>
      </div>

      {activo && (
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-black/25 p-2.5">
            <dt className="text-[11px] uppercase tracking-wider text-gray-400">Último envío</dt>
            <dd className="text-sm font-semibold text-white">{hace === null ? '—' : hace < 5 ? 'ahora' : `hace ${hace} s`}</dd>
          </div>
          <div className="rounded-xl bg-black/25 p-2.5">
            <dt className="text-[11px] uppercase tracking-wider text-gray-400">Precisión</dt>
            <dd className={`text-sm font-semibold ${precision !== null && precision > 100 ? 'text-amber-300' : 'text-white'}`}>{precision === null ? '—' : `±${precision} m`}</dd>
          </div>
          <div className="rounded-xl bg-black/25 p-2.5">
            <dt className="text-[11px] uppercase tracking-wider text-gray-400">Envíos</dt>
            <dd className="text-sm font-semibold text-white">{envios}</dd>
          </div>
        </dl>
      )}

      {error && <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {activo ? (
        <>
          <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
            Mantén esta página abierta durante el recorrido. {pantallaFija ? 'La pantalla se mantendrá encendida.' : 'Si la pantalla se apaga, el envío se pausa hasta que vuelvas a abrirla.'}
          </p>
          <button type="button" onClick={detener} className="mt-4 w-full rounded-xl border border-red-400/40 bg-red-500/15 py-3.5 font-bold text-red-200 transition-colors hover:bg-red-500/25">
            Detener y terminar recorrido
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={iniciar}
          disabled={iniciando}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-festivo-cyan py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
        >
          {iniciando ? <><Spinner className="h-5 w-5" /> Buscando señal GPS…</> : <><IconPin className="h-5 w-5" /> Iniciar recorrido en vivo</>}
        </button>
      )}
    </div>
  );
}
