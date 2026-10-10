export function weatherIcon(code: number, isDay: boolean) {
  if (!isDay) {
    if (code === 0) return "🌙";
    if (code <= 3) return "🌙☁️";
    if (code <= 48) return "🌫️";
    if (code <= 67 || (code >= 80 && code <= 82)) return "🌧️";
    if (code <= 77 || code >= 85) return "🌨️";
    if (code >= 95) return "⛈️";
  }
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67 || (code >= 80 && code <= 82)) return "🌧️";
  if (code <= 77 || code >= 85) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}
