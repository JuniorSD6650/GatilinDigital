import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sigueteo",
  description: "Encuentra a tu cofradía, mira en el mapa dónde está ahora y consulta su agenda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
