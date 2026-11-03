import Image from 'next/image';
import PageHeader from '@/components/ui/PageHeader';
import CadenaDivider from '@/components/decor/CadenaDivider';

const ACCENT = '#b45cf0';

const ORACION = [
  ['Bendito Niño Jesús,', 'vengo a ti, para adorarte,', 'porque has nacido para salvarme.'],
  [
    'Te traigo mis penas y mis alegrías;',
    'mis frustraciones y mis esperanzas,',
    'y en esta danza te entrego',
    'mi corazón y mi esfuerzo,',
    'como muestra de mi amor por ti',
    'Niño Bendito.',
  ],
  [
    'Me inclino ante tu imagen y te suplico',
    'que protejas y bendigas a mi Familia,',
    'a nuestros trabajos y nuestros anhelos,',
    'pero sobre todo no permitas',
    'que me aleje de ti.',
  ],
];

/** Esquina ornamental dorada para la estampa de la oración */
function Esquina({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={`absolute h-9 w-9 text-oro/70 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 20V6a4 4 0 014-4h14" />
      <path d="M8 20V10a2 2 0 012-2h10" opacity=".6" />
      <circle cx="14" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function DevocionPage() {
  return (
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Devoción"
        title="Fe y Devoción"
        description="El corazón de nuestra danza: la adoración profunda al Niño Jesús."
        accent={ACCENT}
      />

      {/* ===== Oración: estampa con marco dorado ===== */}
      <section aria-labelledby="oracion" className="mx-auto max-w-2xl">
        <div className="relative rounded-[2rem] border border-oro/30 bg-gradient-to-b from-[#1e1230] to-noche p-2 shadow-[0_30px_80px_-30px_rgba(180,92,240,0.45)]">
          <div className="relative overflow-hidden rounded-[1.6rem] border border-oro/20 px-6 py-12 text-center sm:px-14">
            <div aria-hidden className="bordado absolute inset-0 opacity-[0.06]" />
            <Esquina className="left-3 top-3" />
            <Esquina className="right-3 top-3 rotate-90" />
            <Esquina className="right-3 bottom-3 rotate-180" />
            <Esquina className="left-3 bottom-3 -rotate-90" />

            <div className="relative">
              <span aria-hidden className="block font-display text-4xl text-oro">✝</span>
              <h2 id="oracion" className="eyebrow mt-3 justify-center text-oro">
                Oración al Niño Jesús
              </h2>
              <div className="mt-8 space-y-6 font-display text-lg italic leading-relaxed text-white/85 sm:text-xl">
                {ORACION.map((estrofa, i) => (
                  <p key={i}>
                    {estrofa.map((verso) => (
                      <span key={verso} className="block">{verso}</span>
                    ))}
                  </p>
                ))}
              </div>
              <p className="mt-8 text-sm font-bold not-italic tracking-[0.4em] text-white">AMÉN</p>
              <CadenaDivider className="mt-8 max-w-[200px] mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Imagen sagrada + textos ===== */}
      <section className="mx-auto mt-20 grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative mx-auto w-full max-w-sm">
          <div aria-hidden className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[var(--accent)]/40 via-oro/20 to-transparent blur-2xl" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border-[6px] border-[#2a1d0b] ring-1 ring-oro/50 shadow-2xl">
            <Image src="/images/nino-jesus.webp" alt="Imagen del Niño Jesús" fill sizes="(min-width: 768px) 384px, 90vw" className="object-cover" />
          </div>
          <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-white/45">Niño Manuelito</p>
        </div>

        <div className="space-y-5">
          <article className="card-fest p-6 sm:p-7">
            <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-[var(--accent)]" />
            <h3 className="font-display text-2xl font-semibold text-white">El Centro de la Fiesta</h3>
            <p className="mt-3 leading-relaxed text-white/70">
              Más allá del color y la danza, todo gira en torno al <strong className="text-[var(--accent)]">Niño Jesús</strong>. Los
              Negritos no bailan para el público, bailan para Él, como una ofrenda de adoración y gratitud por la libertad concedida.
            </p>
          </article>

          <article className="card-fest p-6 sm:p-7">
            <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-oro" />
            <h3 className="font-display text-2xl font-semibold text-white">La Adoración</h3>
            <p className="mt-3 leading-relaxed text-white/70">
              Es el momento cumbre. La música se detiene o se torna solemne. Los caporales y la cuadrilla se arrodillan, se quitan los
              sombreros y, con profunda humildad, veneran la imagen sagrada en el templo o en la casa de los mayordomos.
            </p>
          </article>

          <blockquote className="px-2 pt-2 text-center font-display text-lg italic text-white/80">
            “Gloria a Dios en las alturas y en la tierra paz a los hombres de buena voluntad.”
          </blockquote>
        </div>
      </section>

      {/* ===== Reflexión ===== */}
      <section aria-labelledby="reflexion" className="mx-auto mt-24 max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 via-terciopelo/60 to-noche p-7 sm:p-12">
          <p id="reflexion" className="eyebrow text-oro">Reflexión</p>
          <div className="mt-6 space-y-5 text-[17px] leading-[1.8] text-white/80">
            <p>
              La devoción de los Negritos al Niño Jesús se expresa en el compromiso que asumen los mayordomos cuando se encargan de
              realizar la festividad y también la devoción de los danzantes de Negritos quienes se sacrifican en muchas cosas para poder
              cumplir con el Niño.
            </p>
            <p>
              Además de realizar gastos en la elaboración de sus trajes de danzantes, también sacrifican tiempo y ocupaciones del día a
              día, pero lo hacen de buena voluntad porque ellos saben que todo lo que den al Niño lo recibirán multiplicado en
              bendiciones.
            </p>
            <p>
              Ese es el cariño que tienen los pobladores de la ciudad de Huánuco por el Niño Manuelito y la razón por la cual esta
              festividad es única en el mundo y ha sido declarada Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO.
            </p>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-right font-display text-lg italic text-oro">
            — Padre Oswaldo Rodríguez Martínez
          </p>
          <div className="plumaje-band absolute inset-x-0 bottom-0" />
        </div>
      </section>
    </div>
  );
}
