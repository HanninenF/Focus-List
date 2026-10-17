import type { CurrentWeather } from "@/src/core/ports/weather-service";

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (!isRecord(value) || !isRecord(value.current)) return false;
  const data = value.current;
  return (
    typeof data.temperature_2m === "number" &&
    Number.isFinite(data.temperature_2m) &&
    typeof data.weather_code === "number" &&
    Number.isInteger(data.weather_code) &&
    typeof data.is_day === "number" &&
    (data.is_day === 0 || data.is_day === 1)
  );
}

export function parseOpenMeteoWeather(
  value: unknown,
  location: string,
): CurrentWeather | null {
  if (!isOpenMeteoResponse(value) || !location.trim()) return null;
  return {
    temperature: value.current.temperature_2m,
    weatherCode: value.current.weather_code,
    isDay: value.current.is_day === 1,
    location,
  };
}
