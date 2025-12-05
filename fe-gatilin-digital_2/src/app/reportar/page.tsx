'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
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
  
  // --- ESTADOS PARA FOTO Y CÁMARA ---
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs para manejo de archivos y video
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Limpieza al desmontar componente: asegurar que la cámara se apague
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- HANDLERS DE FORMULARIO ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // --- LÓGICA DE CÁMARA ---
  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      // Solicitamos acceso a la cámara trasera (environment)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      
      // Esperamos un momento para asegurar que el elemento video esté montado
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback amigable si falla (ej. permisos denegados o sitio no HTTPS)
      alert("No se pudo acceder a la cámara. Asegúrate de dar permisos y estar en un sitio seguro (HTTPS).");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      // Crear un canvas temporal para capturar el frame actual del video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        // Convertir el canvas a un archivo JPG
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "foto-camara.jpg", { type: "image/jpeg" });
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera(); // Cerramos la cámara automáticamente al capturar
          }
        }, 'image/jpeg', 0.8); // Calidad JPG 80%
      }
    }
  };

  // --- LÓGICA DE ARCHIVOS (GALERÍA) ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    stopCamera(); // Por seguridad apagamos cámara si estaba encendida
  };

  // --- ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('nombre_reportante', formData.name || 'Anónimo');
      data.append('numero_contacto', formData.phone);
      
      // Concatenamos el tipo para dar contexto rápido en el dashboard
      const fullDescription = `[TIPO: ${formData.type.toUpperCase()}] ${formData.description}`;
      data.append('descripcion', fullDescription);
      
      data.append('estado', 'pendiente');

      if (photo) {
        data.append('foto', photo);
      }

      await createReporte(data);

      alert('¡Gracias! Tu reporte ha sido registrado exitosamente.');
      
      // Resetear formulario
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
        <BackButton />

        <SectionHeader 
          title="Reportar Anomalía" 
          description="Ayúdanos a mantener la seguridad. Tu reporte será enviado directamente al centro de control."
          borderColor="border-yellow-500"
        />
        
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              {/* Nombre */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Tu Nombre (Opcional)</label>
                <input
                  type="text"
                  id="name"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all focus:border-transparent"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Celular de Contacto</label>
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

              {/* Tipo de incidente */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="type" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Tipo de Incidente</label>
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2 relative z-10">
              <label htmlFor="description" className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1">Detalle del Reporte</label>
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

            {/* SECCIÓN DE EVIDENCIA (FOTO / CÁMARA) */}
            <div className="space-y-2 relative z-10">
              <label className="block text-xs font-bold text-yellow-500/80 uppercase tracking-widest ml-1 mb-2">
                Evidencia (Foto Opcional)
              </label>
              
              {/* Input de archivo oculto (para funcionalidad de galería) */}
              <input
                type="file"
                id="photo"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />

              {/* Botones de Selección (si no hay foto ni cámara abierta) */}
              {!previewUrl && !isCameraOpen && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Botón: Usar Cámara */}
                    <button
                        type="button"
                        onClick={startCamera}
                        className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/50 hover:bg-white/5 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        </svg>
                        <span className="text-sm font-bold">Usar Cámara</span>
                    </button>

                    {/* Botón: Subir de Galería */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="text-sm font-bold">Galería</span>
                    </button>
                </div>
              )}

              {/* MODO CÁMARA ACTIVA */}
              {isCameraOpen && (
                 <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-yellow-500/50 shadow-lg">
                    <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        {/* Botón Cerrar Cámara */}
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {/* Botón Capturar */}
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-white border-4 border-gray-300 w-16 h-16 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        ></button>
                    </div>
                 </div>
              )}

              {/* VISTA PREVIA (FOTO CAPTURADA O SUBIDA) */}
              {previewUrl && (
                <div className="relative w-full h-64 bg-black/40 rounded-2xl overflow-hidden border border-white/10 group animate-in fade-in zoom-in-95 duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Previsualización" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Botón Eliminar (Desktop) */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-transform transform hover:scale-105 flex items-center gap-2 font-bold text-sm shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar Foto
                    </button>
                  </div>
                  
                  {/* Botón Eliminar (Móvil - visible siempre) */}
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
              Los reportes son enviados directamente al comité de seguridad. 
              <br/>
              <span className="text-yellow-500/80 font-bold">Importante:</span> Si te encuentras en una situación de riesgo inmediato, contacta a la Policía Nacional (105).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}