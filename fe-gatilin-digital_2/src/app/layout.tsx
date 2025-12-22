import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import FloatingReportButton from "@/components/FloatingButtons";
// import WelcomeModal from "@/components/WelcomeModal";
import Footer from "@/components/Footer";
import { AlertProvider } from "@/components/AlertContext";

export const metadata: Metadata = {
  title: "Gatilín Digital - Negritos de Huánuco",
  description: "La App oficial de la festividad de los Negritos de Huánuco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Cargamos la fuente Gabriela desde Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Gabriela&display=swap" 
          rel="stylesheet" 
        />
      </head>
      
      {/* Nota: Ya no es necesario poner style={{ fontFamily... }} aquí 
        porque tu globals.css ya aplica la fuente al 'body' automáticamente.
      */}
      <body className="antialiased min-h-screen pt-16 bg-neutral-950 text-white">
        <AlertProvider>
          {/* pt-16 compensa la altura del Navbar fijo */}
          <Navbar />
          
          {/* Modal de bienvenida (solo aparece una vez) */}
          {/* <WelcomeModal /> */}
          
          {/* Botón flotante de reporte (Matraca) */}
          <FloatingReportButton />
          
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </AlertProvider>
      </body>
    </html>
  );
}