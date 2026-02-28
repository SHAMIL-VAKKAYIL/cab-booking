import { UserCreatedEvent, Topics } from '@cab/events'
import { publishEvent } from '@cab/messaging'
import { randomUUID } from 'crypto'

export const publishUserCreated = async (user: { id: string, email: string, role: "rider" | "driver" }) => {
    const event :UserCreatedEvent={
        event:"USER_CREATED",
        data:{
            userId:user.id,
            email:user.email,
            role:user.role,
            occurredAt:new Date().toISOString(),            
        },
        metadata:{
            correlationId:randomUUID(),
            source:'auth-service',
            version:1
        }
    }
    await publishEvent(Topics.USER_CREATED,event)
}