import Image from 'next/image';
import Link from 'next/link';
import { SECTIONS } from '@/lib/constants';
import CadenaDivider from '@/components/decor/CadenaDivider';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-noche-2">
      <div className="plumaje-band plumaje-band-soft" />
      <div className="fleco -mt-px" />

      <div className="container-fest grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        {/* Marca */}
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="font-display text-2xl font-semibold text-white">
              Gatilín<span className="text-oro">Digital</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            La app oficial de la Festividad de los Negritos de Huánuco.
            <span className="block mt-1 font-display italic text-white/75">“La Navidad más grande del mundo”.</span>
          </p>
          <CadenaDivider className="mt-6 max-w-[220px]" />
        </div>

        {/* Explorar */}
        <nav aria-label="Explorar">
          <h2 className="eyebrow text-oro/90 mb-4">Explorar</h2>
          <ul className="grid gap-2.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="group inline-flex items-center gap-2 text-white/65 hover:text-white transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: s.accent }} />
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Participa */}
        <nav aria-label="Participa">
          <h2 className="eyebrow text-oro/90 mb-4">Participa</h2>
          <ul className="grid gap-2.5 text-sm">
            <li><Link href="/registro" className="text-white/65 hover:text-white transition-colors">Únete a una cuadrilla</Link></li>
            <li><Link href="/reportar" className="text-white/65 hover:text-white transition-colors">Reportar una anomalía</Link></li>
            <li><Link href="/sigueteo" className="text-white/65 hover:text-white transition-colors">Vota por tu cofradía</Link></li>
            <li className="pt-2">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/25 transition-colors">
                Acceso para cofradías y administración
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="container-fest flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <div className="flex items-center gap-5 opacity-80">
            <Image src="/icons/LTD.svg" alt="Laboratorio de Transformación Digital" width={48} height={48} className="h-9 w-auto" />
            <Image src="/icons/SistemasUDH.svg" alt="Ingeniería de Sistemas UDH" width={48} height={48} className="h-9 w-auto" />
          </div>
          <div className="text-center text-xs text-white/45 md:text-right">
            <p>© {year} Universidad de Huánuco. Todos los derechos reservados.</p>
            <p className="mt-1">Facultad de Ingeniería de Sistemas e Informática — Laboratorio de Transformación Digital</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
