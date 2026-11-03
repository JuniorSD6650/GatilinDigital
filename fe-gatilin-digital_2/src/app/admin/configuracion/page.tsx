'use client';

import { useEffect, useState } from 'react';
import { getOrganizaciones, createOrganizacion, updateOrganizacion, type Organizacion } from '@/services/apis/api-admin';
import { useAlert } from '@/components/AlertContext';
import { PageToolbar, ModalSave } from '@/components/admin/AdminUI';

/**
 * Configuración del sitio: información de la organización.
 * Solo existe una organización (la que organiza la festividad), por lo que
 * aquí se edita directamente en lugar de gestionarse como una lista.
 */
export default function ConfiguracionPage() {
  const { showAlert } = useAlert();
  const [org, setOrg] = useState<Organizacion | null>(null);
  const [form, setForm] = useState<Partial<Organizacion>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      const data = await getOrganizaciones();
      const principal = [...data].sort((a, b) => a.id - b.id)[0] ?? null;
      setOrg(principal);
      setForm(principal ?? {});
    } catch (err) {
      setError((err as Error).message || 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambios =
    (form.nombre ?? '') !== (org?.nombre ?? '') ||
    (form.descripcion ?? '') !== (org?.descripcion ?? '') ||
    (form.streaming_link ?? '') !== (org?.streaming_link ?? '');

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre?.trim()) {
      showAlert('error', 'El nombre de la organización es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const datos = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() ?? '',
        streaming_link: form.streaming_link?.trim() ?? '',
      };
      if (org) await updateOrganizacion(org.id, datos);
      else await createOrganizacion(datos);
      showAlert('success', 'Información de la organización guardada');
      await cargar();
    } catch (err) {
      showAlert('error', (err as Error).message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50';

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-festivo-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageToolbar
        title="Configuración del sitio"
        subtitle="Información de la organización que se muestra en la web pública"
      />

      {error && <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400">{error}</div>}

      <form onSubmit={guardar} className="max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-negrito-card">
        <div className="border-b border-white/10 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Información de la organización</h3>
          <p className="text-sm text-gray-400">
            {org ? 'Edita los datos y guarda los cambios.' : 'Aún no hay datos registrados. Completa el formulario para crearlos.'}
          </p>
        </div>

        <div className="space-y-5 p-6">
          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-300">
              Nombre <span className="text-red-400">*</span>
            </span>
            <input
              type="text"
              className={inputCls}
              value={form.nombre ?? ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Federación de Negritos de Huánuco"
            />
          </label>

          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-300">Descripción</span>
            <textarea
              rows={4}
              className={inputCls}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </label>

          <label className="block space-y-2">
            <span className="block text-sm font-medium text-gray-300">Link de transmisión en vivo</span>
            <input
              type="url"
              className={inputCls}
              value={form.streaming_link ?? ''}
              onChange={(e) => setForm({ ...form, streaming_link: e.target.value })}
              placeholder="https://..."
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          {cambios && org && (
            <button
              type="button"
              onClick={() => setForm(org)}
              className="h-10 rounded-lg px-4 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Descartar cambios
            </button>
          )}
          <ModalSave type="submit" loading={saving} disabled={!cambios}>
            {org ? 'Guardar cambios' : 'Crear'}
          </ModalSave>
        </div>
      </form>
    </div>
  );
}
