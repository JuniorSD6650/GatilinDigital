import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Baila con nosotros",
  description: "Únete a una cuadrilla y baila para el Niño Jesús.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
