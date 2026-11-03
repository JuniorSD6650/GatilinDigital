import PageHeader from '@/components/ui/PageHeader';
import Campana from '@/components/decor/Campana';
import CadenaDivider from '@/components/decor/CadenaDivider';

const ACCENT = '#ff1f8f';

// Datos históricos
const TIMELINE_EVENTS = [
  {
    year: 'Siglo XVII',
    title: 'Orígenes en las Haciendas',
    description:
      'Los esclavos africanos traídos a Huánuco trabajaban en las haciendas. Durante la Navidad, los hacendados les permitían celebrar adorando al Niño Jesús por unas horas.',
  },
  {
    year: '1854',
    title: 'El Decreto de Libertad',
    description:
      'El presidente Ramón Castilla decreta la abolición de la esclavitud. Como gesto de gratitud y celebración, los libertos danzaron por las calles luciendo sus mejores galas.',
  },
  {
    year: '1900s',
    title: 'Nace la Cofradía',
    description:
      'La danza se organiza formalmente. Se integran personajes mestizos y españoles satirizados (como el Corochano y el Turco), enriqueciendo la narrativa cultural.',
  },
  {
    year: 'Actualidad',
    title: 'Patrimonio Vivo',
    description:
      'Hoy, la festividad de los Negritos de Huánuco es Patrimonio Cultural de la Nación, celebrándose con devoción y elegancia desde la víspera de Navidad hasta la Bajada de Reyes.',
  },
];

const HISTORIA = [
  {
    title: 'La Gala de los Hacendados',
    body: (
      <>
        <p>
          La danza de los Negritos de Huánuco representa la gala que exhibían los antiguos hacendados españoles en la época de la
          colonia en la ciudad de Huánuco. Esta era una costumbre que solía ejecutarse en Navidad. Sendas cuadrillas de negritos,
          esclavos de la época que trabajaban en las haciendas, bailaban en celebración al nacimiento del Niño Jesús.
        </p>
        <p>
          Iniciaban el día asistiendo a Misa y danzaban por el camino visitando a una que otra hacienda amiga realizando el baile de
          Adoración al Niño. Eran conducidos por los <mark>caporales</mark> y custodiados por un <mark className="oro">capataz blanco</mark>{' '}
          quien con chicote en mano mantenía el orden en la danza.
        </p>
      </>
    ),
  },
  {
    title: 'Los Personajes de la Comparsa',
    body: (
      <p>
        Además, eran acompañados por la <mark>dama dueña de la hacienda</mark> y el <mark>turco</mark> quienes iban regocijándose de la
        gala que estaban presentando. Otro personaje que acompañaba esta comparsa era el <mark>porta estandarte</mark>, que con el
        escudo de la familia o hacienda identificaba de dónde venían estos negritos.
      </p>
    ),
  },
  {
    title: 'El Renacer de la Tradición',
    body: (
      <p>
        Esta costumbre se diluye a fines del siglo XVIII con la libertad de los esclavos negros en el Perú y el retorno de los, ahora
        ex esclavos, negros a sus lugares de origen. Durante la República se reaviva esta costumbre y el lugar de los danzantes es
        tomado por los <mark className="oro">indígenas y mestizos de la zona</mark>, quienes con máscaras de negros emulan el origen
        de la danza: la devoción al Niño Jesús.
      </p>
    ),
  },
  {
    title: 'La Navidad Más Grande del Mundo',
    body: (
      <p>
        Actualmente, la danza se constituye en la festividad más grande de la Región. Ha sido recientemente declarada como{' '}
        <mark className="oro">Patrimonio Cultural de la Nación</mark>, y a decir de las personas que habitan este cálido valle: la
        Festividad de los Negritos de Huánuco es <strong className="italic text-white">la Navidad más grande del Mundo</strong>.
      </p>
    ),
  },
];

export default function TradicionPage() {
  return (
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Tradición"
        title="Nuestra Historia"
        description="Un viaje a través del tiempo: de la esclavitud a la libertad y la fe inquebrantable."
        accent={ACCENT}
      />

      {/* ===== Línea de tiempo ===== */}
      <section aria-labelledby="linea-tiempo" className="relative mx-auto max-w-4xl">
        <h2 id="linea-tiempo" className="sr-only">Línea de tiempo</h2>

        {/* Cadena vertical */}
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-5 w-px md:left-1/2 bg-gradient-to-b from-[var(--accent)] via-white/15 to-transparent"
        />

        <ol className="space-y-10 md:space-y-14">
          {TIMELINE_EVENTS.map((event, index) => {
            const right = index % 2 === 0;
            return (
              <li key={event.year} className="relative md:grid md:grid-cols-2 md:gap-14">
                {/* Nodo: campanilla */}
                <span
                  aria-hidden
                  className="absolute left-5 top-4 z-10 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-[var(--accent)]/60 bg-noche shadow-[0_0_20px_rgba(255,31,143,0.35)] md:left-1/2"
                >
                  <Campana className="w-4 h-5" ring="none" />
                </span>

                <article
                  className={`group card-fest ml-14 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 md:ml-0 ${
                    right ? 'md:col-start-2' : 'md:col-start-1 md:text-right'
                  }`}
                >
                  <span className="inline-block rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold tracking-widest text-[var(--accent)]">
                    {event.year}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">{event.description}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ===== Relato histórico ===== */}
      <section aria-labelledby="origen" className="mx-auto mt-24 max-w-3xl">
        <div className="text-center">
          <p className="eyebrow text-oro">Origen colonial</p>
          <h2 id="origen" className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-white">
            De la hacienda a las calles
          </h2>
          <CadenaDivider className="mt-6 max-w-[240px] mx-auto" />
        </div>

        <div className="mt-12 space-y-12 text-[17px] leading-[1.8] text-white/80 [&_p+p]:mt-5 [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-[var(--accent)] [&_mark.oro]:text-oro">
          {HISTORIA.map((h, i) => (
            <article key={h.title} className="relative pl-6 sm:pl-8">
              <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full" style={{ background: i === HISTORIA.length - 1 ? '#f2c14e' : ACCENT }} />
              <h3 className={`mb-4 font-display text-2xl font-semibold ${i === HISTORIA.length - 1 ? 'text-oro' : 'text-white'}`}>
                {h.title}
              </h3>
              {h.body}
            </article>
          ))}
        </div>
      </section>

      {/* ===== Cita final ===== */}
      <figure className="mx-auto mt-24 max-w-2xl text-center">
        <span aria-hidden className="font-display text-7xl leading-none text-[var(--accent)]/40">“</span>
        <blockquote className="-mt-6 font-display text-2xl sm:text-3xl italic leading-snug text-white/90">
          La danza no es solo movimiento, es la memoria de un pueblo que celebra su libertad.
        </blockquote>
        <div className="plumaje-band mx-auto mt-8 w-32 rounded-full" />
      </figure>
    </div>
  );
}
