interface SectionCardProps {
  name: string;
  href: string;
  imageSrc: string;
}

export default function SectionCard({ name, href, imageSrc }: SectionCardProps) {
  return (
    <a 
      href={href}
      // 1. DESACTIVAMOS la interacción en el contenedor cuadrado externo.
      // Esto hace que el "cuadrado invisible" del div sea intocable por el mouse.
      className="group relative flex items-center justify-center focus:outline-none pointer-events-none"
    >
      {/* 2. CONTENEDOR UNIFICADO DE ANIMACIÓN
         Este div envuelve tanto a la imagen como al texto.
         La animación (scale/translate) se aplica AQUÍ, por lo que ambos hijos 
         se mueven exactamente igual, como un solo objeto sólido.
      */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 transition-all duration-500 ease-out transform group-hover:-translate-y-2 group-hover:scale-105">
        
        {/* 3. HITBOX (Área de Clic) DEL ROMBO
           Esta capa invisible es la ÚNICA que recibe el mouse (pointer-events-auto).
           Usamos clip-path para recortarla en forma de rombo perfecto.
           Al hacer hover/clic aquí, el evento sube al <a> padre y activa todo.
        */}
        <div 
          className="absolute inset-0 z-50 pointer-events-auto cursor-pointer"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          title={`Ir a sección ${name}`}
        />

        {/* 4. LA IMAGEN VISUAL
           Tiene pointer-events-none para que el mouse la "atraviese" y detecte el hitbox de arriba.
           El drop-shadow está aquí para que el brillo NO se recorte por el clip-path del hitbox.
        */}
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] group-hover:brightness-110 pointer-events-none"
        />

        {/* 5. EL TEXTO INTEGRADO
           Ya no tiene animación de escala propia, hereda la del padre para moverse junto a la imagen.
           Solo cambiamos el color al amarillo al hacer hover.
        */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <h2 
            className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide transition-colors duration-300 group-hover:text-yellow-100"
            style={{ textShadow: '0px 4px 10px rgba(0,0,0,0.9)' }} 
          >
            {name}
          </h2>
        </div>
      </div>
    </a>
  );
}