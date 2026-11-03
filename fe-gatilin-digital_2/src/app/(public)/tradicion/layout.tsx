import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Tradición",
  description: "De las haciendas coloniales al Patrimonio Cultural de la Nación: la historia de los Negritos de Huánuco.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
