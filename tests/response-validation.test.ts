import { describe, expect, it } from "vitest";
import {
  expectArray,
  isItemLink,
  isRecord,
} from "@/src/infrastructure/http/response-validation";
import { parseOpenMeteoWeather } from "@/src/infrastructure/weather/open-meteo-parser";
import { highlightMatches } from "@/src/features/markdown/markdown-service";

describe("response validation", () => {
  it("accepts only HTTP(S) item links", () => {
    const link = {
      id: 1,
      itemId: 2,
      title: "Docs",
      url: "https://example.com",
      createdAt: "now",
      updatedAt: "now",
    };
    expect(isItemLink(link)).toBe(true);
    expect(isItemLink({ ...link, url: "javascript:alert(1)" })).toBe(false);
  });

  it("rejects malformed arrays and non-objects", () => {
    expect(isRecord(null)).toBe(false);
    expect(() => expectArray([{ id: "bad" }], isItemLink)).toThrow();
  });

  it("parses only finite, structurally valid weather responses", () => {
    expect(
      parseOpenMeteoWeather(
        {
          current: { temperature_2m: 4.8, weather_code: 3, is_day: 0 },
        },
        "Borås",
      ),
    ).toEqual({
      temperature: 4.8,
      weatherCode: 3,
      isDay: false,
      location: "Borås",
    });
    expect(
      parseOpenMeteoWeather(
        {
          current: { temperature_2m: Number.NaN, weather_code: 3, is_day: 0 },
        },
        "Borås",
      ),
    ).toBeNull();
  });

  it("does not break tags containing a greater-than character in an attribute", () => {
    const html = '<a href="https://example.test/?q=1>2">Docs</a>';
    expect(highlightMatches(html, "docs")).toBe(
      '<a href="https://example.test/?q=1>2"><mark class="search-hit">Docs</mark></a>',
    );
  });
});
