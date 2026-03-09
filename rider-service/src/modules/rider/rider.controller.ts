import {Request,Response} from "express";
import { RiderService } from "./rider.service";
import { logger } from "../../config/logger";

export const profileCreation =async(req:Request,res:Response)=>{
    const userId = req.headers['user-id'] as string
    const {name,phone} = req.body
    try {
        const riderService = await RiderService.prototype.updateRiderProfile({name,phone,userId})
        return res.status(200).json({message:"Rider profile created successfully",riderService})
    } catch (error) {
        logger.error({error},"Error in rider profile creation")
        return res.status(500).json({message:"Failed to create rider profile", error})
    }
}