import { NextResponse } from "next/server";
import { readRequestObject } from "@/app/api/request-body";
import { todoRepository } from "@/src/application/server-data-services";
import { FocusAreaAlreadyExistsError } from "@/src/core/domain/focus-area-errors";
import {
  addFocusArea,
  isValidFocusAreaName,
  listFocusAreas,
} from "@/src/application/focus-areas/focus-area-application-service";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(listFocusAreas(todoRepository));
}

export async function POST(request: Request) {
  const body = await readRequestObject(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!isValidFocusAreaName(name))
    return NextResponse.json({ error: "Namn saknas" }, { status: 400 });
  try {
    const id = addFocusArea(todoRepository, name);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof RangeError)
      return NextResponse.json({ error: "Namn saknas" }, { status: 400 });
    if (!(error instanceof FocusAreaAlreadyExistsError))
      return NextResponse.json(
        { error: "Fokusområdet kunde inte sparas" },
        { status: 500 },
      );
    return NextResponse.json(
      { error: "Fokusområdet finns redan" },
      { status: 409 },
    );
  }
}
