'use client';

import { useEffect, useState } from 'react';
import { API_URL, BASE_URL } from '@/services/api';
import { getAuthHeadersForFormData } from '@/services/apis/api-auth';
import { getFotosCuadrilla, type FotoCuadrilla } from '@/services/apis/api-normal';
import { useAlert } from '@/components/AlertContext';
import { AdminModal, ModalSave, ActionButton } from '@/components/admin/AdminUI';

interface Props {
  cofradia: { id: number; nickname_cofradia: string };
  onClose: () => void;
}

const anioPorDefecto = () => {
  const now = new Date();
  return now.getMonth() + 1 <= 6 ? now.getFullYear() - 1 : now.getFullYear();
};

/** Gestión de la foto grupal de la cuadrilla (una por año) */
export default function FotosCuadrillaModal({ cofradia, onClose }: Props) {
  const { showAlert, showConfirm } = useAlert();
  const [fotos, setFotos] = useState<FotoCuadrilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(anioPorDefecto());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setFotos(await getFotosCuadrilla(cofradia.id));
    setLoading(false);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cofradia.id]);

  useEffect(() => {
    if (!archivo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const existente = fotos.find((f) => f.anio === anio);

  const subir = async () => {
    if (!archivo) return;
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('anio', String(anio));
      fd.append('foto', archivo);
      const res = await fetch(`${API_URL}/cofradia/${cofradia.id}/fotos`, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo subir la foto');
      showAlert('success', existente ? `Foto de ${anio} reemplazada` : `Foto de ${anio} guardada`);
      setArchivo(null);
      await cargar();
    } catch (err) {
      showAlert('error', (err as Error).message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminar = (foto: FotoCuadrilla) => {
    showConfirm({
      title: 'Eliminar foto',
      message: `¿Eliminar la foto de la cuadrilla del año ${foto.anio}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/cofradia/fotos/${foto.id}`, {
            method: 'DELETE',
            headers: getAuthHeadersForFormData(),
          });
          if (!res.ok) throw new Error('No se pudo eliminar la foto');
          showAlert('success', 'Foto eliminada');
          await cargar();
        } catch (err) {
          showAlert('error', (err as Error).message);
        }
      },
    });
  };

  const urlDe = (ruta: string) => (ruta.startsWith('http') ? ruta : `${BASE_URL}/${ruta}`);

  return (
    <AdminModal open onClose={onClose} locked={subiendo} title="Foto de la cuadrilla" subtitle={cofradia.nickname_cofradia} size="md">
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Sube una sola foto grupal por temporada donde aparezcan todos los integrantes. En el Sigueteo se mostrará sobre la
            lista de nombres del año seleccionado.
          </p>

          {/* Subir */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <label className="space-y-2">
                <span className="block text-sm font-medium text-gray-300">Año</span>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value, 10) || anioPorDefecto())}
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                />
              </label>
              <label className="space-y-2">
                <span className="block text-sm font-medium text-gray-300">Imagen (JPG, PNG o WEBP, máx. 8 MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-festivo-gold/90 file:px-3 file:py-2 file:font-semibold file:text-negrito-black"
                />
              </label>
            </div>

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Vista previa" className="max-h-64 w-full rounded-lg object-cover" />
            )}

            {existente && archivo && (
              <p className="text-xs text-yellow-400">Ya existe una foto para {anio}; se reemplazará.</p>
            )}

            <div className="flex justify-end">
              <ModalSave onClick={subir} loading={subiendo} disabled={!archivo} loadingText="Subiendo...">
                {existente ? 'Reemplazar foto' : 'Subir foto'}
              </ModalSave>
            </div>
          </div>

          {/* Fotos existentes */}
          <div>
            <h4 className="mb-3 text-lg font-semibold text-white">Fotos guardadas</h4>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : fotos.length === 0 ? (
              <p className="text-sm text-gray-500">Esta cofradía aún no tiene fotos de cuadrilla.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {fotos.map((f) => (
                  <li key={f.id} className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                    <a href={urlDe(f.ruta_foto)} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={urlDe(f.ruta_foto)} alt={`Cuadrilla ${f.anio}`} className="aspect-video w-full object-cover" />
                    </a>
                    <div className="flex items-center justify-between p-3">
                      <span className="font-semibold text-white">{f.anio}</span>
                      <ActionButton kind="delete" onClick={() => eliminar(f)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
    </AdminModal>
  );
}
