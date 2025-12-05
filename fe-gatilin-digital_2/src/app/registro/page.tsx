'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { createParticipante } from '@/services/apis/api-normal';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    comentario: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Preparamos los datos automáticos
      // CORRECCIÓN: MySQL necesita formato 'YYYY-MM-DD HH:MM:SS'
      // .toISOString() devuelve 'YYYY-MM-DDTHH:MM:SS.sssZ', así que lo limpiamos:
      const fechaMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const payload = {
        ...formData,
        fecha_registro: fechaMySQL,
        estado: 'pendiente' // Estado inicial por defecto
      };

      await createParticipante(payload);

      alert('¡Bienvenido! Tu registro ha sido recibido. Nos pondremos en contacto contigo para coordinar tu participación.');
      
      // Limpiar formulario
      setFormData({ nombre: '', dni: '', email: '', telefono: '', comentario: '' });

    } catch (error) {
      console.error(error);
      alert('Hubo un error al registrarte. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 pb-24 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="max-w-3xl mx-auto">
        {/* 1. Botón de regreso */}
        <BackButton />

        {/* 2. Encabezado */}
        <SectionHeader 
          title="Vive la Danza" 
          description="No seas solo un espectador. Únete a una cuadrilla, aprende los pasos y siente la emoción de bailar para el Niño Jesús."
          borderColor="border-festivo-gold"
        />
        
        {/* 3. Formulario */}
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="bg-negrito-card border border-white/10 p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Decoración Dorada */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-festivo-gold/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              {/* Nombre Completo */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="nombre" className="block text-xs font-bold text-festivo-gold uppercase tracking-widest ml-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 transition-all focus:border-transparent"
                  placeholder="Ej. María Rodríguez"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              {/* DNI / Pasaporte */}
              <div className="space-y-2">
                <label htmlFor="dni" className="block text-xs font-bold text-festivo-gold uppercase tracking-widest ml-1">
                  DNI o Pasaporte
                </label>
                <input
                  type="text"
                  id="dni"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 transition-all focus:border-transparent"
                  placeholder="Documento de Identidad"
                  value={formData.dni}
                  onChange={handleChange}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-xs font-bold text-festivo-gold uppercase tracking-widest ml-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  id="telefono"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 transition-all focus:border-transparent"
                  placeholder="+51 987 654 321"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="email" className="block text-xs font-bold text-festivo-gold uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 transition-all focus:border-transparent"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Comentario / Motivación */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="comentario" className="block text-xs font-bold text-festivo-gold uppercase tracking-widest ml-1">
                  ¿Por qué quieres participar?
                </label>
                <textarea
                  id="comentario"
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50 transition-all resize-none focus:border-transparent"
                  placeholder="Cuéntanos tu experiencia previa (si tienes) o tus ganas de aprender..."
                  value={formData.comentario}
                  onChange={handleChange}
                />
              </div>

            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full mt-8 bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 
                text-negrito-bg font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] 
                hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transform transition-all 
                hover:-translate-y-1 active:scale-95 active:translate-y-0 flex items-center justify-center space-x-2
                uppercase tracking-wider text-lg relative z-10
                ${isSubmitting ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                <>
                  <span>Quiero Participar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4 px-4">
              Al registrarte, aceptas ser contactado por los organizadores para recibir información sobre ensayos, vestimenta y fechas de participación.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}