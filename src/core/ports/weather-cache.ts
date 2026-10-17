import type { CurrentWeather } from "@/src/core/ports/weather-service";

export interface WeatherCache {
  read(): Promise<CurrentWeather | null>;
  write(weather: CurrentWeather): Promise<void>;
}
