import { describe, expect, it } from "vitest";
import {
  GET as getFocusAreas,
  POST as postFocusArea,
} from "@/app/api/focus-areas/route";
import { GET as getItems, POST as postItems } from "@/app/api/items/route";
import { POST as postLinks } from "@/app/api/item-links/route";

async function status(response: Response) {
  return response.status;
}

describe("API route contracts", () => {
  it("returns collection responses for valid list requests", async () => {
    const focusAreasResponse = await getFocusAreas();
    const itemsResponse = getItems(new Request("http://localhost/api/items"));

    expect(focusAreasResponse.status).toBe(200);
    expect(itemsResponse.status).toBe(200);
    expect(Array.isArray(await focusAreasResponse.json())).toBe(true);
    expect(Array.isArray(await itemsResponse.json())).toBe(true);
  });

  it("rejects invalid focus IDs", async () => {
    const response = getItems(
      new Request("http://localhost/api/items?focusId=0"),
    );
    expect(await status(response)).toBe(400);
  });

  it("rejects malformed JSON bodies", async () => {
    const request = (path: string) =>
      new Request(`http://localhost${path}`, {
        method: "POST",
        body: "not-json",
      });
    expect(await status(await postItems(request("/api/items")))).toBe(400);
    expect(await status(await postFocusArea(request("/api/focus-areas")))).toBe(
      400,
    );
    expect(await status(await postLinks(request("/api/item-links")))).toBe(400);
  });
});
