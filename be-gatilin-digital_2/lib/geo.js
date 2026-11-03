// Utilidades de ubicación.

const enRango = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

/**
 * Intenta extraer coordenadas de un enlace de Google Maps u OpenStreetMap.
 * Soporta: .../@-9.93,-76.24,17z  ·  ?q=-9.93,-76.24  ·  ?ll=  ·  !3d-9.93!4d-76.24  ·  geo:-9.93,-76.24
 * Los enlaces cortos (maps.app.goo.gl) no contienen coordenadas y devuelven null.
 */
const coordsDesdeLink = (link) => {
  if (!link) return null;
  let texto = String(link);
  try {
    texto = decodeURIComponent(texto);
  } catch {
    /* enlace mal codificado: se usa tal cual */
  }
  const patrones = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|ll|query|destination|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[#&]map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/,
  ];
  for (const re of patrones) {
    const m = texto.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (enRango(lat, lng)) return { lat, lng };
    }
  }
  return null;
};

const linkDesdeCoords = (lat, lng) => `https://www.google.com/maps?q=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

module.exports = { coordsDesdeLink, linkDesdeCoords, enRango };
