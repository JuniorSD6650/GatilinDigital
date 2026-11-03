import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Festival Oficial",
  description: "Cronograma oficial de presentaciones de las cofradías en la Plaza de Armas, día por día.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
