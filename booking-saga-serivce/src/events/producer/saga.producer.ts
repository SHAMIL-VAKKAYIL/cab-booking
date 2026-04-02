import { publishEvent } from '@cab/messaging'
import { Topics, BookingConfirmedEvent, BookingFailedEvent } from '@cab/events'
import { randomUUID } from 'crypto'

export const publishFareCalculateCommand = async (payload: {
  correlationId:  string
  rideId:         string
  riderId:        string
  pickupLat:      number
  pickupLng:      number
  dropoffLat:     number
  dropoffLng:     number
  vehicleType:    string
}) => {
  await publishEvent(Topics.FARE_CALCULATE_COMMAND, {
    event: 'FARE_CALCULATE_COMMAND',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  })
}

export const publishDriverFindCommand = async (payload: {
  correlationId: string
  rideId:        string
  riderId:       string
  pickupLat:     number
  pickupLng:     number
  vehicleType:   string
}) => {
  await publishEvent(Topics.DRIVER_FIND_COMMAND, {
    event: 'DRIVER_FIND_COMMAND',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  })
}

export const publishTripCreateCommand = async (payload: {
  correlationId:  string
  rideId:         string
  riderId:        string
  driverId:       string
  pickupAddress:  string
  pickupLat:      number
  pickupLng:      number
  dropoffAddress: string
  dropoffLat:     number
  dropoffLng:     number
  vehicleType:    string
  estimatedFare:  number
}) => {
  await publishEvent(Topics.TRIP_CREATE_COMMAND, {
    event: 'TRIP_CREATE_COMMAND',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  })
}

export const publishDriverReleaseCommand = async (payload: {
  correlationId: string
  driverId:      string
  vehicleType:   string
}) => {
  await publishEvent(Topics.DRIVER_RELEASE_COMMAND, {
    event: 'DRIVER_RELEASE_COMMAND',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  })
}

export const publishBookingConfirmed = async (payload: {
  correlationId:  string
  rideId:         string
  riderId:        string
  driverId:       string
  tripId:         string
  estimatedFare:  number
  distanceKm:     number
  durationMins:   number
  vehicleType:    string
  pickupAddress:  string
  dropoffAddress: string
}) => {
  const event: BookingConfirmedEvent = {
    event: 'BOOKING_CONFIRMED',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  }
  await publishEvent(Topics.BOOKING_CONFIRMED, event)
}

export const publishBookingFailed = async (payload: {
  correlationId: string
  rideId:        string
  riderId:       string
  reason:        string
}) => {
  const event: BookingFailedEvent = {
    event: 'BOOKING_FAILED',
    data: { ...payload, occurredAt: new Date().toISOString() },
    metadata: {
      correlationId: payload.correlationId,
      source:        'booking-saga-service',
      version:       1
    }
  }
  await publishEvent(Topics.BOOKING_FAILED, event)
}