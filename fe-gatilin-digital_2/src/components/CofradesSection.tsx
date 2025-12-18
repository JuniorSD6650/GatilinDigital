'use client';
import { useState, useEffect } from 'react';
import { getCofradesbyCofradia, Cofrade } from '@/services/apis/api-normal';
import { API_URL } from '@/services/api';

interface CofradesSeccionProps {
  cofradiaId: number;
  cofradiaColor: string;
}

export default function CofradesSection({ cofradiaId, cofradiaColor }: CofradesSeccionProps) {
  const [cofrades, setCofrades] = useState<Cofrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCofrades = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCofradesbyCofradia(cofradiaId);
        setCofrades(data);
      } catch (err) {
        console.error('Error cargando cofrades:', err);
        setError('No se pudieron cargar los cofrades');
      } finally {
        setLoading(false);
      }
    };

    if (cofradiaId) {
      fetchCofrades();
    }
  }, [cofradiaId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
              <div className="h-24 bg-white/10 rounded-lg mb-3" />
              <div className="h-4 bg-white/10 rounded mb-2" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (cofrades.length === 0) {
    return (
      <div className="space-y-4">
        <h3
          className="text-lg font-bold text-white border-b pb-2"
          style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
        >
          Integrantes de la Cuadrilla
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>No hay cofrades registrados en esta cuadrilla</p>
        </div>
      </div>
    );
  }

  // Agrupar por año
  const cofradesGroupedByYear = cofrades.reduce((acc, cofrade) => {
    const year = cofrade.anio;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(cofrade);
    return acc;
  }, {} as Record<number, Cofrade[]>);

  const years = Object.keys(cofradesGroupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <h3
        className="text-lg font-bold text-white border-b pb-2"
        style={{ color: cofradiaColor, borderColor: `${cofradiaColor}40` }}
      >
        Integrantes de la Cuadrilla
      </h3>

      {years.map((year) => (
        <div key={year} className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: cofradiaColor }}
            >
              {year}
            </div>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cofradesGroupedByYear[year].map((cofrade) => (
              <div
                key={cofrade.id}
                className="group bg-gradient-to-br from-neutral-900 to-black rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  boxShadow: `0 4px 12px ${cofradiaColor}20`,
                }}
              >
                {/* Foto */}
                <div className="relative h-40 bg-neutral-800 overflow-hidden">
                  {cofrade.ruta_foto ? (
                    <img
                      src={`${API_URL}/${cofrade.ruta_foto}`}
                      alt={cofrade.nombres_apellidos}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-16 h-16 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                  )}
                  
                  {/* Badge de cargo sobre la foto */}
                  {cofrade.cargo_cofrade && cofrade.cargo_cofrade.toLowerCase() !== 'ninguno' && (
                    <div
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: `${cofradiaColor}DD` }}
                    >
                      {cofrade.cargo_cofrade}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">
                    {cofrade.nombres_apellidos}
                  </h4>

                  {cofrade.personaje_cofradia && cofrade.personaje_cofradia.toLowerCase() !== 'ninguno' && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                        style={{ color: cofradiaColor }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                        />
                      </svg>
                      <span className="line-clamp-1">{cofrade.personaje_cofradia}</span>
                    </div>
                  )}

                  {cofrade.celular && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                        />
                      </svg>
                      <span>{cofrade.celular}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
