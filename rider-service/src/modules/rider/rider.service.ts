import {db} from '../../db'
import {rider} from '../../db/schema'
import {eq} from 'drizzle-orm'
import {logger} from '../../config/logger'
import {InitialRiderData,RiderProfile} from '../../types'



export class RiderService {
    async createRider(data:InitialRiderData){
        try {
            
            const {email,userId} = data

            const existingRider = await db.select().from(rider).where(eq(rider.user_id,userId))
            if (existingRider.length >0) {
                logger.info({ existingRider }, 'rider already exitsing ')
                return
            }

            await db.insert(rider).values({
                email,
                user_id:userId, 
                name:"",
                phone:"",
                status:'PENDING',
                isActive:true,
                createdAt:new Date(),
                updatedAt:new Date(),
            })
             logger.info({ email }, "rider created")
        } catch (error) {
            logger.error({ error }, 'rider creation faild')
            throw new Error('Failed to rider creation');
        }
    };
    async updateRiderProfile(data:RiderProfile){
        
        try {
            const {name,phone,userId} = data
            const existingRider = await db.select().from(rider).where(eq(rider.user_id,userId))
            if (existingRider.length === 0) {
                logger.info({ existingRider }, 'rider not found')
                return
            }
            await db.update(rider).set({
                name,
                phone,
                updatedAt:new Date(),
            }).where(eq(rider.user_id,userId))
            const updatedRider = await db.select().from(rider).where(eq(rider.user_id,userId));
            logger.info({ userId }, "rider profile updated")
            return updatedRider
        } catch (error) {
            logger.error({ error }, 'rider profile update faild')
            throw new Error('Failed to rider profile update');
        }
    }
}
