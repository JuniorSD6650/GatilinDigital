'use client';

// El Mapa ahora es una pestaña de Sigueteo. Esta ruta se conserva para que sigan
// funcionando los enlaces antiguos y las notificaciones (/mapa?cofradia=slug|id).
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Redireccion() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const cofradia = params.get('cofradia');
    router.replace(`/sigueteo?vista=mapa${cofradia ? `&cofradia_mapa=${encodeURIComponent(cofradia)}` : ''}`);
  }, [params, router]);
  return <p className="container-fest pt-10 text-sm text-white/55">Abriendo el mapa…</p>;
}

export default function MapaRedirect() {
  return (
    <Suspense fallback={null}>
      <Redireccion />
    </Suspense>
  );
}
