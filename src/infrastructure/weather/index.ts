import type { WeatherService } from "@/src/core/ports/weather-service";
import { OpenMeteoWeatherService } from "./open-meteo-weather-service";
export function createWeatherService(): WeatherService { return new OpenMeteoWeatherService(); }
