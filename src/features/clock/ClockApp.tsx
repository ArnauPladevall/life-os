"use client";

import { Clock3, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CITIES = [
  { label: "Madrid", tz: "Europe/Madrid" },
  { label: "London", tz: "Europe/London" },
  { label: "New York", tz: "America/New_York" },
  { label: "Tokyo", tz: "Asia/Tokyo" },
];

export default function ClockApp() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const localTZ = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const headerDate = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const bigTime = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <Clock3 size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Tiempo</div>
            <div className="text-sm text-white/40">{headerDate}</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-white/50 font-mono">
          <span>{localTZ}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="text-[11px] uppercase tracking-widest text-white/40">Local</div>
          <div className="mt-3 text-7xl md:text-8xl font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            {bigTime}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["Horario", "Zona", "Semana"].map((k) => (
              <div key={k} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-white/40">{k}</div>
                <div className="mt-1 text-sm text-white/80 font-mono">
                  {k === "Horario" ? now.toLocaleTimeString() : k === "Zona" ? localTZ : `W${getWeekNumber(now)}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white">World</div>
              <div className="text-sm text-white/40">Rápido para coordinar</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Globe2 size={18} className="text-white/80" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {CITIES.map((c) => (
              <div key={c.tz} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <div className="text-sm font-semibold text-white">{c.label}</div>
                  <div className="text-[11px] text-white/40 font-mono">{c.tz}</div>
                </div>
                <div className="text-lg font-mono font-semibold text-white/90">
                  {formatInTZ(now, c.tz)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatInTZ(d: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone, hour: "2-digit", minute: "2-digit" }).format(d);
  } catch {
    return "--:--";
  }
}

function getWeekNumber(d: Date) {
  // ISO week
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
