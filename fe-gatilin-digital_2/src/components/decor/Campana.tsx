interface CampanaProps {
  className?: string;
  /** 'ring' repica al pasar el mouse sobre el grupo; 'auto' repica solo cada cierto tiempo */
  ring?: 'hover' | 'auto' | 'none';
}

/** Campanilla dorada del Negrito de Huánuco */
export default function Campana({ className = 'w-5 h-6', ring = 'hover' }: CampanaProps) {
  const ringClass = ring === 'auto' ? 'bell-ring-auto' : ring === 'hover' ? 'bell-ring' : '';
  return (
    <svg
      viewBox="0 0 32 40"
      aria-hidden="true"
      className={`${ringClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="4.2" r="2.6" fill="none" stroke="#c9ced6" strokeWidth="1.8" />
      <path d="M16 6.8c-5.6 0-9 4.4-9 10.2v6.6L4 29h24l-3-5.4V17c0-5.8-3.4-10.2-9-10.2z" fill="#f2c14e" />
      <path d="M16 6.8c3.6 0 6.2 1.9 7.6 4.9-1.9-1.4-4.4-2.1-7.6-2.1s-5.7.7-7.6 2.1c1.4-3 4-4.9 7.6-4.9z" fill="#ffe08a" opacity=".7" />
      <rect x="3" y="27.6" width="26" height="3.6" rx="1.8" fill="#b8862b" />
      <path d="M11.2 13.2c.9-2 2.4-3.3 4.3-3.7" stroke="#fff" strokeOpacity=".65" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="35" r="3" fill="#b8862b" />
    </svg>
  );
}
