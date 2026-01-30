"use client";

import { CloudSun, MapPin, Wind } from "lucide-react";
import { useWeather, weatherLabel } from "./useWeather";

export default function WeatherApp() {
  const { loading, error, location, current } = useWeather();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-white/5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
            <CloudSun size={22} className="text-white/90" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">Clima</div>
            <div className="text-sm text-white/40">{loading ? "Cargando..." : location?.name ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="text-[11px] uppercase tracking-widest text-white/40">Ahora</div>
          <div className="mt-3 text-8xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            {current ? `${Math.round(current.temp)}°` : "--"}
          </div>
          <div className="mt-2 text-base text-white/60">{error ? error : weatherLabel(current?.code)}</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Wind size={14} /> Viento
              </div>
              <div className="mt-2 text-lg font-mono text-white/90">{current ? `${Math.round(current.wind)} km/h` : "—"}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                <MapPin size={14} /> Coordenadas
              </div>
              <div className="mt-2 text-sm font-mono text-white/90">
                {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="text-lg font-semibold text-white">Notas</div>
          <div className="mt-2 text-sm text-white/60 leading-relaxed">
            Este módulo usa Open-Meteo (sin API key) y geolocalización del navegador. Si no das permiso, cae a Madrid.
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/70">
            Última lectura: <span className="font-mono">{current?.time ?? "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
