import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-yellow-500/30">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Usamos <a> en lugar de <Link> para la vista previa */}
        <a href="/" className="flex items-center gap-2 md:gap-3 text-xl md:text-2xl font-bold text-yellow-500 tracking-wider hover:scale-105 transition-transform decoration-0">
          <Image 
            src="/logo.svg" 
            alt="GatilínDigital Logo" 
            width={32} 
            height={32} 
            className="w-6 h-6 md:w-8 md:h-8"
          />
          GatilínDigital
        </a>

        <div className="flex items-center gap-2 md:gap-4 text-sm font-medium">
          {/* Texto de pregunta - solo visible en desktop */}
          <span className="hidden md:inline text-gray-300">¿Listo para participar?</span>
          
          <a href="/registro" className="px-3 md:px-4 py-2 rounded-full bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors shadow-[0_0_10px_rgba(234,179,8,0.3)] decoration-0 text-xs md:text-sm whitespace-nowrap">
            Registrarse
          </a>
        </div>
      </div>
    </nav>
  );
}