import { publishEvent } from "@cab/messaging";
import { Topics, PaymentFailedEvent, PaymentSuccessEvent } from "@cab/events";
import { randomUUID } from 'crypto'


export const publishPaymentSuccess = async (payload: {
    paymentId: string
    tripId: string
    riderId: string
    riderEmail: string
    driverId: string
    amount: number
    currency: string
    transactionId: string
}) => {
    const event: PaymentSuccessEvent = {
        event: 'PAYMENT_SUCCESS',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'payment-service',
            version: 1
        }
    }
    await publishEvent(Topics.PAYMENT_SUCCESS, event);
}

export const publishPaymentFailed = async (payload: {
    paymentId: string
    tripId: string
    riderId: string
    riderEmail: string
    reason: string
}) => {
    const event: PaymentFailedEvent = {
        event: 'PAYMENT_FAILED',
        data: {
            ...payload,
            occurredAt: new Date().toISOString()
        },
        metadata: {
            correlationId: randomUUID(),
            source: 'payment-service',
            version: 1
        }
    }

    await publishEvent(Topics.PAYMENT_FAILED, event);
}