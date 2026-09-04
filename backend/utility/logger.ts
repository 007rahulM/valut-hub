// backend/src/utils/logger.ts
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("[DEV]", ...args);
  }
};
export const error = (...args: any[]) => {
  console.error("[PROD ERROR]", ...args); // Always log errors in production
};