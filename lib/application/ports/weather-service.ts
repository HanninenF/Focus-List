export type CurrentWeather = {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  location: string;
};

export interface WeatherService {
  getCurrentWeather(): Promise<CurrentWeather>;
}
