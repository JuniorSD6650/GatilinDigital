import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";

export default function BordaduriasPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <BackButton />

      <SectionHeader 
        title="Tradición" 
        description="Historia y legado de la cofradía."
        borderColor="border-festivo-pink"
      />
      
      <div className="h-96 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600">
        Contenido de Tradición próximamente...
      </div>
    </div>
  );
}