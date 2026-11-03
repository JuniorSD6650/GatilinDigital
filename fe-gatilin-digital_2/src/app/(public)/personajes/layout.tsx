import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Personajes",
  description: "El Negrito, el Corochano, la Dama, el Turco y el Abanderado: conoce la comparsa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
