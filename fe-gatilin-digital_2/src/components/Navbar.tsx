import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-negrito-bg/80 backdrop-blur-md border-b border-festivo-gold/30">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-display font-bold text-festivo-gold tracking-wider hover:scale-105 transition-transform">
          GatilínDigital
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-festivo-gold transition-colors">Inicio</Link>
          <Link href="/registro" className="px-4 py-2 rounded-full bg-festivo-gold text-negrito-bg font-bold hover:bg-yellow-400 transition-colors">
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  );
}