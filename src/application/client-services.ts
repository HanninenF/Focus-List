import { createAiFormattingService } from "@/src/features/ai-formatting/format-text";
import { createFocusAreaService } from "@/src/features/focus-areas/focus-area-service";
import { createTodoService } from "@/src/features/todos/todo-service";
import { createItemLinkService } from "@/src/features/links/link-service";
import { focusAreaApiClient } from "@/src/infrastructure/http/focus-area-api-client";
import { llmApiClient } from "@/src/infrastructure/http/llm-api-client";
import { todoApiClient } from "@/src/infrastructure/http/todo-api-client";
import { itemLinkApiClient } from "@/src/infrastructure/http/item-link-api-client";

export const focusAreaService = createFocusAreaService(focusAreaApiClient);
export const todoService = createTodoService(todoApiClient);
export const itemLinkService = createItemLinkService(itemLinkApiClient);
export const aiFormattingService = createAiFormattingService(llmApiClient);
