'use client';

// Mapa Leaflet (solo navegador). Se carga con next/dynamic y ssr:false.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CofradiaMapa } from '@/services/apis/api-normal';
import { getDisplayColor } from '@/lib/color';
import { HUANUCO, haceCuanto, estaEnVivo } from './utils';

const TILES_URL = process.env.NEXT_PUBLIC_MAP_TILES_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILES_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const icono = (c: CofradiaMapa, seleccionada: boolean) => {
  const color = getDisplayColor(c.color);
  const vivo = estaEnVivo(c);
  const size = seleccionada ? 26 : 20;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span class="gd-marker${vivo ? ' gd-marker--vivo' : ''}" style="--c:${color};width:${size}px;height:${size}px;${vivo ? '' : 'opacity:.7'}"></span>`,
  });
};

const popupHtml = (c: CofradiaMapa) => {
  const pagina = c.slug ? `/cofradia?slug=${encodeURIComponent(c.slug)}` : `/sigueteo?cofradia=${c.id}`;
  const llegar = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
  return `
    <div class="gd-popup">
      <strong>${esc(c.nickname_cofradia)}</strong>
      <p>${estaEnVivo(c) ? '<span class="gd-vivo">● EN VIVO</span> · ' : ''}Actualizado ${haceCuanto(c.minutos_desde_actualizacion)}</p>
      ${c.precision ? `<p class="gd-muted">Precisión aprox. ${c.precision} m</p>` : ''}
      <div class="gd-popup-actions">
        <a href="${pagina}">Ver cofradía</a>
        <a href="${llegar}" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
      </div>
    </div>`;
};

interface Props {
  cofradias: CofradiaMapa[];
  seleccionadaId: number | null;
  onSelect: (id: number) => void;
  miUbicacion: { lat: number; lng: number; precision: number } | null;
  centrarEnMi: number; // cambia para pedir centrar en mi ubicación
}

export default function MapaLeaflet({ cofradias, seleccionadaId, onSelect, miUbicacion, centrarEnMi }: Props) {
  const contRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const yoRef = useRef<L.CircleMarker | null>(null);
  const yoCirculoRef = useRef<L.Circle | null>(null);
  const encuadradoRef = useRef(false);

  // Crear mapa una sola vez
  useEffect(() => {
    if (!contRef.current || mapRef.current) return;
    const map = L.map(contRef.current, { center: HUANUCO, zoom: 14, zoomControl: true, attributionControl: true });
    // Teselas: OpenStreetMap por defecto (sin API key). Su política de uso exige
    // un Referer válido: se pide explícitamente (y el servidor ya no envía "no-referrer").
    // Para otro proveedor (p. ej. uno con clave propia) define NEXT_PUBLIC_MAP_TILES_URL
    // y NEXT_PUBLIC_MAP_ATTRIBUTION al compilar.
    // El tono oscuro se logra con un filtro CSS en .gd-tiles-oscuras (globals.css),
    // que solo afecta al fondo: los marcadores conservan sus colores reales.
    L.tileLayer(TILES_URL, {
      maxZoom: 19,
      className: 'gd-tiles-oscuras',
      referrerPolicy: 'strict-origin-when-cross-origin',
      attribution: TILES_ATTRIBUTION,
    }).addTo(map);
    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

  // Sincronizar marcadores
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const conCoords = cofradias.filter((c) => c.lat !== null && c.lng !== null);
    const vistos = new Set<number>();

    for (const c of conCoords) {
      vistos.add(c.id);
      const pos: [number, number] = [c.lat as number, c.lng as number];
      let m = markersRef.current.get(c.id);
      if (!m) {
        m = L.marker(pos, { icon: icono(c, c.id === seleccionadaId), title: c.nickname_cofradia, riseOnHover: true })
          .addTo(map)
          .bindPopup(popupHtml(c), { closeButton: true, autoPanPadding: [24, 24] });
        m.on('click', () => onSelect(c.id));
        markersRef.current.set(c.id, m);
      } else {
        m.setLatLng(pos);
        m.setIcon(icono(c, c.id === seleccionadaId));
        m.setPopupContent(popupHtml(c));
      }
      m.setZIndexOffset(c.id === seleccionadaId ? 1000 : estaEnVivo(c) ? 500 : 0);
    }
    // Quitar los que ya no están (por filtros)
    for (const [id, m] of markersRef.current) {
      if (!vistos.has(id)) {
        m.remove();
        markersRef.current.delete(id);
      }
    }

    // Encuadre inicial
    if (!encuadradoRef.current && conCoords.length > 0 && seleccionadaId === null) {
      encuadradoRef.current = true;
      if (conCoords.length === 1) map.setView([conCoords[0].lat as number, conCoords[0].lng as number], 16);
      else map.fitBounds(L.latLngBounds(conCoords.map((c) => [c.lat as number, c.lng as number])), { padding: [40, 40], maxZoom: 16 });
    }
  }, [cofradias, seleccionadaId, onSelect]);

  // Centrar y abrir la seleccionada
  useEffect(() => {
    const map = mapRef.current;
    if (!map || seleccionadaId === null) return;
    const m = markersRef.current.get(seleccionadaId);
    if (m) {
      encuadradoRef.current = true;
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 16), { animate: true });
      m.openPopup();
    }
  }, [seleccionadaId, cofradias]);

  // Mi ubicación
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!miUbicacion) {
      yoRef.current?.remove();
      yoCirculoRef.current?.remove();
      yoRef.current = null;
      yoCirculoRef.current = null;
      return;
    }
    const pos: [number, number] = [miUbicacion.lat, miUbicacion.lng];
    if (!yoRef.current) {
      yoCirculoRef.current = L.circle(pos, { radius: miUbicacion.precision, color: '#4f86ff', weight: 1, fillOpacity: 0.12 }).addTo(map);
      yoRef.current = L.circleMarker(pos, { radius: 7, color: '#fff', weight: 2, fillColor: '#4f86ff', fillOpacity: 1 })
        .addTo(map)
        .bindTooltip('Tú estás aquí');
    } else {
      yoRef.current.setLatLng(pos);
      yoCirculoRef.current?.setLatLng(pos).setRadius(miUbicacion.precision);
    }
  }, [miUbicacion]);

  useEffect(() => {
    if (centrarEnMi && miUbicacion && mapRef.current) mapRef.current.setView([miUbicacion.lat, miUbicacion.lng], 16);
    // Solo cuando se pide centrar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centrarEnMi]);

  return <div ref={contRef} className="h-full w-full" role="application" aria-label="Mapa de cofradías" />;
}
