'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { useAlert } from '@/components/AlertContext';
import { createReporte } from '@/services/apis/api-normal';
import { IconCamera, IconImage, IconSend, IconX, IconInfo, IconPhone, Spinner } from '@/components/ui/Icons';

const ACCENT = '#f2c14e';

const TIPOS = [
  { value: 'incidente', label: 'Incidente de seguridad', emoji: '🚨' },
  { value: 'organizacion', label: 'Problema de organización', emoji: '📅' },
  { value: 'perdida', label: 'Objeto perdido', emoji: '🎒' },
  { value: 'sugerencia', label: 'Sugerencia', emoji: '💡' },
  { value: 'otro', label: 'Otro', emoji: '📝' },
];

export default function ReportPage() {
  const { showAlert } = useAlert();
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Asegurar que la cámara se apague al salir
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // --- CÁMARA ---
  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      // Cámara trasera (environment)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      showAlert('error', 'No se pudo acceder a la cámara. Da permisos y verifica que el sitio use HTTPS.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], 'foto-camara.jpg', { type: 'image/jpeg' });
          setPhoto(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        }
      },
      'image/jpeg',
      0.8
    );
  };

  // --- GALERÍA ---
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
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
  };

  // --- ENVÍO ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('nombre_reportante', formData.name || 'Anónimo');
      data.append('numero_contacto', formData.phone);
      // Prefijo del tipo para dar contexto rápido en el dashboard
      data.append('descripcion', `[TIPO: ${formData.type.toUpperCase()}] ${formData.description}`);
      data.append('estado', 'pendiente');
      if (photo) data.append('foto', photo);

      await createReporte(data);

      showAlert('success', '¡Gracias! Tu reporte ha sido registrado exitosamente.');
      setFormData({ name: '', phone: '', type: 'incidente', description: '' });
      handleRemovePhoto();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Ocurrió un error al enviar el reporte. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fest pt-8 animate-in" style={{ '--accent': ACCENT } as React.CSSProperties}>
      <PageHeader
        eyebrow="Seguridad"
        title="Reportar anomalía"
        description="Ayúdanos a mantener la festividad segura. Tu reporte llega directamente al centro de control."
        accent={ACCENT}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="card-fest space-y-7 p-6 sm:p-8">
          {/* Tipo */}
          <fieldset>
            <legend className="field-label">Tipo de reporte</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIPOS.map((t) => {
                const checked = formData.type === t.value;
                return (
                  <label
                    key={t.value}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-3 text-sm transition-all ${
                      checked ? 'border-oro bg-oro/10 text-white' : 'border-white/10 bg-black/20 text-white/70 hover:border-white/25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={checked}
                      onChange={() => setFormData((p) => ({ ...p, type: t.value }))}
                      className="sr-only"
                    />
                    <span aria-hidden className="text-lg">{t.emoji}</span>
                    <span className="leading-tight">{t.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">
                Tu nombre <span className="font-normal text-white/40">(opcional)</span>
              </label>
              <input type="text" id="name" autoComplete="name" className="field-input" placeholder="Ej. Juan Pérez" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="phone" className="field-label">Celular de contacto</label>
              <input type="tel" id="phone" required autoComplete="tel" inputMode="tel" className="field-input" placeholder="Ej. 987 654 321" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="field-label">Detalle del reporte</label>
            <textarea
              id="description"
              rows={5}
              required
              className="field-input resize-none"
              placeholder="Describe qué sucedió, dónde y cuándo con el mayor detalle posible..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Evidencia */}
          <div>
            <p className="field-label">
              Evidencia <span className="font-normal text-white/40">(foto opcional)</span>
            </p>
            <input type="file" id="photo" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />

            {!previewUrl && !isCameraOpen && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 text-white/60 transition-all hover:border-oro/60 hover:bg-oro/5 hover:text-oro"
                >
                  <IconCamera className="w-7 h-7" />
                  <span className="text-sm font-semibold">Usar cámara</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 text-white/60 transition-all hover:border-white/40 hover:bg-white/5 hover:text-white"
                >
                  <IconImage className="w-7 h-7" />
                  <span className="text-sm font-semibold">Galería</span>
                </button>
              </div>
            )}

            {isCameraOpen && (
              <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-oro/50 bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={stopCamera}
                    aria-label="Cerrar cámara"
                    className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    aria-label="Capturar foto"
                    className="h-16 w-16 rounded-full border-4 border-white/60 bg-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  />
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 animate-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Previsualización de la evidencia" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn absolute right-3 top-3 bg-pluma-rojo/90 px-3 py-2 text-xs text-white hover:bg-pluma-rojo"
                >
                  <IconX className="w-4 h-4" />
                  Quitar foto
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-oro w-full py-4 text-base">
            {isSubmitting ? (
              <>
                <Spinner className="w-5 h-5" /> Enviando...
              </>
            ) : (
              <>
                <IconSend className="w-5 h-5" /> Enviar reporte
              </>
            )}
          </button>
        </form>

        {/* Lateral informativo */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-pluma-rojo/30 bg-pluma-rojo/10 p-5">
            <p className="flex items-center gap-2 font-semibold text-white">
              <IconPhone className="w-5 h-5 text-[#ff8a95]" />
              ¿Riesgo inmediato?
            </p>
            <p className="mt-2 text-sm text-white/70">
              Si estás en una situación de peligro, llama a la Policía Nacional.
            </p>
            <a href="tel:105" className="btn mt-4 w-full bg-pluma-rojo py-3 text-white hover:bg-[#d92434]">
              Llamar al 105
            </a>
          </div>

          <div className="card-fest p-5">
            <p className="flex items-center gap-2 font-semibold text-white">
              <IconInfo className="w-5 h-5 text-oro" />
              ¿Cómo funciona?
            </p>
            <ol className="mt-3 space-y-3 text-sm text-white/65">
              {['Elige el tipo de reporte y describe lo ocurrido.', 'Adjunta una foto si puedes: ayuda mucho.', 'El comité de seguridad lo revisa y te contacta si es necesario.'].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-oro/15 text-xs font-bold text-oro">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
