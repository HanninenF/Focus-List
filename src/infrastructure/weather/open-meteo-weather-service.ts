import type { WeatherCache } from "@/src/core/ports/weather-cache";
import type {
  CurrentWeather,
  WeatherService,
} from "@/src/core/ports/weather-service";
import { parseOpenMeteoWeather } from "./open-meteo-parser";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=57.721&longitude=12.940&current=temperature_2m,weather_code,is_day&timezone=Europe%2FStockholm";
const WEATHER_LOCATION = "Borås";
const RETRY_DELAYS_MS = [0, 500, 1500] as const;
const WEATHER_TIMEOUT_MS = 8_000;
type Sleep = (milliseconds: number) => Promise<void>;

export class OpenMeteoWeatherService implements WeatherService {
  constructor(
    private readonly cache: WeatherCache,
    private readonly sleep: Sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  ) {}

  async getCurrentWeather(): Promise<CurrentWeather> {
    let lastError: unknown;
    for (const delay of RETRY_DELAYS_MS) {
      if (delay) await this.sleep(delay);
      try {
        const response = await fetch(WEATHER_URL, {
          signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
          next: { revalidate: 600 },
        });
        if (!response.ok) throw new Error("Weather request failed");
        const data: unknown = await response.json();
        const weather = parseOpenMeteoWeather(data, WEATHER_LOCATION);
        if (!weather) throw new Error("Weather data missing");
        await this.cache.write(weather);
        return weather;
      } catch (error) {
        lastError = error;
      }
    }
    const cachedWeather = await this.cache.read();
    if (cachedWeather?.location === WEATHER_LOCATION) return cachedWeather;
    throw lastError ?? new Error("Weather request failed");
  }
}
