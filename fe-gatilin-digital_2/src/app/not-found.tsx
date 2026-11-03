import Link from 'next/link';
import Image from 'next/image';
import Cintas from '@/components/decor/Cintas';
import { SECTIONS } from '@/lib/constants';
import { IconArrowLeft } from '@/components/ui/Icons';

export const metadata = { title: 'Página no encontrada' };

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,31,143,0.14),transparent_70%)]" />
      <Cintas className="pointer-events-none absolute -top-2 left-4 h-40 w-20 opacity-80 sm:left-16 sm:h-56 sm:w-24" count={7} />
      <Cintas className="pointer-events-none absolute -top-2 right-4 h-40 w-20 opacity-80 sm:right-16 sm:h-56 sm:w-24" count={7} mirror />

      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
        <span className="font-display text-2xl font-semibold text-white">
          Gatilín<span className="text-oro">Digital</span>
        </span>
      </Link>

      <p className="mt-12 font-display text-7xl font-semibold text-oro sm:text-8xl">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">Esta página se perdió en el pasacalle</h1>
      <p className="mt-3 max-w-md text-white/65">
        No encontramos lo que buscabas. Puede que el enlace haya cambiado: elige una sección para seguir recorriendo la festividad.
      </p>

      <ul className="mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.accent }} />
              {s.name}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="btn btn-oro mt-10 px-6 py-3">
        <IconArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>
      <div className="plumaje-band absolute inset-x-0 bottom-0" />
    </main>
  );
}
