import {Request, Response, NextFunction} from "express";

/*
Middleware: enforceUploadQuota (the VIP Guard)
What it does: Enforces per wristband limits inside a rolling 24 window:
              - max 3 files 
              - max 1.5Gb total volume
              -mac 500 MB per single file
    
How it reset works: Each wristband has a windowStatrt timestamp. When a request arrives More than 24h after windowStart timestamo when  request arrives
                   More than 24h after windowState,c ounter wipe to 0 automatically.
                   No cron, no user action, no cookie deletion needed

Honest limiation: The ledger lives in server RAM -> a PM2 wipes it. 
                  Acceptable for now(Ip limiter + S3 lifecycle are the backstops)
                  When we scale , we swap this Mao for Redis 

*/


//-------rules (edit anytime, they are ust constants)-----
const MAX_FILES_PER_DAY=7;
const MAX_BYTES_PER_DAY=1.5 *1024*1024*1024;  //1.5 GB
const MAX_SINGLE_FILE = 500 *1024*1024; //500 MB
const WINDOW_MS=24*60*60*1000; //24 hours 


//the ledger : wristbandId ->  usage inside the current window
interface Usage{files:number, bytes:number; windowStart:number;}
const ledger = new Map<string, Usage>();

// export function enforceUploadQuota(req:Request,res:Response,next:NextFunction){
//     const id=(req as any).wristband || req.ip || "unknown";
//     const now = Date.now();
    
//     let usage=ledger.get(id);

//     //rolling 24h reset ->  fresh quota for a new day 
//     if(!usage || now - usage.windowStart > WINDOW_MS){
//         usage={files:0, bytes:0, windowStart:now};
//         ledger.set(id, usage);
//     }


//    //sizeBytes comes from the JSON body -> this middleware must run after express.json()
//    const requestedBytes = Number(req.body.sizeBytes) || 0;

//    //Check 1: single file too big?
//    if(requestedBytes > MAX_SINGLE_FILE){
//     return res.status(413).json({
//         success:false,
//         error:{code:"FILE_TOO_LARGE", message:`File exceeds max size of ${MAX_SINGLE_FILE} bytes`},
//     });
//    }
   
//    //check 2: too many files today?
//    if(usage.files + 1 > MAX_FILES_PER_DAY){
//     return res.status(429).json({
//         success:false,
//         error:{code:"DAILY_FILE_LIMIT_EXCEEDED", message:`Upload quota exceeded: max ${MAX_FILES_PER_DAY} files per 24h`},
//     });
//    }

//    //check 3: too many bytes today?
//    if(usage.bytes + requestedBytes > MAX_BYTES_PER_DAY){
//     return res.status(429).json({
//         success:false,
//         error:{code:"UPLOAD_QUOTA_EXCEEDED", message:`Upload quota exceeded: max ${MAX_BYTES_PER_DAY} bytes per 24h`},
//     });
//    }

//    //Passed everything-> record it , then let the request rech the controller
//    // (we record only after passing , so rejected requests don't eat quota)
//    usage.files +=1;
//    usage.bytes += requestedBytes;
//    next();
   

// }


// uploadQuota.ts — CHECK ONLY, do not increment here anymore
export function enforceUploadQuota(req:Request,res:Response,next:NextFunction){
    const id=(req as any).wristband || req.ip || "unknown";
    const now = Date.now();

    let usage=ledger.get(id);

    if(!usage || now - usage.windowStart > WINDOW_MS){
        usage={files:0, bytes:0, windowStart:now};
        ledger.set(id, usage);
    }

    const requestedBytes = Number(req.body.sizeBytes) || 0;

    if(requestedBytes > MAX_SINGLE_FILE){
        return res.status(413).json({ success:false, error:{code:"FILE_TOO_LARGE", message:`File exceeds max size of ${MAX_SINGLE_FILE} bytes`} });
    }

    // Check against CONFIRMED usage only — don't reserve yet
    if(usage.files + 1 > MAX_FILES_PER_DAY){
        return res.status(429).json({ success:false, error:{code:"DAILY_FILE_LIMIT_EXCEEDED", message:`Upload quota exceeded: max ${MAX_FILES_PER_DAY} files per 24h`} });
    }
    if(usage.bytes + requestedBytes > MAX_BYTES_PER_DAY){
        return res.status(429).json({ success:false, error:{code:"UPLOAD_QUOTA_EXCEEDED", message:`Upload quota exceeded: max ${MAX_BYTES_PER_DAY} bytes per 24h`} });
    }

    // NOTE: no increment here anymore — that moved to the completion handler
    next();
}

// New exported helper — call this ONLY when an upload is confirmed successful
export function recordSuccessfulUpload(wristbandId: string, bytes: number) {
    const usage = ledger.get(wristbandId);
    if (usage) {
        usage.files += 1;
        usage.bytes += bytes;
    }
}