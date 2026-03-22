import { publishEvent } from '@cab/messaging'
import { Topics } from '@cab/events'
import { randomUUID } from 'crypto'

export const publishDriverOnline = async (payload: {
  driverId:    string
  vehicleType: string
  lat:         number
  lng:         number
}) => {
  await publishEvent(Topics.DRIVER_ONLINE, {
    event: 'driver.online',
    data: {
      ...payload,
      occurredAt: new Date().toISOString()
    },
    metadata: {
      correlationId: randomUUID(),
      source:        'driver-service',
      version:       1
    }
  })
}

export const publishDriverOffline = async (payload: {
  driverId: string
}) => {
  await publishEvent(Topics.DRIVER_OFFLINE, {
    event: 'driver.offline',
    data: {
      ...payload,
      occurredAt: new Date().toISOString()
    },
    metadata: {
      correlationId: randomUUID(),
      source:        'driver-service',
      version:       1
    }
  })
}