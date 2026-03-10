import { DriverRatedEvent, Topics } from '@cab/events'
import { publishEvent } from '@cab/messaging'
import { randomUUID } from 'crypto'

export const publishDriverRated = async (payload: {
    driverId: string
    riderId: string
    tripId: string
    score: number
}) => {

    const event: DriverRatedEvent = {
        event: "DRIVER_RATED",
        data: {
            driverId: payload.driverId,
            riderId: payload.riderId,
            tripId: payload.tripId,
            score: payload.score,
            occurredAt: new Date().toISOString(),
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'rider-service',
            version: 1
        }
    }
    await publishEvent(Topics.DRIVER_RATED, event)

}
