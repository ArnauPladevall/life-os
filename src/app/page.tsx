"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

// Cargamos el Lobby de forma dinámica
const LobbyGrid = dynamic(() => import("@/features/lobby/LobbyGrid"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-gray-500 gap-3">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <p className="text-sm font-medium animate-pulse">Cargando escritorio...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen relative z-10">
      <LobbyGrid />
    </main>
  );
}