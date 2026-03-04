import { createConsumer } from '@cab/messaging'
import { Topics, UserCreatedEvent } from '@cab/events'
import { DriverService } from '../../modules/driver/driver.service'


export const startUserCreatedSubscriber = async () => {
    await createConsumer({
        groupId: 'driver-service-group',
        topic: Topics.USER_CREATED,

        eachMessage: async ({ value }) => {
            const event = value as UserCreatedEvent
            console.log(event);
            if (event.data.role !== "driver") {
                return;
            }
            await DriverService.prototype.createDriver(event.data)
        }
    })
}