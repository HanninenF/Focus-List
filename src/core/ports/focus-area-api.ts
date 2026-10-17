import type { FocusArea } from "@/src/core/domain/focus-area";
import type { CancellationToken } from "@/src/core/ports/cancellation";

export interface FocusAreaApi {
  getFocusAreas(cancellation?: CancellationToken): Promise<FocusArea[]>;
  postFocusArea(name: string): Promise<void>;
}
