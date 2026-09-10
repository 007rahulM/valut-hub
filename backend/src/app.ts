//app.ts = the TV - it assembles the whole application
//it does not start the server that is server.ts 's  only job
import helmet from "helmet"; //security headers
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";  //rate limiting to prevent brute force attacks
import cookieParser from "cookie-parser"; 

//the 4 route files( the "departments" of our milroom)
import healthRoutes from "./routes/health.routes";
import fileRouter from "./routes/file.routes"; 
import uploadRouter from "./routes/upload.routes";
import downloadRouter from "./routes/download.routes";
import {assignWristband} from "./middleware/wristband";
import { error } from "node:console";
import uploadRoutesV2 from "./routes/upload.routes.v2";

const app=express();

//this helmet hides express headers ad sets strict browser security rules
app.use(helmet());

//rate limiting - limit request 
//1. trust proxy: tells express "I am behind Nginx, look at the X-Forwarded-For header for the real IP"
//   Whithout this , rate limiting fails because every user looks like 127.0.0.1
app.set("trust proxy",1); 

//the Cookie Parser allows express to read the secret cookies we will send to the browser
app.use(cookieParser());

app.use(assignWristband); //assign a secret wristband ID to every visitor (see wristband.ts )

//--------------General IP rate limiting---------
//stops bots from hammering the server and crashing Node.js
const generalLimiter=rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max:100, //limit each IP to 100 requests per 15 mins
    standardHeaders:true, //return rate limit info in the `RateLimit-*` headers
    legacyHeaders:false, //disable the `X-RateLimit-*` headers

    //for multipart chunk traffic has its own limmiter in upload.router.ts
    //so a legit big upload firs approx take 30+ part request  it must not eat the 
    //general buget and 429 the user in mid-upload so we will skip for that particular route

    skip:(req)=>req.path.startsWith("/api/upload/multipart/"),
    message:{
        success:false,
        error:{code:"TOO MANY REQUESTS", message:"Too many requests, please slow down"}
    }
});
app.use(generalLimiter); //apply to all requests



//-------------- CORS: the Vip guest list ------------

//the vip cuest list cors giguration
const allowOrigins=[
    "http://localhost:5173",    //our local vite frontend
    "http://localhost:4173",   //our local vite build running here 
    "http://localhost:3000",  // just in case we use port 3000
    "https://valut-hub.vercel.app",  //our live vercel frontend
    "https://sendly.page",  //our new domain 
    "https://www.sendly.page"   //domain with www

];

app.use(cors({
    origin: function(origin,callback){
        //1. allow tools like postman ,curl, or mobile pps(they dont have and origin)
        if(!origin) return callback(null,true);

        //2 check if the requesting wesbite is on our vip list or corsorigin list
        if(allowOrigins.indexOf(origin)=== -1){
            const msg = "CORS Policy: This site is not allowed to access the API";
            return callback(new Error(msg),false);
        }

        //3 they are on the list let them in 
        return callback(null,true);

    },
    credentials:true, // allows cookies/sessions if we ever need them 
}));     //allows us to make requests frontend to talk to backend


// ------ body parser------
app.use(express.json({limit:"10kb"}));   //parse JSON request bodies and dded   Add the 10kb limit to protect RAM 

//-------- mount the routes---------
//order here doesn't matter much (paths are all different),
//but all routes must come before the 404 ctcher below

app.use(healthRoutes);
app.use(fileRouter);
app.use(uploadRouter);
app.use(downloadRouter);
app.use(uploadRoutesV2); //new multipart V2 routes (co-exists with the old ones for now)



//------------ 404 catcher ---------
//express walks top-to-bottom if no router bove matches
//the request falls down to here -> clean JSON 404 instead of ugly HTML

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        error:{code:"NOT FOUND", message:"Route not found"},
    });
});


//------------- Global error handler (the safety net) ------
//Importnt : Express knows this is an Error handler
//Only because it has exactly 4 arguments (err , req , res, next)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[GlobalErrorHandler]", err);
    res.status(500).json({
        success: false,
        error: { code: "SERVER_ERROR", message: "Something went wrong" },
    });
});


export default app;