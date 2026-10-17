import type { FocusArea } from "@/src/core/domain/focus-area";
import type { FocusAreaApi } from "@/src/core/ports/focus-area-api";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import { ApiError } from "@/src/infrastructure/http/api-error";
import {
  expectArray,
  isFocusArea,
  readJson,
} from "@/src/infrastructure/http/response-validation";

async function request(init?: RequestInit) {
  const response = await fetch("/api/focus-areas", init);
  if (!response.ok)
    throw new ApiError(
      `Fokusområdesanropet misslyckades (${response.status}).`,
      response.status,
    );
  return response;
}

async function getFocusAreas(
  cancellation?: CancellationToken,
): Promise<FocusArea[]> {
  const controller = new AbortController();
  const unsubscribe = cancellation?.onCancel(() => controller.abort());
  try {
    return expectArray(
      await readJson(
        await request({ cache: "no-store", signal: controller.signal }),
      ),
      isFocusArea,
    );
  } finally {
    unsubscribe?.();
  }
}

async function postFocusArea(name: string): Promise<void> {
  await request({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export const focusAreaApiClient: FocusAreaApi = {
  getFocusAreas,
  postFocusArea,
};
