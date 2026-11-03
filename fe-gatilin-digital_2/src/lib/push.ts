'use client';

// Notificaciones push: registro del service worker y suscripción.
import { apiFetch } from '@/services/http';
import { getFavoritas } from './favoritos';

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const pushSoportado = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export const registrarSW = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (err) {
    console.warn('No se pudo registrar el service worker:', err);
    return null;
  }
};

export const suscripcionActual = async (): Promise<PushSubscription | null> => {
  if (!pushSoportado()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
};

/** Pide permiso (si hace falta), se suscribe y envía las favoritas al servidor */
export const activarNotificaciones = async (favoritas = getFavoritas()) => {
  if (!pushSoportado()) throw new Error('Tu navegador no admite notificaciones. En iPhone, instala primero la app en la pantalla de inicio.');
  const { habilitado, publicKey } = await apiFetch<{ habilitado: boolean; publicKey: string | null }>('/push/public-key');
  if (!habilitado || !publicKey) throw new Error('Las notificaciones no están disponibles por ahora.');

  const permiso = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permiso !== 'granted') throw new Error('No diste permiso para mostrar notificaciones.');

  const reg = (await navigator.serviceWorker.getRegistration()) || (await registrarSW());
  if (!reg) throw new Error('No se pudo activar el servicio de notificaciones.');
  await navigator.serviceWorker.ready;

  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) }));

  await apiFetch('/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), favoritas, avisos_eventos: true } });
  return sub;
};

/** Si ya hay suscripción, sincroniza las favoritas (sin pedir permisos) */
export const sincronizarFavoritas = async (favoritas = getFavoritas()) => {
  const sub = await suscripcionActual();
  if (!sub) return;
  await apiFetch('/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), favoritas, avisos_eventos: true } }).catch(() => {});
};

export const desactivarNotificaciones = async () => {
  const sub = await suscripcionActual();
  if (!sub) return;
  await apiFetch('/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }).catch(() => {});
  await sub.unsubscribe();
};
