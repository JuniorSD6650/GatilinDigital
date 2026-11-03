import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AlertProvider } from "@/components/AlertContext";
import PwaProvider from "@/components/PwaProvider";

const DESCRIPCION =
  "La app oficial de la Festividad de los Negritos de Huánuco: mapa en vivo, agenda, festival, sigueteo de cofradías, personajes, historia y devoción.";

export const metadata: Metadata = {
  // URL pública del sitio (para las imágenes de vista previa). Defínela en .env.production
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Gatilín Digital · Negritos de Huánuco",
  description: DESCRIPCION,
  manifest: "/manifest.webmanifest",
  applicationName: "Gatilín Digital",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Gatilín", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Gatilín Digital",
    title: "Gatilín Digital · Negritos de Huánuco",
    description: DESCRIPCION,
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
    locale: "es_PE",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0812",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700&family=Outfit:wght@300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-noche text-negrito-text">
        <AlertProvider>
          {children}
          <PwaProvider />
        </AlertProvider>
      </body>
    </html>
  );
}
