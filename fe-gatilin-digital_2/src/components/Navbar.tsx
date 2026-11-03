'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SECTIONS } from '@/lib/constants';
import { IconMenu, IconX, IconArrowRight, IconAlert } from '@/components/ui/Icons';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar el menú móvil al navegar (ajuste de estado durante el render)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Bloquear scroll del body con el menú abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`border-b transition-colors duration-300 backdrop-blur-xl ${
          scrolled || open ? 'bg-noche/90 border-white/10' : 'bg-noche/60 border-transparent'
        }`}
      >
        <div className="container-fest flex h-16 items-center justify-between gap-4">
          {/* Marca */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0" aria-label="Gatilín Digital, inicio">
            <Image src="/logo.svg" alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9 transition-transform group-hover:rotate-[-6deg]" />
            <span className="leading-none">
              <span className="block font-display text-lg sm:text-xl font-semibold text-white">
                Gatilín<span className="text-oro">Digital</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-white/45 mt-1">
                Negritos de Huánuco
              </span>
            </span>
          </Link>

          {/* Navegación escritorio */}
          <nav aria-label="Secciones" className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {SECTIONS.map((s) => {
              const active = isActive(s.href);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-3.5 ${
                    active ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s.name}
                  <span
                    className={`absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundColor: s.accent, boxShadow: `0 0 10px ${s.accent}` }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Link
              href="/registro"
              className="btn btn-oro relative overflow-hidden px-4 py-2.5 text-sm"
            >
              <span aria-hidden className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ transform: 'translateX(-100%)' }} />
              <span className="relative">Regístrate</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              {open ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div id="menu-movil" className="lg:hidden fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-noche/97 backdrop-blur-xl animate-in">
          <nav aria-label="Secciones" className="container-fest py-6">
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
              {SECTIONS.map((s) => {
                const active = isActive(s.href);
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={`group flex items-center gap-4 rounded-2xl border p-3 pr-4 transition-colors ${
                        active ? 'border-white/20 bg-white/[0.07]' : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.imageSrc} alt="" className="h-12 w-12 shrink-0 panuelo-sway" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                          {s.name}
                          {active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.accent }} />}
                        </span>
                        <span className="block truncate text-xs text-white/55">{s.description}</span>
                      </span>
                      <IconArrowRight className="w-4 h-4 text-white/40 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/registro" className="btn btn-oro py-3.5 text-sm">Quiero participar</Link>
              <Link href="/reportar" className="btn btn-ghost py-3.5 text-sm">
                <IconAlert className="w-4 h-4 text-oro" />
                Reportar
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
