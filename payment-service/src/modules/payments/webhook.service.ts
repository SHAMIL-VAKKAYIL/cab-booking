import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { payments } from '../../db/schema';
import { logger } from '../../config/logger';
import {
  publishPaymentSuccess,
  publishPaymentFailed,
} from '../../events/producers/payment.producer';

export class WebhookService {
  async handleRazorpayEvent(rawBody: Buffer, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      logger.warn('Invalid Razorpay webhook signature');
      throw new Error('Invalid signature');
    }

    const body = JSON.parse(rawBody.toString());
    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;

    if (event === 'payment.captured') {
      await this.handlePaymentCaptured(paymentEntity);
    }

    if (event === 'payment.failed') {
      await this.handlePaymentFailed(paymentEntity);
    }
  }

  private async handlePaymentCaptured(paymentEntity: any) {
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, orderId));

    if (existing.length === 0) {
      logger.warn({ orderId }, 'Payment record not found for order');
      return;
    }

    const payment = existing[0];

    if (payment.status === 'SUCCESS') {
      logger.info({ orderId }, 'Payment already marked success, skipping');
      return;
    }

    const [updated] = await db
      .update(payments)
      .set({
        status: 'SUCCESS',
        transactionId: paymentId,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    await publishPaymentSuccess({
      paymentId: updated.id,
      tripId: updated.tripId,
      riderId: updated.riderId,
      riderEmail: updated.riderEmail,
      driverId: updated.driverId,
      amount: Number(updated.amount),
      currency: updated.currency,
      transactionId: paymentId,
    });

    logger.info({ tripId: updated.tripId, paymentId }, 'Payment captured and success published');
  }

  private async handlePaymentFailed(paymentEntity: any) {
    const orderId = paymentEntity.order_id;

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, orderId));

    if (existing.length === 0) {
      logger.warn({ orderId }, 'Payment record not found for failed event');
      return;
    }

    const payment = existing[0];

    if (payment.status === 'FAILED') {
      logger.info({ orderId }, 'Payment already marked failed, skipping');
      return;
    }

    await db
      .update(payments)
      .set({
        status: 'FAILED',
        failureReason: paymentEntity.error_description,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    await publishPaymentFailed({
      paymentId: payment.id,
      tripId: payment.tripId,
      riderId: payment.riderId,
      riderEmail: payment.riderEmail,
      reason: paymentEntity.error_description,
    });

    logger.info({ tripId: payment.tripId }, 'Payment failed event published');
  }
}