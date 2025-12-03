import Link from 'next/link';

export default function BackButton() {
  return (
    <Link 
      href="/" 
      className="inline-flex items-center gap-2 text-gray-400 hover:text-festivo-gold transition-colors mb-8 group"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      <span className="font-medium text-sm uppercase tracking-wide">Volver al inicio</span>
    </Link>
  );
}