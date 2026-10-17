import type {
  CurrentWeather,
  WeatherService,
} from "@/src/core/ports/weather-service";

export function getCurrentWeather(
  service: WeatherService,
): Promise<CurrentWeather> {
  return service.getCurrentWeather();
}
