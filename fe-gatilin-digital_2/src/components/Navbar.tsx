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
          
          <a 
            href="/registro" 
            className="relative px-3 md:px-4 py-2 rounded-full font-bold text-black decoration-0 text-xs md:text-sm whitespace-nowrap overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Efecto de brillo animado */}
            <span 
              className="absolute inset-0 w-full h-full animate-shine"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                transform: 'translateX(-100%)',
              }}
            />
            
            {/* Texto */}
            <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
              ✨ Registrarse
            </span>
            
            {/* Hover effect - resplandor extra */}
            <span 
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
              }}
            />
          </a>
        </div>
      </div>
    </nav>
  );
}