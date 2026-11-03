'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import Cintas from '@/components/decor/Cintas';
import CadenaDivider from '@/components/decor/CadenaDivider';
import { useAlert } from '@/components/AlertContext';
import { createParticipante } from '@/services/apis/api-normal';
import { IconArrowLeft, IconArrowRight, IconCalendar, IconMusic, IconSparkle, IconUsers, Spinner } from '@/components/ui/Icons';

const BENEFICIOS = [
  { icon: IconUsers, title: 'Únete a una cuadrilla', text: 'Te conectamos con una cofradía que te acoja.' },
  { icon: IconMusic, title: 'Aprende los pasos', text: 'Ensayos guiados por caporales con experiencia.' },
  { icon: IconSparkle, title: 'Viste la tradición', text: 'Orientación sobre el traje, bordados y accesorios.' },
  { icon: IconCalendar, title: 'Fechas y recorridos', text: 'Te avisamos de las fechas de participación.' },
];

export default function RegistroPage() {
  const { showAlert } = useAlert();
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
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Formato 'YYYY-MM-DD HH:MM:SS' (el backend fija la fecha real del registro)
      const fechaMySQL = new Date().toISOString().slice(0, 19).replace('T', ' ');

      await createParticipante({
        ...formData,
        fecha_registro: fechaMySQL,
        estado: 'pendiente',
      });

      showAlert('success', '¡Bienvenido! Recibimos tu registro y te contactaremos para coordinar tu participación.');
      setFormData({ nombre: '', dni: '', email: '', telefono: '', comentario: '' });
    } catch (error) {
      console.error(error);
      showAlert('error', 'Hubo un error al registrarte. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fest pt-8 animate-in">
      <div className="grid overflow-hidden rounded-3xl border border-white/10 lg:grid-cols-[1fr_1.15fr]">
        {/* Panel de invitación */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#2a1a07] via-terciopelo to-noche p-7 sm:p-10">
          <div aria-hidden className="bordado absolute inset-0 -z-10 opacity-[0.12]" />
          <Cintas className="pointer-events-none absolute -top-1 right-4 h-48 w-24 sm:right-8" count={7} />

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            <IconArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Inicio
          </Link>

          <p className="eyebrow mt-10 text-oro">Vive la danza</p>
          <h1 className="mt-3 max-w-sm pr-16 font-display text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
            Baila para el <span className="italic text-oro">Niño Jesús</span>
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            No seas solo un espectador. Únete a una cuadrilla, aprende los pasos y siente la emoción de bailar en la Navidad más grande
            del mundo.
          </p>

          <CadenaDivider className="mt-8 max-w-[220px]" />

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {BENEFICIOS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-oro/25 bg-oro/10 text-oro">
                  <Icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{title}</span>
                  <span className="block text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="plumaje-band absolute inset-x-0 bottom-0 lg:hidden" />
        </section>

        {/* Formulario */}
        <section className="bg-noche-2/80 p-7 sm:p-10" style={{ '--accent': '#f2c14e' } as React.CSSProperties}>
          <h2 className="font-display text-2xl font-semibold text-white">Formulario de inscripción</h2>
          <p className="mt-1 text-sm text-white/55">Completa tus datos y te contactaremos.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="nombre" className="field-label">Nombre completo</label>
              <input type="text" id="nombre" required autoComplete="name" className="field-input" placeholder="Ej. María Rodríguez" value={formData.nombre} onChange={handleChange} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="dni" className="field-label">DNI o pasaporte</label>
                <input type="text" id="dni" required className="field-input" placeholder="Documento de identidad" value={formData.dni} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="telefono" className="field-label">Teléfono / WhatsApp</label>
                <input type="tel" id="telefono" required autoComplete="tel" inputMode="tel" className="field-input" placeholder="+51 987 654 321" value={formData.telefono} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="field-label">Correo electrónico</label>
              <input type="email" id="email" required autoComplete="email" className="field-input" placeholder="ejemplo@correo.com" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="comentario" className="field-label">
                ¿Por qué quieres participar? <span className="font-normal text-white/40">(opcional)</span>
              </label>
              <textarea
                id="comentario"
                rows={4}
                className="field-input resize-none"
                placeholder="Cuéntanos tu experiencia previa (si tienes) o tus ganas de aprender..."
                value={formData.comentario}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-oro w-full py-4 text-base">
              {isSubmitting ? (
                <>
                  <Spinner className="w-5 h-5" /> Registrando...
                </>
              ) : (
                <>
                  Quiero participar <IconArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-xs leading-relaxed text-white/45">
              Al registrarte, aceptas ser contactado por los organizadores para recibir información sobre ensayos, vestimenta y fechas de
              participación.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
