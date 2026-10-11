type WeatherIconRange = Readonly<{ max: number; icon: string }>;
const WEATHER_CODE_LIMITS = {
  clear: 0,
  partlyCloudy: 3,
  fog: 48,
  rain: 67,
  snow: 77,
  heavyRain: 82,
  heavySnow: 94,
  maximum: Number.POSITIVE_INFINITY,
} as const;

const dayIcons: WeatherIconRange[] = [
  { max: WEATHER_CODE_LIMITS.clear, icon: "☀️" },
  { max: WEATHER_CODE_LIMITS.partlyCloudy, icon: "⛅" },
  { max: WEATHER_CODE_LIMITS.fog, icon: "🌫️" },
  { max: WEATHER_CODE_LIMITS.rain, icon: "🌧️" },
  { max: WEATHER_CODE_LIMITS.snow, icon: "🌨️" },
  { max: WEATHER_CODE_LIMITS.heavyRain, icon: "🌧️" },
  { max: WEATHER_CODE_LIMITS.heavySnow, icon: "🌨️" },
  { max: WEATHER_CODE_LIMITS.maximum, icon: "⛈️" },
];

const nightIcons: WeatherIconRange[] = [
  { max: WEATHER_CODE_LIMITS.clear, icon: "🌙" },
  { max: WEATHER_CODE_LIMITS.partlyCloudy, icon: "🌙☁️" },
  { max: WEATHER_CODE_LIMITS.fog, icon: "🌫️" },
  { max: WEATHER_CODE_LIMITS.rain, icon: "🌧️" },
  { max: WEATHER_CODE_LIMITS.snow, icon: "🌨️" },
  { max: WEATHER_CODE_LIMITS.heavyRain, icon: "🌧️" },
  { max: WEATHER_CODE_LIMITS.heavySnow, icon: "🌨️" },
  { max: WEATHER_CODE_LIMITS.maximum, icon: "⛈️" },
];

export function weatherIcon(code: number, isDay: boolean) {
  return (isDay ? dayIcons : nightIcons).find((range) => code <= range.max)?.icon ?? "🌤️";
}
