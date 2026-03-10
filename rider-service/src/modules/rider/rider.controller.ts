import {Request,Response,NextFunction} from "express";
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

export const getRiderProfile =async(req:Request,res:Response)=>{
    const userId = req.headers['user-id'] as string

    try {
        const rider = await RiderService.prototype.getProfile(userId)
        return res.status(200).json({message:'rider profile fetch successfully',rider })
    } catch (error) {
        logger.error({error},"Error in rider profile get")
        return res.status(500).json({message:"Failed to Get rider profile", error})
    }
}

export const rideHistoryController = {

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.headers['user-id'] as string
      const page    = parseInt(req.query.page as string)  || 1
      const limit   = parseInt(req.query.limit as string) || 10

      const result = await RiderService.prototype.getHistory(riderId, page, limit)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },

  async getTripDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.headers['user-id'] as string
      const { tripId } = req.params as {tripId:string}

      const record = await RiderService.prototype.getTripDetail(riderId, tripId)
      res.status(200).json({ data: record })
    } catch (err) {
      next(err)
    }
  }
}