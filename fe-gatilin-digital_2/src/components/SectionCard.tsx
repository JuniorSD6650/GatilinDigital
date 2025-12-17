interface SectionCardProps {
  name: string;
  href: string;
  imageSrc: string;
}

export default function SectionCard({ name, href, imageSrc }: SectionCardProps) {
  return (
    <>
      <style>{`
        @keyframes handkerchief-sway {
          0%, 100% { transform: rotate(-8deg); } 
          50% { transform: rotate(8deg); }
        }
        /* La clase que activa la animación al hacer hover en el grupo padre */
        .group:hover .animate-visual-layer {
          animation: handkerchief-sway 0.6s ease-in-out infinite;
        }
      `}</style>

      <a 
        href={href}
        className="group relative flex items-center justify-center focus:outline-none pointer-events-none"
      >
       
        <div className="relative w-36 h-36 sm:w-64 sm:h-64 md:w-72 md:h-72">
          
          <div 
            className="absolute inset-0 z-50 pointer-events-auto cursor-pointer"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            title={`Ir a sección ${name}`}
          />

          <div className="absolute inset-0 w-full h-full origin-top transition-transform duration-300 ease-out animate-visual-layer pointer-events-none">
            
            <img
              src={imageSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] group-hover:brightness-110"
            />

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <h2 
                className="text-sm sm:text-2xl md:text-3xl font-display font-bold text-white tracking-wide transition-colors duration-300 group-hover:text-yellow-100"
                style={{ textShadow: '0px 4px 10px rgba(0,0,0,0.9)' }} 
              >
                {name}
              </h2>
            </div>
          </div>

        </div>
      </a>
    </>
  );
}