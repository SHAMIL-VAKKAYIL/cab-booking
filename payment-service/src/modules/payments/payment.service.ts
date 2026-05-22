import { eq } from "drizzle-orm";
import { db } from "../../db";
import { payments } from "../../db/schema";
import { razorpay } from "../../config/razorpay";
import { CreatePaymentInput, RefundPaymentInput } from "../../types";
import { logger } from "../../config/logger";
import {
  publishPaymentFailed,
} from "../../events/producers/payment.producer";

import { paymentSuccessTotal, paymentFailedTotal, paymentAmount } from '@cab/observability'

export class PaymentService {
  async processPayment(input: CreatePaymentInput) {
    const {
      amount,
      driverId,
      riderId,
      tripId,
      currency = "INR",
      riderEmail,
    } = input;

    // Validate amount is a valid positive number
    if (!amount || amount <= 0 || isNaN(amount)) {
      logger.error({ tripId, amount }, "Invalid payment amount");
      throw new Error(`Invalid payment amount: ${amount}`);
    }

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId));

    if (existing.length > 0) {
      logger.warn({ tripId }, "Payment already exists for this trip");
      return existing[0];
    }

    const [payment] = await db
      .insert(payments)
      .values({
        amount: amount.toString(),
        driverId,
        riderId,
        tripId,
        currency,
        status: "PENDING",
        updatedAt: new Date(),
      })
      .returning();

    try {
      logger.info({ tripId, amount, amountInPaise: amount * 100, currency }, "Creating Razorpay order");

      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: `rcpt_${tripId.slice(-8)}`, // Max 40 chars: rcpt_ + 8 chars = 13
        notes: {
          paymentId: payment.id,
          tripId,
          driverId,
          riderId,
          riderEmail,
        },
      });

      if (!order || !order.id) {
        throw new Error(`Invalid Razorpay order response: ${JSON.stringify(order)}`);
      }

      const orderId = order.id;
      const orderStatus = (order as any).status ?? "UNKNOWN";
      logger.info({ tripId, orderId, orderStatus }, "Razorpay order created successfully");

      const [updated] = await db
        .update(payments)
        .set({
          status: "PENDING",
          transactionId: orderId,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      paymentSuccessTotal.inc()
      paymentAmount.observe({amount: amount}, amount)

      logger.info(
        { tripId, paymentId: payment.id },
        "Payment processed successfully",
      );

      return updated;
      // return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        {
          tripId,
          paymentId: payment.id,
          error: errorMessage,
          rawError: error,
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Payment failed - Razorpay order creation error"
      );
      const [updated] = await db
        .update(payments)
        .set({
          status: "FAILED",
          failureReason: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      paymentFailedTotal.inc()

      // faildProducer
      await publishPaymentFailed({
        paymentId: payment.id,
        tripId,
        riderId,
        riderEmail,
        reason: errorMessage,
      });

      return updated;
    }
  }

  async refundPayment(input: RefundPaymentInput) {
    const { tripId, reason } = input;

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId));

    if (existing.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = existing[0];
    if (payment.status !== "SUCCESS") {
      throw new Error("Only successful payments can be refunded");
    }

    try {
    
      await razorpay.payments.refund(payment.transactionId!, {
        amount: parseInt(payment.amount) * 100,
        notes: {
          tripId,
          reason,
        },
      });

      const [updated] = await db
        .update(payments)
        .set({
          status: "REFUNDED",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      logger.info({ tripId }, "Razorpay refund initiated");
      return updated;
    } catch (error) {
      logger.error({ tripId }, "Failed to initiate Razorpay refund");
      throw new Error("Failed to initiate refund");
    }
  }

  async getPaymentByTrip(tripId: string) {
  const existing = await db
    .select()
    .from(payments)
    .where(eq(payments.tripId, tripId));

  if (existing.length === 0) {
    throw new Error('Payment not found');
  }

  const payment = existing[0];

  // only return what frontend needs, don't expose internal fields
  return {
    paymentId: payment.id,
    tripId: payment.tripId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    orderId: payment.transactionId, // this is order_xxx at PENDING stage
  };
}
}

