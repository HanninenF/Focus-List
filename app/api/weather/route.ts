import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/src/features/weather/get-current-weather";
import { getWeatherService } from "@/src/application/server-weather-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getCurrentWeather(getWeatherService()));
  } catch (error) {
    console.error("Weather request failed", error);
    return NextResponse.json(
      { error: "Vädret kunde inte hämtas." },
      { status: 502 },
    );
  }
}
