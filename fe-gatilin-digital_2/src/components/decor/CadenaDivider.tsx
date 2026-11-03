import Campana from './Campana';

interface CadenaDividerProps {
  className?: string;
  /** Muestra la campanilla central */
  bell?: boolean;
}

/** Divisor de cadena plateada con campanilla al centro */
export default function CadenaDivider({ className = 'max-w-xs mx-auto', bell = true }: CadenaDividerProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="cadena flex-1 opacity-70 [mask-image:linear-gradient(to_left,#000_40%,transparent)]" />
      {bell && <Campana className="w-5 h-6 shrink-0" ring="auto" />}
      <div className="cadena flex-1 opacity-70 [mask-image:linear-gradient(to_right,#000_40%,transparent)]" />
    </div>
  );
}
