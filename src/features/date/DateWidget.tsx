"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function DateWidget({ size }: { size: WidgetSize }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
  const day = now.getDate().toString().padStart(2, "0");
  const month = now.toLocaleDateString(undefined, { month: "long" });
  const year = now.getFullYear();

  const compact = size === "1x1";
  const wide = size === "2x1" || size === "4x2";

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-2 text-white/80">
        <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
          <Calendar size={16} />
        </div>
        <div className="text-sm font-semibold text-white">Fecha</div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {!compact && <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">{weekday}</div>}
          <div className={`mt-2 ${compact ? "text-5xl" : wide ? "text-7xl" : "text-6xl"} font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40`}>
            {day}
          </div>
          <div className={`${compact ? "mt-2 text-[11px]" : "mt-1 text-sm"} text-white/60 capitalize`}>{month} · {year}</div>
        </div>
      </div>

      {size === "4x2" && (
        <div className="mt-3 grid grid-cols-7 gap-2 text-[10px] text-white/40 select-none">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - ((now.getDay() + 6) % 7) + i);
            const label = d.toLocaleDateString(undefined, { weekday: "short" });
            const num = d.getDate().toString().padStart(2, "0");
            const isToday = d.toDateString() === now.toDateString();
            return (
              <div key={i} className={`rounded-2xl border p-2 text-center ${isToday ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10"}`}>
                <div className="uppercase tracking-widest">{label}</div>
                <div className="mt-1 font-mono text-xs text-white/70">{num}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
