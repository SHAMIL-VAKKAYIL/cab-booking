import {createConsumer} from '@cab/messaging'
import {Topics,UserCreatedEvent} from '@cab/events'
import { RiderService } from '../modules/rider/rider.service'


export const startUserCreatedConsumer = async () => {
    await createConsumer({
        groupId: 'rider-service-group',
        topic: Topics.USER_CREATED,

        eachMessage: async ({ value }) => {
            const event = value as UserCreatedEvent
            console.log(event);
            if (event.data.role !== "rider") {
                return;
            }
            await RiderService.prototype.createRider(event.data)
        }
    })
}