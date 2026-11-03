import Navbar from "@/components/Navbar";
import FloatingButtons from "@/components/FloatingButtons";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Resplandor ambiental: plumaje difuminado en el fondo */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-pluma-magenta/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[30rem] w-[30rem] rounded-full bg-pluma-violeta/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 h-[22rem] w-[22rem] rounded-full bg-oro/5 blur-[120px]" />
      </div>

      <Navbar />
      <FloatingButtons />

      <main className="min-h-[70vh] pt-16">{children}</main>

      <Footer />
    </>
  );
}
