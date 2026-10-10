import type { WeatherService } from "@/lib/application/ports/weather-service";
import { OpenMeteoWeatherService } from "./open-meteo-weather-service";

export function createWeatherService(): WeatherService {
  return new OpenMeteoWeatherService();
}
