// ============================================================
// features.ts — FEATURE FLAGS
//
// This file controls which experimental features are ON or OFF.
//
// HOW IT WORKS:
//   - import.meta.env.DEV = true when running `npm run dev`
//   - import.meta.env.DEV = false in production builds
//   - VITE_FEATURE_* = env vars you can set in Vercel later
//
// CURRENT BEHAVIOR:
//   - In dev: both features are ON (you can test them)
//   - In production: both features are OFF (hidden from users)
//
// TO LAUNCH LATER:
//   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
//   2. Add: VITE_FEATURE_SHARE_QR = true
//   3. Add: VITE_FEATURE_EMBED_PASSWORD = true
//   4. Redeploy → features go live
//
// TO HIDE AGAIN:
//   Delete those env vars and redeploy. That's it.
// ============================================================

export const FEATURES = {
  // Branded QR share card (preview + copy + download + share sheet)
  shareQr: import.meta.env.DEV || import.meta.env.VITE_FEATURE_SHARE_QR === "true",

  // Embed password in link using #fragment (opt-in switch)
  embedPassword: import.meta.env.DEV || import.meta.env.VITE_FEATURE_EMBED_PASSWORD === "true",
};