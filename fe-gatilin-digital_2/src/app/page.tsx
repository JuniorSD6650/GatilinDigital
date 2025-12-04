import { NAV_LINKS } from '@/lib/constants';
import SectionCard from '@/components/SectionCard';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 relative">
      
      {/* --- FONDO DE PANTALLA FIJO --- */}
      <div className="fixed inset-0 -z-50 w-full h-full">
        {/* Imagen de fondo: Ajustada para cubrir todo (cover) y centrada */}
        <img 
          src="/images/negritos-de-huanuco-baile-tradicional.webp"
          alt="Baile tradicional de los Negritos de Huánuco"
          className="w-full h-full object-cover"
        />
        {/* Capa oscura (Overlay): Mantiene el tema dark y mejora legibilidad */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />
      </div>

      {/* Encabezado Hero */}
      <header className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-festivo-gold to-yellow-600 drop-shadow-sm">
          Festiva de los Negritos de Huánuco
        </h1>
        {/* Se ha eliminado el subtítulo para tener un solo título grande */}
      </header>

      {/* Grid de Menú con Pañuelos */}
      {/* Usamos 'md:grid-cols-2' para mantener los pares de colores por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 w-full max-w-4xl px-4 justify-items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 relative z-10">
        {NAV_LINKS.map((item) => (
          <SectionCard 
            key={item.name}
            name={item.name}
            href={item.href}
            imageSrc={item.imageSrc}
          />
        ))}
      </div>
    </div>
  );
}