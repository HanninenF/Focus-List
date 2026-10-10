import type { CurrentWeather, WeatherService } from "./ports/weather-service";

export function getCurrentWeather(service: WeatherService): Promise<CurrentWeather> {
  return service.getCurrentWeather();
}
