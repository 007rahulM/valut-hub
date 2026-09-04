const isDevelopmentV2 = import.meta.env.DEV;

export const multipartLogV2 = {
  info(message: string, details?: Record<string, unknown>): void {
    if (isDevelopmentV2) console.info("[MULTIPART V2]", message, details ?? "");
  },
  warn(message: string, details?: Record<string, unknown>): void {
    if (isDevelopmentV2) console.warn("[MULTIPART V2]", message, details ?? "");
  },
  error(message: string, details?: Record<string, unknown>): void {
    if (isDevelopmentV2) console.error("[MULTIPART V2]", message, details ?? "");
  },
};
