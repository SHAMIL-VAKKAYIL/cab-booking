import { publishEvent } from '@cab/messaging'
import { Topics, FareCalculateReplyEvent } from '@cab/events'

export const publishFareCalculateReply = async (payload: {
    correlationId: string
    rideId: string
    success: boolean
    fare?: number
    distanceKm?: number
    durationMins?: number
    reason?: string
}) => {
    const event: FareCalculateReplyEvent = {
        event: 'FARE_CALCULATE_REPLY',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: payload.correlationId,
            source: 'pricing-service',
            version: 1
        }
    }
    await publishEvent(Topics.FARE_CALCULATE_REPLY, event)
}