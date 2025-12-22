'use client';

import { useState, useEffect } from 'react';
import { getCofrades, createCofrade, updateCofrade, deleteCofrade, downloadTemplate, uploadExcel, type Cofrade } from '@/services/apis/api-admin';
import { API_URL } from '@/services/api';

interface Cofradia {
  id: number;
  nickname_cofradia: string;
}

export default function CofradesAdminPage() {
  const [cofrades, setCofrades] = useState<Cofrade[]>([]);
  const [cofradias, setCofradias] = useState<Cofradia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Cofrade | null>(null);
  const [formData, setFormData] = useState<Partial<Cofrade>>({});
  const [foto, setFoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    loadCofradias();
  }, []);

  const loadData = async () => {
    try {
      const data = await getCofrades();
      setCofrades(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCofradias = async () => {
    try {
      const response = await fetch(`${API_URL}/cofradia/list`);
      const data = await response.json();
      setCofradias(data);
    } catch (err) {
      console.error('Error cargando cofradías', err);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ anio: new Date().getFullYear() });
    setFoto(null);
    setShowModal(true);
  };

  const handleEdit = (item: Cofrade) => {
    setEditingItem(item);
    setFormData(item);
    setFoto(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombres_apellidos || !formData.cod_cofradia) {
      alert('El nombre y la cofradía son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nombres_apellidos', formData.nombres_apellidos);
      fd.append('dni_cofrade', formData.dni_cofrade || '');
      fd.append('celular', formData.celular || '');
      fd.append('personaje_cofradia', formData.personaje_cofradia || '');
      fd.append('cargo_cofrade', formData.cargo_cofrade || '');
      fd.append('cod_cofradia', String(formData.cod_cofradia));
      fd.append('anio', String(formData.anio || new Date().getFullYear()));
      if (foto) {
        fd.append('foto', foto);
      }

      if (editingItem) {
        await updateCofrade(editingItem.id, fd);
      } else {
        await createCofrade(fd);
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar a "${nombre}"?`)) return;

    try {
      await deleteCofrade(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate('cofrades', 'Plantilla_Cofrades.xlsx');
  };

  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadExcel('cofrades', file);
      alert('Datos cargados correctamente');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const filteredData = cofrades.filter(c =>
    c.nombres_apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.dni_cofrade && c.dni_cofrade.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-4xl">⏳</div>
          <p className="text-gray-400">Cargando cofrades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Cofrades</h2>
          <p className="text-gray-400">Gestiona los miembros de cada cofradía</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
          >
            📥 Descargar Plantilla
          </button>
          <label className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium cursor-pointer">
            📤 Cargar Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
          </label>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 transition-colors text-sm font-bold"
          >
            ➕ Nuevo Cofrade
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-3 bg-negrito-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-negrito-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">DNI</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nombres</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Personaje</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cargo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Celular</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Año</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-300">{item.dni_cofrade || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{item.nombres_apellidos}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.personaje_cofradia || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.cargo_cofrade || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.celular || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.anio || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.nombres_apellidos)}
                      className="px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No se encontraron cofrades
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-negrito-card border border-white/10 rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-6">
              {editingItem ? 'Editar Cofrade' : 'Nuevo Cofrade'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DNI
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.dni_cofrade || ''}
                  onChange={(e) => setFormData({ ...formData, dni_cofrade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombres y Apellidos <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.nombres_apellidos || ''}
                  onChange={(e) => setFormData({ ...formData, nombres_apellidos: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Celular
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.celular || ''}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cofradía <span className="text-red-400">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.cod_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, cod_cofradia: Number(e.target.value) })}
                >
                  <option value="">Seleccionar...</option>
                  {cofradias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nickname_cofradia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personaje
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.personaje_cofradia || ''}
                  onChange={(e) => setFormData({ ...formData, personaje_cofradia: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.cargo_cofrade || ''}
                  onChange={(e) => setFormData({ ...formData, cargo_cofrade: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  value={formData.anio || new Date().getFullYear()}
                  onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Foto
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 bg-negrito-bg border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-festivo-gold/50"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
                {editingItem?.ruta_foto && !foto && (
                  <p className="text-xs text-gray-400 mt-1">Foto actual: {editingItem.ruta_foto}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-festivo-gold text-negrito-bg rounded-lg hover:bg-yellow-500 font-bold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
