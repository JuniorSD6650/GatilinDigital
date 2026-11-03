'use client';

// Página propia de cada cofradía: /cofradia?slug=negritos-...
// (el sitio es estático, por eso el slug va como parámetro y no en la ruta)
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CofradiaDetail from '@/components/CofradiaDetail';
import { getCofradiaBySlug, getCofradiaDetail, type CofradiaDetalle } from '@/services/apis/api-normal';

function CofradiaPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get('slug') || '';
  const [detail, setDetail] = useState<CofradiaDetalle | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'no-existe'>('cargando');

  useEffect(() => {
    let activo = true;
    (async () => {
      // Acepta también un id numérico (enlaces antiguos)
      const data = /^\d+$/.test(slug) ? await getCofradiaDetail(Number(slug)) : slug ? await getCofradiaBySlug(slug) : null;
      if (!activo) return;
      setDetail(data);
      setEstado(data ? 'ok' : 'no-existe');
      if (data) document.title = `${data.nickname_cofradia} · Gatilín Digital`;
    })();
    return () => {
      activo = false;
    };
  }, [slug]);

  if (estado === 'no-existe') {
    return (
      <div className="container-fest py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-white">No encontramos esta cofradía</h1>
        <p className="mt-2 text-white/60">Puede que el enlace esté incompleto o que la cofradía haya cambiado de nombre.</p>
        <Link href="/sigueteo" className="btn mt-6 inline-flex bg-oro px-6 py-3 text-noche">Ver todas las cofradías</Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {detail ? (
        <CofradiaDetail detail={detail} onBack={() => router.push('/sigueteo')} backLabel="Ver todas las cofradías" />
      ) : (
        <div className="container-fest pt-8">
          <div className="h-72 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
        </div>
      )}
    </div>
  );
}

export default function CofradiaPage() {
  return (
    <Suspense fallback={<div className="container-fest pt-8"><div className="h-72 animate-pulse rounded-3xl bg-white/[0.04]" /></div>}>
      <CofradiaPageContent />
    </Suspense>
  );
}
