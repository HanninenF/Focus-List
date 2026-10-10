import type { Weather } from "@/src/core/domain/weather";

export type CurrentWeather = Weather;

export interface WeatherService {
  getCurrentWeather(): Promise<CurrentWeather>;
}
