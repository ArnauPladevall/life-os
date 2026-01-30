import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Importamos la fuente profesional
import "./globals.css";
import { LocaleProvider } from "@/context/LocaleContext";

// Configuramos la fuente Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Tu sistema operativo personal de productividad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-bg-primary text-text-primary antialiased selection:bg-purple-500/30`}>
        
        {/* Aquí está tu fondo Aurora animado, presente en TODA la app */}
        <div className="aurora-bg animate-aurora pointer-events-none" />
        
        {/* El contenido de la página va encima */}
        <LocaleProvider>
          <div className="relative z-10">{children}</div>
        </LocaleProvider>

      </body>
    </html>
  );
}