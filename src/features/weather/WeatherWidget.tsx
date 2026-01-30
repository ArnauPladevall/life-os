"use client";

import { CloudSun, Loader2 } from "lucide-react";
import { useWeather, weatherLabel } from "./useWeather";

import type { WidgetSize } from "@/features/lobby/SmartWidget";

export default function WeatherWidget({ size }: { size: WidgetSize }) {
  const { loading, error, location, current, hourly, daily } = useWeather();

  const compact = size === "1x1";
  const wide = size === "4x2";

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
            <CloudSun size={16} className="text-white/80" />
          </div>
          <div className="text-sm font-semibold text-white">Clima</div>
        </div>
        {loading ? <Loader2 size={14} className="text-white/30 animate-spin" /> : <div className="text-[10px] text-white/40">{location?.name}</div>}
      </div>

      <div className={`flex-1 rounded-3xl bg-white/5 border border-white/10 p-4 flex flex-col ${wide ? "gap-4" : "justify-between"}`}>
        <div className="flex items-end justify-between">
          <div>
            {!compact && <div className="text-[11px] uppercase tracking-widest text-white/40">Ahora</div>}
            <div className={`mt-1 ${compact ? "text-4xl" : wide ? "text-6xl" : "text-5xl"} font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40`}>
              {current ? `${Math.round(current.temp)}°` : "--"}
            </div>
            {!compact && <div className="mt-1 text-sm text-white/60">{error ? error : weatherLabel(current?.code)}</div>}
          </div>
          {!compact && (
            <div className="text-right">
              <div className="text-[10px] text-white/40">Viento</div>
              <div className="text-xs font-mono text-white/70">{current ? `${Math.round(current.wind)} km/h` : "—"}</div>
            </div>
          )}
        </div>

        {wide && hourly && (
          <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35">Próximas horas</div>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {hourly.time.slice(0, 6).map((t, idx) => (
                <div key={t} className="rounded-2xl bg-white/5 border border-white/10 p-2 text-center">
                  <div className="text-[10px] text-white/40 font-mono">
                    {new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/80">{Math.round(hourly.temp[idx])}°</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!compact && daily && (
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span>Hoy</span>
            <span className="font-mono">
              {Math.round(daily.tempMin[0])}° · {Math.round(daily.tempMax[0])}°
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
