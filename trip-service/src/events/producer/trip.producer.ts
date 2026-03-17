import { publishEvent } from '@cab/messaging'
import { Topics, TripCreateReplyEvent, TripStartedEvent, TripCompletedEvent, TripCancelledEvent } from '@cab/events'
import { randomUUID } from 'crypto'



export const publishTripCreateReply = async (payload: {
    correlationId: string
    tripId: string
    success: boolean
    reason?: string
}) => {
    const event: TripCreateReplyEvent = {
        event: 'TRIP_CREATE_REPLY',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: payload.correlationId,
            source: 'trip-service',
            version: 1
        }
    }
    await publishEvent(Topics.TRIP_CREATE_REPLY, event)
}

export const publishTripStarted = async (payload: {
    tripId: string
    riderId: string
    driverId: string
    startedAt: string
}) => {
    const event: TripStartedEvent = {
        event: 'TRIP_STARTED',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'trip-service',
            version: 1
        }
    }
    await publishEvent(Topics.TRIP_STARTED, event)
}

export const publishTripCompleted = async (payload: {
    tripId: string
    riderId: string
    driverId: string
    fare: number
    distanceKm: number
    durationMins: number
    pickupAddress: string
    dropoffAddress: string
    vehicleType: string
    startedAt: string
    completedAt: string
}) => {
    const event: TripCompletedEvent = {
        event: 'TRIP_COMPLETED',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'trip-service',
            version: 1
        }
    }
    await publishEvent(Topics.TRIP_COMPLETED, event)
}
export const publishTripCancelled = async (payload: {
    tripId: string
    riderId: string
    driverId?: string
    reason: string
    cancelledBy: string
    cancelledAt: string
}) => {
    const event: TripCancelledEvent = {
        event: 'TRIP_CANCELLED',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'trip-service',
            version: 1
        }
    }
    await publishEvent(Topics.TRIP_CANCELLED, event)
}