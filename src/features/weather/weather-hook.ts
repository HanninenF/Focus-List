"use client";

import { useEffect, useState } from "react";
import type { Weather } from "@/src/core/domain/weather";

const WEATHER_STORAGE_KEY = "lugn-lista.latest-weather";
const WEATHER_TIMEOUT_MS = 8_000;

function isWeather(value: unknown): value is Weather {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const weather = value as Partial<Weather>;
  return (
    typeof weather.temperature === "number" &&
    Number.isFinite(weather.temperature) &&
    typeof weather.weatherCode === "number" &&
    Number.isInteger(weather.weatherCode) &&
    typeof weather.isDay === "boolean" &&
    typeof weather.location === "string" &&
    weather.location.trim().length > 0
  );
}

export function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let disposed = false;
    let requestVersion = 0;
    let activeController: AbortController | null = null;
    try {
      const cachedWeather = window.localStorage.getItem(WEATHER_STORAGE_KEY);
      if (cachedWeather) {
        const parsedWeather: unknown = JSON.parse(cachedWeather);
        if (isWeather(parsedWeather)) setWeather(parsedWeather);
      }
    } catch {
      // Ignorera saknad eller otillgänglig lokal cache.
    }

    const loadWeather = async () => {
      const version = ++requestVersion;
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;
      const timeout = window.setTimeout(
        () => controller.abort(),
        WEATHER_TIMEOUT_MS,
      );
      try {
        const response = await fetch("/api/weather", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!isWeather(data)) return;
        if (disposed || version !== requestVersion) return;
        setWeather(data);
        try {
          window.localStorage.setItem(
            WEATHER_STORAGE_KEY,
            JSON.stringify(data),
          );
        } catch {
          // Vädret ska fortfarande visas även om lokal lagring inte är tillgänglig.
        }
      } catch {
        // Behåll senast lyckade vädervärde om nätverket tillfälligt saknas.
      } finally {
        window.clearTimeout(timeout);
        if (activeController === controller) activeController = null;
      }
    };
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void loadWeather();
    };
    void loadWeather();
    const interval = window.setInterval(
      () => {
        void loadWeather();
      },
      10 * 60 * 1000,
    );
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      disposed = true;
      activeController?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, []);

  return weather;
}
