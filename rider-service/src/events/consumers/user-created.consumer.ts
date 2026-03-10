import {createConsumer} from '@cab/messaging'
import {Topics,UserCreatedEvent} from '@cab/events'
import { RiderService } from '../../modules/rider/rider.service'
import { consumerMessage } from '../../types'

const riderService = new RiderService()

export const startUserCreatedConsumer = async () => {
    await createConsumer({
        groupId: 'rider-service-group',
        topic: Topics.USER_CREATED,
        fromBeginning: false,
        retries:       3,
        retryDelayMs:  1000,
        dlqTopic:      'user.created.dlq',
        eachMessage: async ({ value }: consumerMessage) => {
            const event = value as UserCreatedEvent
            console.log(event);
            if (event.data.role !== "rider") {
                return;
            }
            await riderService.createRider(event.data)
        }
    })
}