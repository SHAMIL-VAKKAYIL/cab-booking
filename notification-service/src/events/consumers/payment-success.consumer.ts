import { createConsumer } from '@cab/messaging'
import { Topics, PaymentSuccessEvent } from '@cab/events'
import { NotificationService } from '../../modules/notification/notificaiton.service'
import { logger } from '../../config/logger'

const notificationService = new NotificationService()

export const startPaymentSuccessConsumer = async () => {
  await createConsumer({
    groupId:      'notification-service-payment-success',
    topic:        Topics.PAYMENT_SUCCESS,
    fromBeginning: false,
    retries:       3,
    retryDelayMs:  1000,
    dlqTopic:      'payment.success.dlq',

    eachMessage: async ({ value }) => {
      if (!value) return

      const event = value as PaymentSuccessEvent
      const { tripId, riderEmail, amount, transactionId } = event.data

      await notificationService.sendPaymentSuccess({
        riderEmail,
        tripId,
        amount,
        transactionId,
      })

      logger.info({ tripId }, 'Payment success notification sent')
    }
  })
}