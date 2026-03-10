import { createConsumer } from '@cab/messaging'
import { Topics, UserCreatedEvent } from '@cab/events'
import { DriverService } from '../../modules/driver/driver.service'

const driverService = new DriverService()

export const startUserCreatedSubscriber = async () => {
    await createConsumer({
        groupId: 'driver-service-group',
        topic: Topics.USER_CREATED,
        fromBeginning: false,
        retries:       3,
        retryDelayMs:  1000,
        dlqTopic:      'user.created.dlq',
        eachMessage: async ({ value }) => {
            const event = value as UserCreatedEvent
            if (event.data.role !== "driver") {
                return;
            }
            await driverService.createDriver(event.data)
        }
    })
}