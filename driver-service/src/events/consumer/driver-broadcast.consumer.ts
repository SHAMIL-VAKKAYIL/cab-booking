import { createConsumer } from "@cab/messaging";
import { Topics } from "@cab/events";
import { logger } from "../../config/logger";
import { TripBroadCastInput } from "../../types";
import { DriverService } from "../../modules/driver/driver.service";


const driverService = new DriverService()

export const notifyTripReqToDriver = async () => {
    await createConsumer({
        groupId: 'driver-brodcast',
        topic: Topics.DRIVER_BROADCAST,
        fromBeginning: false,
        retries: 3,
        retryDelayMs: 1000,
        dlqTopic: 'driver.broadcast.dlq',
        eachMessage: async (
            { value }
        ) => {
            if (!value) return
            const { data } = value
            await driverService.broadCastTripRequst(data)
        }

    })
}