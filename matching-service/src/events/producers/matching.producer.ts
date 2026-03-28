import { publishEvent } from '@cab/messaging'
import { Topics, DriverFindReplyEvent } from '@cab/events'

export const publishDriverFindReply = async (payload: {
  correlationId: string
  rideId:        string
  success:       boolean
  driverId?:     string
  reason?:       string
}) => {
  const event: DriverFindReplyEvent = {
    event: 'DRIVER_FIND_REPLY',
    data: {
      ...payload,
      occurredAt: new Date().toISOString()
    },
    metadata: {
      correlationId: payload.correlationId,
      source:        'matching-service',
      version:       1
    }
  }
  await publishEvent(Topics.DRIVER_FIND_REPLY, event)
}