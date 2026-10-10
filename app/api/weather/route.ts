import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/application/get-current-weather";
import { createWeatherService } from "@/lib/infrastructure/weather";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getCurrentWeather(createWeatherService()));
  } catch {
    return NextResponse.json({ error: "Vädret kunde inte hämtas." }, { status: 502 });
  }
}
