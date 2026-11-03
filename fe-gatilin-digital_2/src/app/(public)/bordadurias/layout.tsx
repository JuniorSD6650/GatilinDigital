import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bordadurías",
  description: "Los talleres que bordan los trajes de la festividad.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
