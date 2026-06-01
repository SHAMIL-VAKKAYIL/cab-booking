import { createConsumer } from "@cab/messaging";
import { DriverFindCommandEvent, Topics } from "@cab/events";
import { logger } from "../../config/logger";
import { MatchingService } from "../../modules/matching/matching.service";
import { publishDriverFindReply } from "../producers/matching.producer";


const matchingService = new MatchingService()


export const driverFoundCommand = async () => {
    await createConsumer({
        groupId: 'matching-service-driver-found',
        topic: Topics.DRIVER_FIND_COMMAND,
        fromBeginning: false,
        retries: 3,
        retryDelayMs: 1000,
        dlqTopic: 'driver.found.command.dlq',
        eachMessage: async ({ value }) => {
            if (!value) return

            const event = value as DriverFindCommandEvent
            const { driverId, rideId, vehicleType } = event.data

            try {
                // mark driver as busy before replying
                await matchingService.markDriverBusy(driverId, vehicleType)
                await publishDriverFindReply({
                    correlationId: event.metadata.correlationId,
                    rideId,
                    success: true,
                    driverId,
                })

            } catch (error) {
                logger.error({ error, correlationId: event.metadata.correlationId }, 'Failed to find driver')

                await publishDriverFindReply({
                    correlationId: event.metadata.correlationId,
                    rideId,
                    success: false,
                    reason: (error as Error).message,
                })
            }
        }
    })
}