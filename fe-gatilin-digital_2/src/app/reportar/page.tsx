'use client';

import { useState, type FormEvent } from 'react';
// En tu entorno local, descomenta estas líneas y borra los componentes definidos abajo:
// import BackButton from "@/components/BackButton";
// import SectionHeader from "@/components/SectionHeader";

// --- COMPONENTES DEFINIDOS LOCALMENTE PARA ESTA VISTA PREVIA ---
// (Copiados exactamente como los pediste para mantener el diseño)

function BackButton() {
  return (
    <a 
      href="/" 
      className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-8 group"
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
    </a>
  );
}

interface SectionHeaderProps {
  title: string;
  description: string;
  borderColor: string; 
}

function SectionHeader({ title, description, borderColor }: SectionHeaderProps) {
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

// --- PÁGINA DE REPORTE ---

export default function ReportPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'incidente',
    description: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar a tu backend
    alert('¡Gracias por tu reporte! La cofradía revisará tu mensaje.');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 pb-24 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="max-w-4xl mx-auto">
        {/* 1. Botón de regreso (Usando la versión local) */}
        <BackButton />

        {/* 2. Encabezado (Usando la versión local) */}
        <SectionHeader 
          title="Reportar Anomalía" 
          description="Ayúdanos a mantener la seguridad y el orden de la festividad. Tu reporte es anónimo si así lo deseas."
          borderColor="border-yellow-500"
        />
        
        {/* 3. El Formulario Funcional */}
        <div className="mt-6">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo: Nombre */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-yellow-500/90 uppercase tracking-wider">
                  Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all focus:border-transparent"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Campo: Tipo de Reporte */}
              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-yellow-500/90 uppercase tracking-wider">
                  Tipo de Incidente
                </label>
                <div className="relative">
                  <select
                    id="type"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="incidente">🚨 Incidente de Seguridad</option>
                    <option value="organizacion">📅 Problema de Organización</option>
                    <option value="perdida">🎒 Objeto Perdido</option>
                    <option value="sugerencia">💡 Sugerencia</option>
                    <option value="otro">📝 Otro</option>
                  </select>
                  {/* Flecha personalizada */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Campo: Descripción */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-yellow-500/90 uppercase tracking-wider">
                Detalle del Reporte
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none focus:border-transparent"
                placeholder="Por favor describe qué sucedió, dónde y cuándo con el mayor detalle posible..."
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transform transition-all hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="text-lg">ENVIAR REPORTE</span>
            </button>

          </form>

          {/* Nota al pie */}
          <div className="mt-8 flex items-start space-x-3 text-xs text-gray-500 bg-white/5 p-4 rounded-lg border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Los reportes son enviados directamente al comité de seguridad de la Cofradía de Negritos. 
              Si te encuentras en una situación de riesgo inmediato, por favor contacta a la Policía Nacional (105) o busca al oficial más cercano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}