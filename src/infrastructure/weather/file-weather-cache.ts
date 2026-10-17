import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CurrentWeather } from "@/src/core/ports/weather-service";
import type { WeatherCache } from "@/src/core/ports/weather-cache";

const DEFAULT_WEATHER_CACHE_PATH = path.join(
  process.cwd(),
  "data",
  "weather-cache.json",
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
  if (!isRecord(value)) return false;
  return (
    typeof value.temperature === "number" &&
    Number.isFinite(value.temperature) &&
    typeof value.weatherCode === "number" &&
    Number.isInteger(value.weatherCode) &&
    typeof value.isDay === "boolean" &&
    typeof value.location === "string" &&
    value.location.trim().length > 0
  );
}

export class FileWeatherCache implements WeatherCache {
  constructor(private readonly cachePath = DEFAULT_WEATHER_CACHE_PATH) {}

  async read(): Promise<CurrentWeather | null> {
    try {
      const value: unknown = JSON.parse(await readFile(this.cachePath, "utf8"));
      return isCurrentWeather(value) ? value : null;
    } catch {
      return null;
    }
  }

  async write(weather: CurrentWeather): Promise<void> {
    const temporaryPath = `${this.cachePath}.${randomUUID()}.tmp`;
    try {
      await mkdir(path.dirname(this.cachePath), { recursive: true });
      await writeFile(temporaryPath, JSON.stringify(weather), "utf8");
      await rename(temporaryPath, this.cachePath);
    } catch {
      // Cachefel ska inte göra ett lyckat väderanrop till ett fel.
      await unlink(temporaryPath).catch(() => undefined);
    }
  }
}
