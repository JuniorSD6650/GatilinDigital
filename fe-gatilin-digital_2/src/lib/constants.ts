export interface SectionLink {
  name: string;
  href: string;
  /** Pañuelo ilustrado usado como ícono de la sección */
  imageSrc: string;
  /** Descripción corta para tarjetas y menú móvil */
  description: string;
  /** Color de acento de la sección (tomado del plumaje) */
  accent: string;
}

export const SECTIONS: SectionLink[] = [
  // Pañuelos magenta
  {
    name: 'Tradición',
    href: '/tradicion',
    imageSrc: '/icons/btn-negritos-magenta.svg',
    description: 'De las haciendas coloniales al Patrimonio Cultural de la Nación.',
    accent: '#ff1f8f',
  },
  {
    name: 'Devoción',
    href: '/devocion',
    imageSrc: '/icons/btn-negritos-magenta.svg',
    description: 'La adoración al Niño Jesús, corazón de la danza.',
    accent: '#b45cf0',
  },
  // Pañuelos azules
  {
    name: 'Festival',
    href: '/festival',
    imageSrc: '/icons/btn-negritos-azul.svg',
    description: 'Cronograma oficial de presentaciones día por día.',
    accent: '#4f86ff',
  },
  {
    name: 'Sigueteo',
    href: '/sigueteo',
    imageSrc: '/icons/btn-negritos-azul.svg',
    description: 'Encuentra a tu cofradía, síguela en su recorrido y consulta su agenda.',
    accent: '#12c7e6',
  },
  {
    name: 'Mapa',
    href: '/mapa',
    imageSrc: '/icons/btn-negritos-azul.svg',
    description: 'Mira en vivo dónde están las cofradías ahora mismo.',
    accent: '#22d3a6',
  },
  // Pañuelos verdes
  {
    name: 'Personajes',
    href: '/personajes',
    imageSrc: '/icons/btn-negritos-verde.svg',
    description: 'El Negrito, el Corochano, la Dama, el Turco y el Abanderado.',
    accent: '#ff7a1a',
  },
  {
    name: 'Bordadurías',
    href: '/bordadurias',
    imageSrc: '/icons/btn-negritos-verde.svg',
    description: 'Los maestros del bordado que visten la tradición.',
    accent: '#ef2b3c',
  },
];

/** @deprecated Usa SECTIONS. Se mantiene por compatibilidad. */
export const NAV_LINKS = SECTIONS;

export const getSection = (href: string) => SECTIONS.find((s) => s.href === href);
