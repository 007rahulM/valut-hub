
import {Request,Response} from "express";

export function healthCheck(req:Request,res: Response){
    res.json({status:"ok" , timestamp:new Date().toISOString()});

}

export function rootInfo(req: Request, res:Response){
    res.json("VaultHub Backend API is running  smoothly");

}

