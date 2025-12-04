interface SectionHeaderProps {
  title: string;
  description: string;
  borderColor: string; 
}

export default function SectionHeader({ title, description, borderColor }: SectionHeaderProps) {
  return (
    <div className={`border-l-4 ${borderColor} pl-6 py-2 mb-8`}>
      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
        {title}
      </h1>
      <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}