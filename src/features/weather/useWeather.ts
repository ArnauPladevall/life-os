"use client";

import { useEffect, useState } from "react";

type WeatherState = {
  loading: boolean;
  error?: string;
  location?: { lat: number; lon: number; name: string };
  current?: { temp: number; wind: number; code: number; time: string };
  hourly?: { time: string[]; temp: number[]; code: number[] };
  daily?: { time: string[]; tempMax: number[]; tempMin: number[] };
};

const MADRID = { lat: 40.4168, lon: -3.7038, name: "Madrid" };

export function useWeather() {
  const [state, setState] = useState<WeatherState>({ loading: true });

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      const getPos = () =>
        new Promise<GeolocationPosition>((res, rej) => {
          if (!navigator.geolocation) return rej(new Error("no geolocation"));
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 3500, maximumAge: 60_000 });
        });

      let loc = MADRID;
      try {
        const pos = await getPos();
        loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Tu zona" };
      } catch {
        // fallback
      }

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(loc.lat)}&longitude=${encodeURIComponent(loc.lon)}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();
        const cw = json?.current_weather;
        if (!cw) throw new Error("bad response");
        const hourly = json?.hourly && Array.isArray(json.hourly.time)
          ? { time: json.hourly.time as string[], temp: json.hourly.temperature_2m as number[], code: json.hourly.weathercode as number[] }
          : undefined;
        const daily = json?.daily && Array.isArray(json.daily.time)
          ? { time: json.daily.time as string[], tempMax: json.daily.temperature_2m_max as number[], tempMin: json.daily.temperature_2m_min as number[] }
          : undefined;
        const next: WeatherState = {
          loading: false,
          location: loc,
          current: { temp: cw.temperature, wind: cw.windspeed, code: cw.weathercode, time: cw.time },
          hourly,
          daily,
        };
        if (!cancelled) setState(next);
      } catch {
        if (!cancelled) setState({ loading: false, error: "No disponible", location: loc });
      }
    };

    resolve();
    const id = window.setInterval(resolve, 10 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return state;
}

export function weatherLabel(code: number | undefined) {
  if (code == null) return "—";
  if (code === 0) return "Despejado";
  if (code === 1 || code === 2) return "Poco nuboso";
  if (code === 3) return "Nublado";
  if (code >= 45 && code <= 48) return "Niebla";
  if (code >= 51 && code <= 57) return "Llovizna";
  if (code >= 61 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 95) return "Tormenta";
  return "Variable";
}
