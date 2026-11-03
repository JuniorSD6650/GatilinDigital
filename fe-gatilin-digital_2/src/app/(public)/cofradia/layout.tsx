import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cofradía",
  description: "Historia, recorrido y agenda de la cofradía.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
