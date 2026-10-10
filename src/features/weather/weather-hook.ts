"use client";

import { useEffect, useState } from "react";
import type { Weather } from "@/src/core/domain/weather";

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let disposed = false;
    const loadWeather = async () => {
      try {
        const response = await fetch("/api/weather", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as Weather;
        if (!disposed) setWeather(data);
      } catch {
        // Behåll senast lyckade vädervärde om nätverket tillfälligt saknas.
      }
    };
    const refreshOnFocus = () => { if (document.visibilityState === "visible") void loadWeather(); };
    void loadWeather();
    const interval = window.setInterval(() => { void loadWeather(); }, 10 * 60 * 1000);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, []);

  return weather;
}
