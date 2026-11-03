import Campana from '@/components/decor/Campana';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, icon, className = '' }: EmptyStateProps) {
  return (
    <div className={`card-fest border-dashed px-6 py-14 text-center ${className}`}>
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/5 text-white/50">
        {icon ?? <Campana className="w-6 h-7 opacity-70" ring="none" />}
      </div>
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{description}</p>}
    </div>
  );
}
