import Link from 'next/link';

interface SectionCardProps {
  name: string;
  href: string;
  color: string; // Clase de Tailwind para el color de fondo (ej: 'bg-festivo-pink')
  // border: string; // Opcional si quisieras usarlo para bordes específicos
}

export default function SectionCard({ name, href, color }: SectionCardProps) {
  return (
    <Link
      href={href}
      className={`
        group relative p-8 rounded-2xl bg-negrito-card border border-white/10 
        hover:border-festivo-gold/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-festivo-gold/10
        flex flex-col items-center justify-center gap-4 text-center overflow-hidden
      `}
    >
      {/* Efecto de brillo en el borde superior al hacer hover (Usa el color prop) */}
      <div className={`absolute top-0 left-0 w-full h-1 ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Círculo decorativo de fondo (opcional, para darle más vida) */}
      <div className={`absolute w-24 h-24 rounded-full ${color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-500`} />

      {/* Título */}
      <h2 className="text-2xl font-display font-bold text-white group-hover:text-festivo-gold transition-colors z-10">
        {name}
      </h2>
      
      <p className="text-sm text-gray-500 group-hover:text-gray-300 flex items-center gap-1 transition-colors z-10">
        Explorar sección 
        <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
      </p>
    </Link>
  );
}