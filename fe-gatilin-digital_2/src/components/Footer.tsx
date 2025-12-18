import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 border-t border-yellow-500/30 py-6 mt-12">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image src="/icons/LTD.svg" alt="Logo LTD" width={48} height={48} className="h-10 w-auto" />
          <Image src="/icons/SistemasUDH.svg" alt="Logo Sistemas UDH" width={48} height={48} className="h-10 w-auto" />
        </div>
        <div className="text-xs md:text-sm text-gray-400 text-center md:text-right">
          <span className="block">
            © 2025 Universidad de Huánuco. Todos los derechos reservados.
          </span>
          <span className="block mt-1">
            Facultad de Ingeniería de Sistemas e Informática — Laboratorio de Transformación Digital
          </span>
        </div>
      </div>
    </footer>
  );
}
