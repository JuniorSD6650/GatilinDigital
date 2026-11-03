import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Cintas from '@/components/decor/Cintas';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca (escritorio) */}
      <aside className="relative isolate hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/negritos-de-huanuco-baile-tradicional.webp" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-noche via-noche/70 to-noche/40" />
        <Cintas className="pointer-events-none absolute -top-2 right-10 h-64 w-28" count={7} />

        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-3 self-start">
            <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
            <span className="font-display text-2xl font-semibold text-white">
              Gatilín<span className="text-oro">Digital</span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="eyebrow text-oro">Panel de gestión</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white">
              Administra la festividad y mantén informados a los seguidores.
            </h1>
            <p className="mt-4 text-white/65">Acceso exclusivo para administradores y localizadores de cofradías.</p>
          </div>
        </div>
        <div className="plumaje-band absolute inset-x-0 bottom-0" />
      </aside>

      {/* Formulario */}
      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 lg:hidden">
          <div className="plumaje-band" />
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
