import { createLogger } from "@cab/observability";

export const logger: ReturnType<typeof createLogger> =
  createLogger("messaging-service");
