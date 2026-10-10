import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/src/features/weather/get-current-weather";
import { createWeatherService } from "@/src/infrastructure/weather";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getCurrentWeather(createWeatherService()));
  } catch {
    return NextResponse.json({ error: "Vädret kunde inte hämtas." }, { status: 502 });
  }
}
