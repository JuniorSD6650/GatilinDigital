'use client';

import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";

export default function DevocionPage() {
  return (
    <div className="min-h-screen pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. Encabezado con el color temático (Purple) */}
      <div className="space-y-6 mb-12 relative z-10">
        <BackButton />
        <SectionHeader
          title="Fe y Devoción"
          description="El corazón de nuestra danza: la adoración profunda al Niño Jesús."
          borderColor="border-festivo-purple"
        />
      </div>

      {/* 2. Espacio para la Oración (NUEVO) */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="relative bg-white/5 border border-festivo-purple/30 p-8 md:p-12 rounded-3xl shadow-[0_0_30px_rgba(156,39,176,0.15)] backdrop-blur-sm text-center transform hover:scale-[1.01] transition-transform duration-500 group">

          {/* Icono decorativo superior */}
          <div className="text-festivo-purple text-4xl mb-6 opacity-80 group-hover:scale-110 transition-transform duration-500">✝</div>

          <h3 className="text-xl font-display text-festivo-gold mb-6 uppercase tracking-[0.2em]">
            Oración al Niño Jesús
          </h3>

          <p className="text-lg md:text-xl text-gray-200 font-serif italic leading-loose">
            Bendito Niño Jesús,<br className="hidden md:block" />
            vengo a ti, para adorarte,<br className="hidden md:block" />
            porque has nacido para salvarme.<br className="hidden md:block" />
            <br />
            Te traigo mis penas y mis alegrías;<br className="hidden md:block" />
            mis frustraciones y mis esperanzas,<br className="hidden md:block" />
            y en esta danza te entrego<br className="hidden md:block" />
            mi corazón y mi esfuerzo,<br className="hidden md:block" />
            como muestra de mi amor por ti<br className="hidden md:block" />
            Niño Bendito.<br className="hidden md:block" />
            <br />
            Me inclino ante tu imagen y te suplico<br className="hidden md:block" />
            que protejas y bendigas a mi Familia,<br className="hidden md:block" />
            a nuestros trabajos y nuestros anhelos,<br className="hidden md:block" />
            pero sobre todo no permitas<br className="hidden md:block" />
            que me aleje de ti.<br className="hidden md:block" />
            <br />
            <span className="font-bold text-white not-italic mt-4 block text-base tracking-widest">AMÉN</span>
          </p>

          {/* Adorno inferior */}
          <div className="mt-8 w-24 h-0.5 bg-gradient-to-r from-transparent via-festivo-purple to-transparent mx-auto group-hover:w-48 transition-all duration-700"></div>
        </div>
      </div>

      {/* 3. Contenido Principal */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Columna Izquierda: La Imagen Sagrada */}
        <div className="relative group">
          {/* Marco decorativo con resplandor púrpura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-festivo-purple to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-negrito-card shadow-2xl flex items-center justify-center">
            {/* Placeholder visual o Imagen real si la tienes */}
            <div className="text-center p-8 group-hover:scale-105 transition-transform duration-700">
              <span className="text-6xl mb-4 block">🙏</span>
              <p className="text-gray-500 text-sm uppercase tracking-widest">Imagen del Niño Jesús</p>
            </div>

            <Image
              src="/images/nino-jesus.webp"
              alt="Niño Jesús"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

          </div>
        </div>

        {/* Columna Derecha: Texto Litúrgico/Devocional */}
        <div className="space-y-8">

          {/* Tarjeta de Texto 1 */}
          <div className="bg-negrito-card/50 border-l-2 border-festivo-purple p-6 rounded-r-xl hover:bg-negrito-card/80 transition-colors">
            <h3 className="text-2xl font-display font-bold text-white mb-3">
              El Centro de la Fiesta
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Más allá del color y la danza, todo gira en torno al <span className="text-festivo-purple font-bold">Niño Jesús</span>. Los Negritos no bailan para el público, bailan para Él, como una ofrenda de adoración y gratitud por la libertad concedida.
            </p>
          </div>

          {/* Tarjeta de Texto 2 */}
          <div className="bg-negrito-card/50 border-l-2 border-purple-400 p-6 rounded-r-xl hover:bg-negrito-card/80 transition-colors">
            <h3 className="text-2xl font-display font-bold text-white mb-3">
              La Adoración
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Es el momento cumbre. La música se detiene o se torna solemne. Los caporales y la cuadrilla se arrodillan, se quitan los sombreros y, con profunda humildad, veneran la imagen sagrada en el templo o en la casa de los mayordomos.
            </p>
          </div>

          {/* Cita Bíblica o Frase */}
          <blockquote className="relative p-4 text-lg italic text-white/80 border-t border-b border-white/10 text-center font-display">
            <span className="absolute top-0 left-0 text-4xl text-festivo-purple/20 -translate-y-2">“</span>
            Gloria a Dios en las alturas y en la tierra paz a los hombres de buena voluntad.
            <span className="absolute bottom-0 right-0 text-4xl text-festivo-purple/20 translate-y-4">”</span>
          </blockquote>

        </div>

      </div>
    </div>
  );
}