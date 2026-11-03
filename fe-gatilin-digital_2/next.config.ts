import type { NextConfig } from "next";

// Export estático (carpeta out/): el backend Express lo sirve junto a /api
// en un solo servidor y dominio.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactCompiler: true,
};

export default nextConfig;
