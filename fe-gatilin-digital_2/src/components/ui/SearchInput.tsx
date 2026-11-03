'use client';

import { IconSearch, IconX } from './Icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  label = 'Buscar',
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
      <input
        type="search"
        aria-label={label}
        className="field-input !rounded-full !pl-12 !pr-11 [&::-webkit-search-cancel-button]:hidden"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <IconX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
