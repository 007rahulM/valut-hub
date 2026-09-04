// import { Router } from "express";
// import rateLimit from "express-rate-limit";
// import { enforceUploadQuota } from "../middleware/uploadQuota";
// import {
//   abortMultipartV2,
//   completeMultipartV2,
//   getPartUrlV2,
//   startMultipartV2,
// } from "../controllers/upload.controller.v2";

// /**
//  * Sendly multipart routes V2.
//  *
//  * This is a new route file. The old upload.routes.ts is not changed.
//  * Every endpoint has /api/v2/ so both versions can exist during testing.
//  */

// const router = Router();

// const multipartLimiterV2 = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     error: {
//       code: "MULTIPART_RATE_LIMITED",
//       message: "Too many multipart requests. Please slow down.",
//     },
//   },
// });

// // Large-file V2: open the S3 session and create the UPLOADING database row.
// router.post(
//   "/api/v2/upload/multipart/start",
//   multipartLimiterV2,
//   enforceUploadQuota,
//   startMultipartV2,
// );

// // Large-file V2: get permission for one numbered piece.
// router.post(
//   "/api/v2/upload/multipart/part",
//   multipartLimiterV2,
//   getPartUrlV2,
// );

// // Large-file V2: ask S3 to join all uploaded pieces and unlock the file.
// router.post(
//   "/api/v2/upload/multipart/complete",
//   multipartLimiterV2,
//   completeMultipartV2,
// );

// // Large-file V2: cancel S3 and mark the database row ABORTED.
// router.post(
//   "/api/v2/upload/multipart/abort",
//   multipartLimiterV2,
//   abortMultipartV2,
// );

// export default router;


import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { enforceUploadQuota } from "../middleware/uploadQuota";
import {
  abortMultipartV2,
  completeMultipartV2,
  getPartUrlV2,
  startMultipartV2,
} from "../controllers/upload.controller.v2";

/**
 * Sendly multipart routes V2.
 *
 * This is a new route file. The old upload.routes.ts is not changed.
 * Every endpoint has /api/v2/ so both versions can exist during testing.
 */

const router = Router();

const multipartLimiterV2 = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "MULTIPART_RATE_LIMITED",
      message: "Too many multipart requests. Please slow down.",
    },
  },
});

/**
 * Local test switch only.
 * The real seven-files-per-day quota stays active unless BOTH conditions are true:
 *   NODE_ENV=development
 *   MULTIPART_V2_TEST_MODE=true
 *
 * This cannot bypass the quota in production.
 */
const startQuotaV2 = (req: Request, res: Response, next: NextFunction): void => {
  const localTestMode =
    process.env.NODE_ENV === "development" &&
    process.env.MULTIPART_V2_TEST_MODE === "true";

  if (localTestMode) {
    next();
    return;
  }

  enforceUploadQuota(req, res, next);
};

// Large-file V2: open the S3 session and create the UPLOADING database row.
router.post(
  "/api/v2/upload/multipart/start",
  multipartLimiterV2,
  startQuotaV2,
  startMultipartV2,
);

// Large-file V2: get permission for one numbered piece.
router.post(
  "/api/v2/upload/multipart/part",
  multipartLimiterV2,
  getPartUrlV2,
);

// Large-file V2: ask S3 to join all uploaded pieces and unlock the file.
router.post(
  "/api/v2/upload/multipart/complete",
  multipartLimiterV2,
  completeMultipartV2,
);

// Large-file V2: cancel S3 and mark the database row ABORTED.
router.post(
  "/api/v2/upload/multipart/abort",
  multipartLimiterV2,
  abortMultipartV2,
);

export default router;
