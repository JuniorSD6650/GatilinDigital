'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import BackButton from "@/components/BackButton";
import SectionHeader from "@/components/SectionHeader";
import { createReporte } from '@/services/apis/api-normal';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'incidente',
    description: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejo de cambios en los inputs de texto
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Manejo de selección de archivo con previsualización
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Limpiar la foto seleccionada
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Preparamos los datos en un objeto FormData
      const data = new FormData();
      data.append('nombre_reportante', formData.name || 'Anónimo');
      data.append('numero_contacto', formData.phone);
      
      // Concatenamos el tipo al inicio de la descripción para mayor contexto
      const fullDescription = `[TIPO: ${formData.type.toUpperCase()}] ${formData.description}`;
      data.append('descripcion', fullDescription);
      
      // Estado inicial
      data.append('estado', 'pendiente');

      // 2. Adjuntamos la foto si existe
      if (photo) {
        data.append('foto', photo);
      }

      // 3. Enviamos al backend usando nuestro servicio
      await createReporte(data);

      // 4. Feedback de éxito
      alert('¡Gracias! Tu reporte ha sido registrado exitosamente.');
      
      // 5. Limpiar formulario y previsualización
      setFormData({ name: '', phone: '', type: 'incidente', description: '' });
      handleRemovePhoto();

    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al enviar el reporte. Por favor revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 pb-24 font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="max-w-4xl mx-auto">
        {/* 1. Botón de regreso */}
        <BackButton />

        {/* 2. Encabezado */}
        <SectionHeader 
          title="Reportar Anomalía" 
          description="Ayúdanos a mantener la seguridad y el orden de la festividad. Tu reporte será enviado directamente al centro de control."
          borderColor="border-yellow-500"
        />
        
        {/* 3. Formulario */}
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              {/* Campo: Nombre */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">
                  Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all focus:border-transparent"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Celular */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">
                  Celular de Contacto
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all focus:border-transparent"
                  placeholder="Ej. 987 654 321"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Campo: Tipo de Reporte */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="type" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">
                  Tipo de Incidente
                </label>
                <div className="relative">
                  <select
                    id="type"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all cursor-pointer"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="incidente">🚨 Incidente de Seguridad</option>
                    <option value="organizacion">📅 Problema de Organización</option>
                    <option value="perdida">🎒 Objeto Perdido</option>
                    <option value="sugerencia">💡 Sugerencia</option>
                    <option value="otro">📝 Otro</option>
                  </select>
                  {/* Flecha personalizada */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Campo: Descripción */}
            <div className="space-y-2 relative z-10">
              <label htmlFor="description" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">
                Detalle del Reporte
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none focus:border-transparent"
                placeholder="Por favor describe qué sucedió, dónde y cuándo con el mayor detalle posible..."
                required
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Campo: Foto con Previsualización */}
            <div className="space-y-2 relative z-10">
              <label className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1 mb-2">
                Evidencia (Foto Opcional)
              </label>
              
              {!previewUrl ? (
                <div className="relative group">
                  <input
                    type="file"
                    id="photo"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-yellow-500/50 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <span className="text-sm font-medium">Toca para tomar foto o subir archivo</span>
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-64 bg-black/40 rounded-2xl overflow-hidden border border-white/10 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Previsualización" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay con botón de eliminar */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-transform transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Eliminar Foto
                    </button>
                  </div>
                  
                  {/* Botón visible siempre en móvil (opcional si el hover no es obvio) */}
                  <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-red-500/80 p-2 rounded-full text-white md:hidden shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full mt-6 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 
                text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] 
                hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transform transition-all 
                hover:-translate-y-0.5 active:scale-95 active:translate-y-0 flex items-center justify-center space-x-2
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
                  Enviando...
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Enviar Reporte</span>
                </>
              )}
            </button>

          </form>

          {/* Nota al pie */}
          <div className="mt-8 flex items-start space-x-3 text-xs text-gray-500 bg-white/5 p-4 rounded-xl border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Los reportes son enviados directamente al comité de seguridad de la Cofradía de Negritos. 
              <br/>
              <span className="text-yellow-500/80 font-bold">Importante:</span> Si te encuentras en una situación de riesgo inmediato, por favor contacta a la Policía Nacional (105).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}