interface SectionCardProps {
  name: string;
  href: string;
  imageSrc: string;
}

export default function SectionCard({ name, href, imageSrc }: SectionCardProps) {
  return (
    <a 
      href={href}
      className="group relative flex items-center justify-center focus:outline-none"
    >
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 transition-all duration-500 ease-out transform group-hover:-translate-y-2 group-hover:scale-105">
        <img
          src={imageSrc}
          alt={`Ir a sección ${name}`}
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] group-hover:brightness-110"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <h2 
          className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide transition-all duration-300 group-hover:text-yellow-100 group-hover:scale-110"
          style={{ textShadow: '0px 4px 10px rgba(0,0,0,0.9)' }} 
        >
          {name}
        </h2>
      </div>
    </a>
  );
}