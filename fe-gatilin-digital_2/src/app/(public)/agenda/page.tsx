'use client';

// La Agenda ahora es una pestaña de Sigueteo. Esta ruta se conserva para que
// sigan funcionando los enlaces antiguos y las notificaciones (/agenda?cofradia=ID).
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Redireccion() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const cofradia = params.get('cofradia');
    router.replace(`/sigueteo?vista=agenda${cofradia ? `&cofradia_agenda=${encodeURIComponent(cofradia)}` : ''}`);
  }, [params, router]);
  return <p className="container-fest pt-10 text-sm text-white/55">Abriendo la agenda…</p>;
}

export default function AgendaRedirect() {
  return (
    <Suspense fallback={null}>
      <Redireccion />
    </Suspense>
  );
}
