// import { Request, Response, NextFunction } from "express";

// /*
// Middleware: enforceDownloadSecurity (The Penalty Box)
// What it does: Stops bots from brute-forcing password-protected files.
// Rule: Max 5 wrong password attempts per wristband/IP per 10 minutes.

// HOW IT WORKS (The Senior Dev Trick):
// Middleware runs BEFORE the controller. So the middleware doesn't know 
// if the password the user typed is right or wrong. 
// Only the controller knows (because it checks the database).
// So, we export a helper function `recordFailedAttempt`. 
// If the controller sees a wrong password, it calls this function to 
// add a strike to the user's record.
// */

// const MAX_ATTEMPTS = 5;
// const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// interface Penalty { attempts: number; windowStart: number; lockedUntil?: number; }
// const penaltyBox = new Map<string, Penalty>();

// // Helper function for the controller to call when a password fails
// export function recordFailedAttempt(id: string) {
//     let record = penaltyBox.get(id);
//     if (!record) {
//         record = { attempts: 0, windowStart: Date.now() };
//         penaltyBox.set(id, record);
//     }
    
//     record.attempts += 1;
    
//     // If they hit 5 strikes, lock them out for 10 minutes
//     if (record.attempts >= MAX_ATTEMPTS) {
//         record.lockedUntil = Date.now() + WINDOW_MS; 
//     }
// }

// export function enforceDownloadSecurity(req: Request, res: Response, next: NextFunction) {
//     const id = (req as any).wristband || req.ip || "unknown";
//     const now = Date.now();

//     let record = penaltyBox.get(id);

//     // Clean up old records to save server RAM
//     if (record && now - record.windowStart > WINDOW_MS) {
//         penaltyBox.delete(id);
//         record = undefined;
//     }

//     // Check if they are currently locked out
//     if (record?.lockedUntil && now < record.lockedUntil) {
//         return res.status(429).json({
//             success: false,
//             error: {
//                 code: "TOO_MANY_ATTEMPTS",
//                 message: "Too many failed attempts. Locked for 10 minutes."
//             }
//         });
//     }

//     next();
// }



import { Request, Response, NextFunction } from "express";

/*
Middleware: enforceDownloadSecurity (The Penalty Box)
Rule: 5 wrong passwords per wristband/IP -> 10 minute lock.

FIXED BUGS (the multi-tab chaos):
1. Lock used to RENEW on every extra wrong attempt.
   Now it is stamped ONCE, at the exact moment the 5th failure lands.
2. Cleanup used to expire the record via windowStart, which could end
   the lock early. Now we only clean up when the lock is truly over.
3. After the lock expires, the next failure starts a FRESH cycle
   (the user gets all 5 attempts back).
*/

export const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface Penalty { attempts: number; windowStart: number; lockedUntil?: number; }
const penaltyBox = new Map<string, Penalty>();

// Called by the controller when a password is wrong
export function recordFailedAttempt(id: string) {
    const now = Date.now();
    let record = penaltyBox.get(id);

    // Already locked? Do NOT extend the lock. Change nothing.
    if (record?.lockedUntil && now < record.lockedUntil) return;

    // No record, or previous cycle finished -> fresh cycle
    if (!record || now - record.windowStart > WINDOW_MS || (record.lockedUntil && now >= record.lockedUntil)) {
        record = { attempts: 0, windowStart: now };
        penaltyBox.set(id, record);
    }

    record.attempts += 1;

    // Stamp the lock ONLY when crossing the threshold (the 5th failure)
    if (record.attempts === MAX_ATTEMPTS) {
        record.lockedUntil = now + WINDOW_MS;
    }
}

// Read by controller / metadata to report status
export function getPenaltyRecord(id: string) {
    const now = Date.now();
    const record = penaltyBox.get(id);
    if (!record) return { attempts: 0, lockedUntil: undefined as number | undefined };
    if (record.lockedUntil && now >= record.lockedUntil) return { attempts: 0, lockedUntil: undefined };
    if (now - record.windowStart > WINDOW_MS) return { attempts: 0, lockedUntil: undefined };
    return { attempts: record.attempts, lockedUntil: record.lockedUntil };
}

// Door guard: blocks locked users BEFORE the controller touches the DB
export function enforceDownloadSecurity(req: Request, res: Response, next: NextFunction) {
    const id = (req as any).wristband || req.ip || "unknown";
    const now = Date.now();
    const record = penaltyBox.get(id);

    if (record?.lockedUntil && now < record.lockedUntil) {
        return res.status(429).json({
            success: false,
            error: {
                code: "TOO_MANY_ATTEMPTS",
                message: "Too many failed attempts. Locked for 10 minutes.",
                lockedUntil: record.lockedUntil,
                retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
                attemptsLeft: 0,
            },
        });
    }
    next();
}