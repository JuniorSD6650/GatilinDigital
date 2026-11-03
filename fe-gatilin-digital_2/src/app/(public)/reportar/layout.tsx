import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Reportar anomalía",
  description: "Reporta incidentes, objetos perdidos o problemas de organización durante la festividad.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
