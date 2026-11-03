'use client';

// Carga masiva en dos pasos:
//  1) el servidor valida el Excel y muestra la vista previa + errores por fila (sin guardar)
//  2) el admin confirma y se importan solo las filas válidas
import { useEffect, useState } from 'react';
import { previewExcel, uploadExcel, type BulkPreview, type BulkResultado, type FilaConError } from '@/services/apis/api-admin';
import { AdminModal, ModalCancel, ModalSave } from './AdminUI';

const ETIQUETAS: Record<string, string> = {
  nickname_cofradia: 'Cofradía', nombre_cofradia: 'Nombre', fecha: 'Fecha', hora: 'Hora', direccion_actividad: 'Dirección',
  oferente: 'Oferente', cod_cofradia: 'Cód. cofradía', dni_cofrade: 'DNI', nombres_apellidos: 'Nombre', anio: 'Año',
  razon_social: 'Razón social', ruc: 'RUC', username: 'Usuario', cofradia_id: 'Cofradía', tipo_evento: 'Tipo',
};

const formatear = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
};

function TablaErrores({ errores }: { errores: FilaConError[] }) {
  if (errores.length === 0) return null;
  return (
    <div className="max-h-56 overflow-y-auto rounded-xl border border-red-500/30">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-red-950/90 text-red-200">
          <tr><th className="px-3 py-2">Fila</th><th className="px-3 py-2">Problema</th></tr>
        </thead>
        <tbody className="divide-y divide-red-500/10">
          {errores.map((e) => (
            <tr key={e.fila} className="align-top">
              <td className="px-3 py-2 font-semibold text-red-300 tabular-nums">{e.fila}</td>
              <td className="px-3 py-2 text-red-200/90">{e.errores.join(' · ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BulkUploadModal({
  open, file, endpoint, onClose, onDone,
}: { open: boolean; file: File | null; endpoint: string; onClose: () => void; onDone: () => void }) {
  const [preview, setPreview] = useState<BulkPreview | null>(null);
  const [resultado, setResultado] = useState<BulkResultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Validar cada vez que llega un archivo nuevo
  useEffect(() => {
    if (!open || !file) return;
    let activo = true;
    setPreview(null);
    setResultado(null);
    setError('');
    setCargando(true);
    previewExcel(endpoint, file)
      .then((p) => activo && setPreview(p))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [open, file, endpoint]);

  const cerrar = () => {
    if (cargando) return;
    if (resultado && resultado.insertados > 0) onDone();
    onClose();
  };

  const importar = async () => {
    if (!file) return;
    setCargando(true);
    setError('');
    try {
      setResultado(await uploadExcel(endpoint, file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  const columnas = preview?.preview[0] ? Object.keys(preview.preview[0]).filter((k) => k !== 'fila' && !/password/i.test(k)).slice(0, 6) : [];

  return (
    <AdminModal
      open={open}
      onClose={cerrar}
      locked={cargando}
      size="xl"
      title={resultado ? 'Resultado de la carga' : 'Vista previa de la carga'}
      subtitle={file?.name}
      footer={
        resultado ? (
          <ModalSave onClick={cerrar}>Listo</ModalSave>
        ) : (
          <>
            <ModalCancel onClick={cerrar} disabled={cargando} />
            <ModalSave onClick={importar} loading={cargando && !!preview} loadingText="Importando..." disabled={!preview || preview.validos === 0 || cargando}>
              {preview ? `Importar ${preview.validos} ${preview.validos === 1 ? 'fila' : 'filas'}` : 'Importar'}
            </ModalSave>
          </>
        )
      }
    >
      {error && <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      {cargando && !preview && !resultado && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-festivo-gold border-t-transparent" />
          <p className="text-sm text-gray-400">Validando el archivo…</p>
        </div>
      )}

      {resultado && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 p-4"><p className="text-2xl font-bold text-white">{resultado.total}</p><p className="text-xs text-gray-400">Filas</p></div>
            <div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-2xl font-bold text-emerald-300">{resultado.insertados}</p><p className="text-xs text-gray-400">Importadas</p></div>
            <div className="rounded-xl bg-red-500/10 p-4"><p className="text-2xl font-bold text-red-300">{resultado.fallidos}</p><p className="text-xs text-gray-400">Con errores</p></div>
          </div>
          {resultado.errores.length > 0 && (
            <>
              <p className="text-sm text-gray-300">Corrige estas filas en tu Excel y vuelve a cargar solo esas:</p>
              <TablaErrores errores={resultado.errores} />
            </>
          )}
        </div>
      )}

      {preview && !resultado && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/5 p-4"><p className="text-2xl font-bold text-white">{preview.total}</p><p className="text-xs text-gray-400">Filas en el archivo</p></div>
            <div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-2xl font-bold text-emerald-300">{preview.validos}</p><p className="text-xs text-gray-400">Listas para importar</p></div>
            <div className="rounded-xl bg-red-500/10 p-4"><p className="text-2xl font-bold text-red-300">{preview.invalidos}</p><p className="text-xs text-gray-400">Con errores (se omitirán)</p></div>
          </div>

          {preview.errores.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-300">Filas con errores</p>
              <TablaErrores errores={preview.errores} />
            </div>
          )}

          {preview.preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">
                Así se guardarán {preview.validos > preview.preview.length ? `(primeras ${preview.preview.length})` : ''}
              </p>
              <div className="max-h-72 overflow-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-negrito-card text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Fila</th>
                      {columnas.map((c) => <th key={c} className="whitespace-nowrap px-3 py-2">{ETIQUETAS[c] || c}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {preview.preview.map((r) => (
                      <tr key={String(r.fila)}>
                        <td className="px-3 py-2 tabular-nums text-gray-500">{String(r.fila)}</td>
                        {columnas.map((c) => <td key={c} className="max-w-[220px] truncate px-3 py-2">{formatear(r[c])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {preview.total === 0 && <p className="text-sm text-gray-400">El archivo no tiene filas con datos.</p>}
        </div>
      )}
    </AdminModal>
  );
}
