import { createConsumer } from '@cab/messaging'
import { Topics, UserCreatedEvent } from '@cab/events'
import { db } from '../../db'
import { Driver } from '../../db/schema'
import { eq } from 'drizzle-orm'


export const startUserCreatedSubscriber = async () => {
    await createConsumer({
        groupId: 'driver-service-group',
        topic: Topics.USER_CREATED,

        eachMessage: async ({ value }) => {
            const event = value as UserCreatedEvent
            console.log(event);

        }
    })
}