// import{Request, Response, NextFunction}from "express";
// import crypto from "crypto";

// /*
// Middleware : assignWristband
// What It does: gives every visitor a secret randome ID cookie(the "wristband")
//               If the browser already has one, we resues it

// WHY: Mobile hotspot IPs change constantly, so Ip alone can't identify a user ,
//      The Cookie ID stays stble even when the IP changes

// NOTE: The cookie is stores ONLY the ID  the usage counts live on our server(see uploadQuota.ts) - never in the cookie
// */

// export function assignWristband(req:Request,res:Response,next:NextFunction){
//     //cookie-parser (we wil wire it in app.ts) puts cookie on req.cookies
//     let id=(req as any).cookies?.sendly_id;
//     if(!id){
//         //first visit -> mint a new unguessable ID 
//         id=crypto.randomUUID();

//         res.cookie("sendly_id",id,{
//             httpOnly:true,   //browser JS can't read/copyit (anit-tramper)
//             sameSite:"none",   //not sent on cross-site requests
//             maxAge:365*24*60*60*1000, //keep the wristband 1 year 
//             //secure:true,  //we add this later when we are fully on HTTPS(sendly.app)

//         });
//     }

//     //stick it on the request so the next middleware can use it directly
//     (req as any).wristband=id;
//     next();
// }


import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/*
Middleware: assignWristband
Gives every visitor a random ID cookie (the "wristband").

FIX: sameSite "none" + secure:true, so the browser actually STORES the cookie
even when frontend and backend are on different domains (Vercel -> duckdns).
localhost is treated as a secure context by Chrome/Firefox, so local testing still works.
*/
export function assignWristband(req: Request, res: Response, next: NextFunction) {
    let id = (req as any).cookies?.sendly_id;
    if (!id) {
        id = crypto.randomUUID();
        res.cookie("sendly_id", id, {
            httpOnly: true,        // browser JS can't read/copy it
            sameSite: "none",      // FIX: allow cross-site storage
            secure: true,          // required with sameSite none (localhost counts as secure)
            maxAge: 365 * 24 * 60 * 60 * 1000,
        });
    }
    (req as any).wristband = id;
    next();
}