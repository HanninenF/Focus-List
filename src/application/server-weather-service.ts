import { createWeatherService } from "@/src/infrastructure/weather";

const weatherService = createWeatherService();

export function getWeatherService() {
  return weatherService;
}
