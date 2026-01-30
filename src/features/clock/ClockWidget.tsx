"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function ClockWidget({ size }: { size: WidgetSize }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const seconds = now.toLocaleTimeString(undefined, { second: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });

  const compact = size === "1x1";
  const wide = size === "2x1" || size === "4x2";

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <Clock3 size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-semibold text-white">Reloj</div>
        </div>
        {!compact && <div className="text-[10px] text-white/40 font-mono">{seconds}</div>}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className={`${compact ? "text-4xl" : wide ? "text-6xl" : "text-5xl"} font-mono font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/45`}>
          {time}
        </div>
      </div>

      {!compact && (
        <div className="mt-2 text-[11px] text-white/40 tracking-wide flex justify-between">
          <span>{date}</span>
          <span className="font-mono">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      )}

      {size === "4x2" && (
        <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
          <div className="text-xs text-white/50">Siguiente bloque</div>
          <div className="text-xs text-white/70 font-mono">{now.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</div>
        </div>
      )}
    </div>
  );
}
