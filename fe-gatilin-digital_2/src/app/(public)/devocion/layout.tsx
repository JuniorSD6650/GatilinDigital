import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Fe y Devoción",
  description: "La adoración al Niño Jesús, corazón de la danza de los Negritos de Huánuco.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
