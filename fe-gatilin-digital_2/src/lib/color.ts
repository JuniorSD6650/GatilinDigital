/** Color de reemplazo cuando la cofradía no tiene color o es negro (invisible sobre el fondo oscuro) */
export const FALLBACK_COLOR = '#FF007F';

/**
 * Color de la cofradía listo para usar, siempre como #rrggbb.
 * En la BD hay colores con canal alfa (#rrggbbaa, p. ej. "#39e1ffff"); si no se
 * normalizan, withAlpha/contrastes no los entienden y el texto queda del mismo
 * color que su fondo.
 */
export function getDisplayColor(color?: string | null): string {
  if (!color) return FALLBACK_COLOR;
  const rgb = hexToRgb(color);
  if (!rgb) return color.trim().toLowerCase() === 'black' ? FALLBACK_COLOR : color;
  if (rgb.every((v) => v < 16)) return FALLBACK_COLOR; // negro / casi negro: invisible sobre el fondo
  return toHex(rgb);
}

/** Normaliza #abc, #abcd, #aabbcc o #aabbccdd a [r, g, b] (ignora el alfa); null si no es hex válido */
function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace('#', '').trim();
  if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Devuelve el color de texto legible (oscuro o blanco) sobre un fondo dado */
export function readableTextOn(bg: string): string {
  const rgb = hexToRgb(bg);
  if (!rgb) return '#ffffff';
  // Elige el que más contraste tenga (blanco u oscuro) en vez de un umbral fijo:
  // así colores intermedios (rosado, naranja, celeste) también quedan legibles.
  return contrast(rgb, [255, 255, 255]) >= contrast(rgb, NOCHE) ? '#ffffff' : '#120c1a';
}

/** Añade transparencia a un color hex (#rrggbb + alpha) de forma segura */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Luminancia relativa (WCAG) de un color [r, g, b] */
function luminance([r, g, b]: [number, number, number]): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Fondo base de la web (noche) */
const NOCHE: [number, number, number] = [18, 12, 26];

/**
 * Versión del color de la cofradía apta para TEXTO o íconos sobre el fondo oscuro.
 * Si el color es muy oscuro (azul marino, verde botella, morado...) se aclara
 * mezclándolo con blanco hasta alcanzar un contraste legible (WCAG AA, 4.5:1),
 * conservando su tono.
 */
export function accentOnDark(color: string, minContrast = 4.5): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  if (contrast(rgb, NOCHE) >= minContrast) return color;
  for (let t = 0.1; t <= 1; t += 0.05) {
    const mixed = rgb.map((v) => v + (255 - v) * t) as [number, number, number];
    if (contrast(mixed, NOCHE) >= minContrast) return toHex(mixed);
  }
  return '#ffffff';
}
