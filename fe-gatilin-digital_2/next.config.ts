import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/Coolify usa NEXT_OUTPUT=standalone (servidor Node). Por defecto se
  // mantiene el export estático (carpeta out/) para hosting estático.
  output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : 'export',
  images: { unoptimized: true },
  reactCompiler: true,
};

export default nextConfig;
