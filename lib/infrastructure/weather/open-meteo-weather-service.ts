import type { CurrentWeather, WeatherService } from "@/src/core/ports/weather-service";

export class OpenMeteoWeatherService implements WeatherService {
  async getCurrentWeather(): Promise<CurrentWeather> {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=57.721&longitude=12.940&current=temperature_2m,weather_code,is_day&timezone=Europe%2FStockholm";
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) throw new Error("Weather request failed");
    const data = await response.json() as { current?: { temperature_2m?: number; weather_code?: number; is_day?: number } };
    if (typeof data.current?.temperature_2m !== "number" || typeof data.current.weather_code !== "number" || typeof data.current.is_day !== "number") throw new Error("Weather data missing");
    return { temperature: data.current.temperature_2m, weatherCode: data.current.weather_code, isDay: data.current.is_day === 1, location: "Borås" };
  }
}
