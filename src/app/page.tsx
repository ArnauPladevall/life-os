"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const LobbyGrid = dynamic(() => import("@/features/lobby/LobbyGrid"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#121212] text-gray-500">
      <Loader2 className="animate-spin text-blue-500" size={32} />
      <p className="animate-pulse text-sm font-medium">Loading board...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen">
      <LobbyGrid />
    </main>
  );
}