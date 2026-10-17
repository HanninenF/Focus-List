import type { FocusArea } from "@/src/core/domain/focus-area";
import type { FocusAreaApi } from "@/src/core/ports/focus-area-api";
import type { CancellationToken } from "@/src/core/ports/cancellation";

export function createFocusAreaService(api: FocusAreaApi) {
  return {
    loadFocusAreas: (cancellation?: CancellationToken): Promise<FocusArea[]> =>
      api.getFocusAreas(cancellation),
    createFocusArea: (name: string): Promise<void> => api.postFocusArea(name),
  };
}

export type FocusAreaService = ReturnType<typeof createFocusAreaService>;
