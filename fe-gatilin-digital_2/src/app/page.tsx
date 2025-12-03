import { NAV_LINKS } from '@/lib/constants';
import SectionCard from '@/components/SectionCard';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 py-10">
      
      {/* Encabezado Hero */}
      <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-festivo-gold to-yellow-600 drop-shadow-sm">
          Los Negritos
        </h1>
        <p className="text-xl text-gray-400 tracking-[0.2em] uppercase font-light border-b border-festivo-gold/30 pb-4 inline-block">
          de Huánuco
        </p>
      </header>

      {/* Grid de Menú usando el Componente SectionCard */}
      {/* Añadí unas animaciones suaves de entrada para que se vea más profesional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
        {NAV_LINKS.map((item) => (
          <SectionCard 
            key={item.name}
            name={item.name}
            href={item.href}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
}