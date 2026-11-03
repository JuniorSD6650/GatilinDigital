import Image from 'next/image';
import CadenaDivider from '@/components/decor/CadenaDivider';
import { CampoEstrellas, EstrellaBelen, RayosGloria, Vela } from '@/components/devocion/Decor';
import EnciendeVela from '@/components/devocion/EnciendeVela';

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

/** Gestos de fe: cómo se vive la devoción dentro de la danza */
const GESTOS = [
  {
    titulo: 'Ofrenda',
    texto: 'Los Negritos no bailan para el público: bailan para el Niño Jesús. Cada paso y cada repique de cadena es una ofrenda.',
    icono: '✦',
  },
  {
    titulo: 'Adoración',
    texto: 'La música se torna solemne; caporales y cuadrilla se arrodillan, se quitan los sombreros y veneran la imagen sagrada.',
    icono: '✝',
  },
  {
    titulo: 'Sacrificio',
    texto: 'Mayordomos y danzantes entregan tiempo, esfuerzo y recursos de buena voluntad, para cumplir con el Niño.',
    icono: '♥',
  },
  {
    titulo: 'Gratitud',
    texto: 'La danza es acción de gracias por la libertad concedida y por las bendiciones recibidas año tras año.',
    icono: '☼',
  },
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
    <div className="pb-16 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      {/* ============ CIELO DE NAVIDAD: Estrella de Belén ============ */}
      <section className="relative isolate overflow-hidden" aria-labelledby="devocion-titulo">
        <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_0%,#2a1747_0%,#150c26_45%,#0c0812_100%)]" />
        <CampoEstrellas className="-z-10" />
        <RayosGloria className="-z-10 !top-[34%]" size="min(62rem, 170vw)" />

        <div className="container-fest relative flex flex-col items-center pt-10 pb-14 text-center sm:pt-14 sm:pb-20">
          <EstrellaBelen className="h-24 w-24 drop-shadow-[0_0_30px_rgba(255,214,107,0.65)] sm:h-32 sm:w-32" />
          <p className="eyebrow mt-6 text-oro">Devoción</p>
          <h1 id="devocion-titulo" className="mt-3 font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Fe y <span className="bg-gradient-to-b from-oro-claro via-oro to-oro-oscuro bg-clip-text text-transparent">Devoción</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            El corazón de nuestra danza: la adoración profunda al Niño Jesús, que nació para traer luz y paz a los hombres.
          </p>
          <p className="mt-6 font-display text-lg italic text-oro/90">“Porque un niño nos es nacido, hijo nos es dado.”</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">Isaías 9, 6</p>

          <div aria-hidden className="mt-10 flex items-end gap-6 sm:gap-10">
            <Vela alto={38} retraso={0.3} className="opacity-80" />
            <Vela alto={56} retraso={0.8} />
            <Vela alto={72} />
            <Vela alto={56} retraso={1.1} />
            <Vela alto={38} retraso={0.5} className="opacity-80" />
          </div>
        </div>
        <div className="plumaje-band plumaje-band-soft absolute inset-x-0 bottom-0" />
      </section>

      <div className="container-fest">
        {/* ============ Imagen sagrada con halo de luz ============ */}
        <section className="mx-auto mt-16 grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-14" aria-labelledby="centro">
          <div className="relative mx-auto w-full max-w-sm">
            <RayosGloria size="150%" className="!top-[45%]" />
            <div aria-hidden className="luz-respira absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,214,107,0.35),rgba(180,92,240,0.18)_45%,transparent_70%)] blur-2xl" />
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] border-[6px] border-[#2a1d0b] shadow-2xl ring-1 ring-oro/60">
              <Image src="/images/nino-jesus.webp" alt="Imagen del Niño Jesús" fill sizes="(min-width: 768px) 384px, 90vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_18%,rgba(255,240,200,0.28),transparent)]" />
            </div>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-oro/70">Niño Manuelito</p>
          </div>

          <div className="space-y-5">
            <article className="card-fest p-6 sm:p-7">
              <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-[var(--accent)]" />
              <h2 id="centro" className="font-display text-2xl font-semibold text-white">El Centro de la Fiesta</h2>
              <p className="mt-3 leading-relaxed text-white/70">
                Más allá del color y la danza, todo gira en torno al <strong className="text-[#d3a6f7]">Niño Jesús</strong>. Los
                Negritos no bailan para el público, bailan para Él, como una ofrenda de adoración y gratitud por la libertad concedida.
              </p>
            </article>

            <article className="card-fest p-6 sm:p-7">
              <span aria-hidden className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full bg-oro" />
              <h2 className="font-display text-2xl font-semibold text-white">La Adoración</h2>
              <p className="mt-3 leading-relaxed text-white/70">
                Es el momento cumbre. La música se detiene o se torna solemne. Los caporales y la cuadrilla se arrodillan, se quitan los
                sombreros y, con profunda humildad, veneran la imagen sagrada en el templo o en la casa de los mayordomos.
              </p>
            </article>

            <blockquote className="px-2 pt-2 text-center font-display text-lg italic text-white/80">
              “Gloria a Dios en las alturas y en la tierra paz a los hombres de buena voluntad.”
              <footer className="mt-1 font-body text-xs not-italic uppercase tracking-[0.25em] text-white/40">Lucas 2, 14</footer>
            </blockquote>
          </div>
        </section>

        {/* ============ Gestos de fe ============ */}
        <section className="mt-24" aria-labelledby="gestos">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center text-oro">Vivir la fe bailando</p>
            <h2 id="gestos" className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Gestos de fe</h2>
            <CadenaDivider className="mx-auto mt-5 max-w-[220px]" />
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GESTOS.map((g) => (
              <li key={g.titulo} className="card-fest group relative overflow-hidden p-6 text-center">
                <span aria-hidden className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-oro/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                <span aria-hidden className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-oro/40 bg-oro/10 font-display text-2xl text-oro shadow-[0_0_30px_-8px_rgba(242,193,78,0.8)]">
                  {g.icono}
                </span>
                <h3 className="relative mt-4 font-display text-xl font-semibold text-white">{g.titulo}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/65">{g.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ============ Oración: estampa con marco dorado y velas ============ */}
        <section aria-labelledby="oracion" className="relative mx-auto mt-24 max-w-2xl">
          <div aria-hidden className="absolute -left-4 bottom-6 hidden sm:block"><Vela alto={70} retraso={0.6} /></div>
          <div aria-hidden className="absolute -right-4 bottom-6 hidden sm:block"><Vela alto={70} retraso={1.2} /></div>

          <div className="relative rounded-[2rem] border border-oro/30 bg-gradient-to-b from-[#1e1230] to-noche p-2 shadow-[0_30px_80px_-30px_rgba(255,190,90,0.35)]">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-oro/20 px-6 py-12 text-center sm:px-14">
              <div aria-hidden className="bordado absolute inset-0 opacity-[0.06]" />
              <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,214,107,0.16),transparent)]" />
              <Esquina className="left-3 top-3" />
              <Esquina className="right-3 top-3 rotate-90" />
              <Esquina className="right-3 bottom-3 rotate-180" />
              <Esquina className="left-3 bottom-3 -rotate-90" />

              <div className="relative">
                <span aria-hidden className="block font-display text-4xl text-oro drop-shadow-[0_0_12px_rgba(242,193,78,0.7)]">✝</span>
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

        {/* ============ Enciende una vela ============ */}
        <section className="mx-auto mt-24 max-w-3xl" aria-label="Enciende una vela">
          <EnciendeVela />
        </section>

        {/* ============ Reflexión ============ */}
        <section aria-labelledby="reflexion" className="mx-auto mt-24 max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 via-terciopelo/60 to-noche p-7 sm:p-12">
            <CampoEstrellas className="opacity-40" />
            <p id="reflexion" className="eyebrow relative text-oro">Reflexión</p>
            <div className="relative mt-6 space-y-5 text-[17px] leading-[1.8] text-white/80">
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
            <p className="relative mt-10 border-t border-white/10 pt-6 text-right font-display text-lg italic text-oro">
              — Padre Oswaldo Rodríguez Martínez
            </p>
            <div className="plumaje-band absolute inset-x-0 bottom-0" />
          </div>
        </section>
      </div>
    </div>
  );
}
